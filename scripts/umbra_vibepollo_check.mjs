#!/usr/bin/env node
// Umbra (Vibepollo)'s delta check: how far this tree is from the Vibepollo it is built on.
//
//   node scripts/umbra_vibepollo_check.mjs [vibepollo-ref]      (default: vibepollo/master)
//
// The same check as Umbra's scripts/umbra_check.mjs, for this edition (docs/umbra-vibepollo.md). Fails when:
//   1. a Vibepollo file this edition must never edit differs (README.md, the translations) -- identity for
//      those lives in src_assets/common/assets/web/umbra/;
//   2. a Vibepollo file NOT listed in scripts/umbra-vibepollo-delta.txt differs -- add it there, with its
//      reason, only if the change cannot live in a file of Umbra's own;
//   3. one of the identity hooks is missing.
// It prints every Vibepollo file this edition changes, with line counts, so the delta stays visible.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
const upstreamRef = process.argv[2] || "vibepollo/master";
const base = git("merge-base", "HEAD", upstreamRef);
const errors = [];

const NEVER_EDIT = [
  /^README\.md$/,
  /^src_assets\/common\/assets\/web\/public\/assets\/locale\/(ui\/)?[^/]+\.json$/,
];

const allowed = new Set(
  fs.readFileSync(path.join(root, "scripts/umbra-vibepollo-delta.txt"), "utf8")
    .split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim()).filter(Boolean),
);

// Vibepollo files = files present at the merge base. Compare the WORKING TREE, so uncommitted edits count.
const changed = git("diff", "--numstat", "--no-renames", "--diff-filter=MD", base, "--").split("\n").filter(Boolean)
  .map((l) => { const [a, d, f] = l.split("\t"); return { f, a, d }; });

for (const { f } of changed) {
  if (NEVER_EDIT.some((re) => re.test(f))) errors.push(`${f}: Vibepollo file this edition must not edit (use web/umbra/identity.ts)`);
  else if (!allowed.has(f)) errors.push(`${f}: Vibepollo file changed but not listed in scripts/umbra-vibepollo-delta.txt`);
}
for (const f of allowed) {
  if (!changed.some((c) => c.f === f)) console.log(`note: ${f} is listed in umbra-vibepollo-delta.txt but no longer differs -- drop it`);
}

function require(file, pattern, message) {
  const p = path.join(root, file);
  if (!fs.existsSync(p) || !pattern.test(fs.readFileSync(p, "utf8"))) errors.push(`${file}: ${message}`);
}
const web = "src_assets/common/assets/web";
require(`${web}/i18n.ts`, /applyUmbraIdentity\(messages\[locale\], locale\)/, "text-layer hook missing");
require(`${web}/main.ts`, /@\/umbra\/umbra\.css/, "colour import missing");
require(`${web}/views/OverviewView.vue`, /<UmbraCard \/>/, "Umbra card missing from the Overview page");
require(`${web}/components/layout/UpdateNotice.vue`, /PreceptorOfMagic\/Umbra-Vibepollo\/releases/, "web update notice must follow this edition's releases");
require("cmake/prep/build_version.cmake", /SUNSHINE_REPO_NAME "Umbra-Vibepollo"/, "tray update check must follow this edition's releases");
require("cmake/packaging/windows.cmake", /CPACK_PACKAGE_INSTALL_DIRECTORY "Apollo"/, "install folder must stay Apollo (in-place upgrade)");
require("CMakeLists.txt", /CPACK_WIX_UPGRADE_GUID "\{E3FA501A-85F8-4187-85A7-D6E6BDC7EDA1\}"/, "MSI upgrade code must stay Vibepollo's (in-place upgrade)");
require("packaging/windows/wix/custom_actions.wxs", /Name="ApolloService"/, "service key must stay ApolloService (in-place upgrade)");
require("packaging/windows/wix/custom_actions.wxs", /Value="Umbra \(Vibepollo\)" KeyPath="yes"/, "Programs list name missing");
require("packaging/windows/wix/custom_actions.wxs", /aurora-link\.exe/, "Eclipse Link firewall exclusion missing");
require("src/system_tray.cpp", /Open Umbra \(Vibepollo\)/, "tray menu does not name Umbra (Vibepollo)");
require("CMakeLists.txt", /project\(Umbra-Vibepollo\b/, "project name is not Umbra-Vibepollo");

const rows = changed.map(({ f, a, d }) => `${(a === "-" ? "bin" : `+${a}/-${d}`).padStart(10)}  ${f}`);
console.log(`Umbra (Vibepollo) vs Vibepollo ${git("describe", "--tags", "--always", base)} (${base.slice(0, 8)}): ${changed.length} Vibepollo files changed`);
for (const r of rows) console.log(r);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("\nOK");
