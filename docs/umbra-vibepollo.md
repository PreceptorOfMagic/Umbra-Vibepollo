# Umbra (Vibepollo): keeping it in step with Vibepollo and Umbra

Umbra (Vibepollo) is [Vibepollo](https://github.com/Nonary/Vibepollo) (Nonary) with Umbra's additions for Eclipse,
and as little else changed as possible. It follows the same method as Umbra itself
([umbra-upstream-sync.md](umbra-upstream-sync.md)): the base host is still maintained, so this edition merges its
updates instead of redoing its work, and everything below exists to keep those merges cheap.

## Two upstreams, one real merge history

Vibepollo and Umbra share the same Apollo base commit (`0cd32aba`, Apollo v0.4.6 + fixes). So this branch was made
with a **real `git merge`** of Umbra into Vibepollo, not a copy:

```
vibepollo/2.0.0 ──┬── merge "Umbra (Vibepollo): merge Umbra 0.5 into Vibepollo 2.0.0" ── ...
umbra/release/umbra-0.5 ──┘
```

Git therefore knows what has already been merged from either side, and both kinds of update are ordinary merges:

| Update | Command (remotes as set up in this clone) |
|---|---|
| A new Vibepollo release | `git fetch vibepollo` then `git merge vibepollo/<tag>` (or `vibepollo/master` for fixes that are not released yet) |
| New Umbra work | `git fetch umbra` then `git merge umbra/release/umbra-0.5` (or Umbra's current release branch) |

`git config rerere.enabled true` is on, and the first merge's 38 conflict resolutions are recorded, so a conflict
resolved once is resolved the same way again.

Remotes: `vibepollo` = Nonary/Vibepollo, `apollo` = ClassicOldSong/Apollo, `umbra` = PreceptorOfMagic/Umbra. All
three are fetch-only here (`pushurl` set to `DISABLED`); never push to them.

## The rule: Umbra's changes live in Umbra's files

As in Umbra: new behaviour goes in new files (`src/aurora_link/`, `src/wired_pin.*`, `src/host_monitor.*`,
`gpu_hevc_device.inc`, ...) with as few hook lines as possible in Vibepollo's files, each marked `Umbra:`.
`scripts/umbra-vibepollo-delta.txt` lists every Vibepollo file this edition may change, with the reason, and

```
node scripts/umbra_vibepollo_check.mjs [vibepollo-ref]     # default vibepollo/master
```

fails on an unlisted change, on any edit to Vibepollo's README or translations, and on a missing identity hook.
(Umbra's own `scripts/umbra_check.mjs` checks the Apollo edition's hooks and does not apply here.)

## Identity

| Surface | How |
|---|---|
| Web UI text | `src_assets/common/assets/web/umbra/identity.ts`, applied in `i18n.ts`: "Vibepollo" and "Apollo" (Vibepollo's strings use both for the running program) become "Umbra" in every language. Real component names keep theirs: Vibepollo Display Driver, Vibepollo Virtual Gamepad, Vibepollo Plugin. Vibepollo's translation files are never edited. |
| Web UI colours | `web/umbra/umbra.css`, imported by `main.ts`: overrides only Vibepollo's `--vs-*` design tokens. |
| Overview page | `web/umbra/UmbraCard.vue`: version, the Vibepollo release it is built on, update notice, Umbra links and legal. |
| Brand text | "Umbra (Vibepollo)" in the page title, sidebar, sign-in page and boot screen (one-line edits). |
| Update checks | The tray toast (`cmake/prep/build_version.cmake`: `SUNSHINE_REPO_OWNER/NAME`) and the web notice and release notes (`UpdateNotice.vue`, `ReleaseNotes.vue`) follow **this edition's** releases. Left on Vibepollo's, they would offer a Vibepollo release that replaces this host with one lacking co-op. |
| Artwork | Umbra's icons under Apollo's filenames. Vibepollo still ships Apollo's images unchanged, so they came in with the merge. |
| Windows | `project(Umbra-Vibepollo)` (file-safe: it reaches the `.rc` file and the tray tooltip). MSI: Programs-list name, publisher, Start Menu folder/shortcut, service display name and firewall rule names say Umbra (Vibepollo). |
| Kept as Vibepollo's | Install folder (`Program Files\Apollo`), service key `ApolloService`, MSI upgrade code, AppUserModelID/FQDN, the installer file name `Vibepollo.msi` (the bootstrapper extracts it by that name), and the setup wizard's own text (118 strings in one large Vibepollo file). |

## Versions

`<Vibepollo release>-umbra.<n>`, e.g. `2.0.0-umbra.1`, set at configure time through `BUILD_VERSION` (and `BRANCH`).
Release tags `v2.0.0-umbra.1`. The Overview card compares that base with Vibepollo's latest release and with this
edition's latest release.

**MSI ordering caveat.** Vibepollo encodes pre-release suffixes into the MSI version (windows_wix.cmake: a suffix
other than alpha/beta/rc maps to 90), so `2.0.0-umbra.1` is `2.0.90.0`, which ranks *below* plain Vibepollo 2.0.0
(`2.0.99.0`). Installing over an existing Vibepollo 2.0.0 is therefore a downgrade as far as the MSI is concerned.
Untested; decide the scheme before the first release.

## What was merged how

Where Vibepollo now does what an Umbra change did, Vibepollo's version was kept (the sync rule):

- **Windows installer**: Vibepollo's WiX MSI replaces Umbra's NSIS installer and its NSIS-specific fixes. Umbra's
  payload (Eclipse Link, the GPU HEVC encoder from `UMBRA_GPU_HEVC_DIR`, notices) is installed through the
  `application` component, which the MSI harvests. An Eclipse Link firewall exclusion was added to the MSI.
- **Linux packaging**: Vibepollo's.
- **Default audio device restore**: Vibepollo's per-role restore with background retry. Umbra's restore-by-name
  and "PC left on the virtual sink" recovery were **not** carried over (UNTESTED whether Vibepollo covers them).
- **Beta profile** (`APOLLO_BETA_PROFILE`): defaults OFF; its launch/RTSP hooks were not carried into Vibepollo's code.

Re-applied onto Vibepollo's restructured files (git could not align them): `nvhttp.cpp` (launch arguments,
`UmbraCaps`, `SessionLocked`, `/umbralog`, Co-op Pane hidden from app lists, co-op flag, resumed-pane resize),
`stream.cpp` (host monitor hooks, session hooks without a console window), `rtsp.cpp` (GPU HEVC), `video.cpp`
(GPU HEVC session, co-op GOP, AMF intra refresh, loop filter, 2-frame VBV), `process.cpp` (co-op pad inset, Co-op
Pane, global commands for built-in apps).

## Open risks (UNTESTED -- each needs a live test before release)

- **Mixed-vendor co-op splice.** Vibepollo has its own NVENC changes (split-frame encoding, SDK 13 paths) and a
  native AMF encoder (`amdvce_experimental`, opt-in). The default AMD path is still FFmpeg AMF, renamed
  `amdvce_ffmpeg` (Umbra's 2-frame VBV now keys on that name). Bitstream compatibility between two hosts is what
  Eclipse's splice depends on; a co-op session NVIDIA+AMD and AMD+AMD must be streamed and screenshotted.
- **Co-op pad inset** (`coop_pad_rows`): Vibepollo's display helper applies the session's mode after the virtual
  display is created and may re-apply the full height. Only matters when `coop_pad_rows` > 0.
- **Resumed Co-op Pane resize** (`prepare_gpu_hevc_resume`) relies on Vibepollo's paused-display lifetime.
- **Host monitor off** forces the virtual display through Vibepollo's `client_virtual_display_override`.
- The full release build (WebRTC, TrueHDR runtime, VHF gamepad driver, Vibepollo Display Driver package) was not
  built. The TrueHDR runtime is NVIDIA's proprietary NGX DLL, which the project's licensing rule (every third-party
  item fully open source) does not allow in a release; decide before packaging.
- `THIRD-PARTY-NOTICES.md` and `SOURCE-MANIFEST.md` describe Umbra's Apollo build; Vibepollo adds dependencies
  (libwebrtc, Playnite plugin, PyroWave, ...) that must be audited and listed before any release.
- `.github/workflows/release-windows-signed.yml` is Umbra's NSIS workflow; Vibepollo's own workflows expect
  Nonary's self-hosted runners. Keep Actions disabled on a public repo until a workflow is written for this edition.

## Merging a Vibepollo update

1. `git fetch vibepollo`; `git merge vibepollo/<tag>`. Resolve conflicts; prefer Vibepollo's version wherever it now
   does what this edition's change did (then drop the file from `umbra-vibepollo-delta.txt`).
2. `node scripts/umbra_vibepollo_check.mjs vibepollo/<tag>`.
3. Build, package, install over an existing install, and **look**: Overview card and update notice, Settings, light
   and dark mode, tray icon and menu, Programs list. A token rename upstream merges cleanly and can still leave
   `umbra.css` pointing at nothing.
4. Stream once, then a co-op session (NVIDIA+AMD) -- the additions live inside Vibepollo's streaming code.
5. Bump the version to the new base (`<tag>-umbra.1`).
