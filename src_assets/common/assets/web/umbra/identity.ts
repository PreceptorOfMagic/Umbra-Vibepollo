// Umbra (Vibepollo): the host's name and Umbra's own wording, layered over Vibepollo's web UI at load time.
//
// Vibepollo's translation files are deliberately NOT edited: every hand edit conflicts whenever Vibepollo
// updates its translations. Instead i18n.ts passes the loaded messages through applyUmbraIdentity():
//
//   1. In every language, "Vibepollo" -- and "Apollo", which Vibepollo's strings also use for the running
//      program ("Quit Apollo") -- becomes "Umbra". Case-sensitive, so environment-variable names such as
//      APOLLO_CLIENT_FPS are untouched. Real component names keep their name: the Vibepollo Display
//      Driver, the Vibepollo Virtual Gamepad and the Vibepollo (Playnite) Plugin are what Windows and
//      Playnite call them.
//   2. The `umbra.*` strings used by UmbraCard.vue are added (English only; other languages fall back).
//
// The same approach as Umbra's umbra_identity.js for Apollo.

type Messages = Record<string, unknown>;

const UMBRA_EN = {
  // The legacy (Apollo-era) web UI's resource card (web-legacy/ResourceCard.vue).
  resource_card: {
    resources_desc:
      "Discord is Moonlight's community and GitHub Discussions is Vibepollo's. Report problems with this host in Umbra (Vibepollo)'s GitHub Issues.",
  },
  umbra: {
    title: 'Umbra (Vibepollo)',
    version: 'Version {version}',
    dev_build: 'Development build {version}',
    built_on: 'Built on Vibepollo {upstream}.',
    base_unknown: 'This build does not record which Vibepollo release it is built on.',
    thin_fork:
      "Umbra (Vibepollo) is Vibepollo with the additions Eclipse needs for co-op, and as little else changed as possible. Vibepollo is Nonary's project, built on Apollo, and is still maintained; this edition follows its releases instead of redoing its work.",
    checking: 'Checking for Vibepollo and Umbra (Vibepollo) releases...',
    up_to_date: "Up to date: built on Vibepollo's latest release ({upstream}).",
    upstream_new_umbra_not: 'Vibepollo {upstream} is out. Umbra (Vibepollo) has not been updated to it yet.',
    upstream_new_umbra_has: 'Vibepollo {upstream} is out, and Umbra (Vibepollo) {umbra} is built on it.',
    umbra_update: 'Umbra (Vibepollo) {umbra} is available.',
    upstream_check_failed: "Couldn't check Vibepollo's latest release.",
    umbra_unknown: "Couldn't find a published Umbra (Vibepollo) release to compare.",
    upstream_notes: "Vibepollo's release notes (Vibepollo's page)",
    download_umbra: 'Download Umbra (Vibepollo) {umbra}',
    resources: 'Umbra',
    resources_desc: 'Umbra and Eclipse are developed together. Report problems with this host to Umbra, not to Vibepollo.',
    project_hub: 'Project Hub',
    source: 'Umbra (Vibepollo) on GitHub',
    issues: 'Report an Umbra problem',
    eclipse: 'Eclipse (client)',
    legal: 'Legal',
    modified:
      "Umbra (Vibepollo) is a modified version of Vibepollo, which is based on Apollo and Sunshine. Umbra's changes are by PreceptorOfMagic, 2026, starting from Vibepollo {upstream}.",
    licence:
      'It is free software under the GNU General Public License v3.0, the same licence as Vibepollo, Apollo and Sunshine. It comes with NO WARRANTY, to the extent permitted by law.',
    not_affiliated:
      'Umbra is an independent fork. It is not affiliated with or endorsed by Nonary (Vibepollo), ClassicOldSong (Apollo), SudoMaker or LizardByte (Sunshine); their names are used only to say where Umbra comes from.',
    licence_link: 'Licence (GPL-3.0)',
    notices_link: 'Umbra notices',
    third_party_link: 'Third-party notices',
    source_link: 'Source code',
  },
};

// The running program's name; also the genitive "Vibepollos"/"Apollos" (Swedish).
const PROGRAM_WORD = /\b(?:Vibepollo|Apollo)(?=s?\b)(?!(?:'s|’s)? (?:Display Driver|Virtual Gamepad|Plugin))/g;

function rename(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(PROGRAM_WORD, 'Umbra');
  if (Array.isArray(value)) return value.map(rename);
  if (value && typeof value === 'object') {
    const out: Messages = {};
    for (const [k, v] of Object.entries(value)) out[k] = rename(v);
    return out;
  }
  return value;
}

function merge(base: Messages, extra: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v)
        ? merge((base?.[k] as Messages) ?? {}, v as Messages)
        : v;
  }
  return out;
}

export function applyUmbraIdentity<T>(messages: T, locale: string): T {
  const renamed = rename(messages) as Messages;
  return (locale === 'en' ? merge(renamed, UMBRA_EN) : renamed) as T;
}
