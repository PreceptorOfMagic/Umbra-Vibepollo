// Umbra: what the Project Hub's updates.json says about a newer Umbra (the same file and rules as Eclipse's
// update notice; reference: docs/update-notice.md in the Eclipse repository).
//
// A release with "notify": false is SILENT: it never shows a notice on its own, and is listed beneath a
// later announced release. "platforms" limits a release to those platforms. Only schema 1 is read; any
// other document shows nothing.

export interface UpdateRelease {
  version: string;
  date?: string;
  notes_url?: string;
  highlights: string[];
}

export interface UpdateNotice {
  latest: string;
  releases: UpdateRelease[]; // newest first, everything above the installed version up to `latest`
  howToUpdate: string | null;
  downloadUrl: string | null;
}

interface Version {
  nums: number[];
  umbra: number; // '-umbra.<n>' is Umbra's own revision of an upstream release: AFTER the plain one
  pre: string | null; // any other suffix ('-beta.1') sorts BEFORE the plain one
}

function parseVersion(v: string): Version | null {
  const m = /^(?:umbra-(?:linux-)?)?v?(\d+(?:\.\d+)*)(?:-(.+))?$/.exec((v || '').trim());
  if (!m) return null;
  const nums = m[1].split('.').map(Number);
  const suffix = m[2] ?? null;
  const u = suffix ? /^umbra\.(\d+)$/.exec(suffix) : null;
  return { nums, umbra: u ? Number(u[1]) : 0, pre: suffix && !u ? suffix : null };
}

export function compareVersions(a: string, b: string): number {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) return 0;
  for (let i = 0; i < Math.max(x.nums.length, y.nums.length); i++) {
    const d = (x.nums[i] ?? 0) - (y.nums[i] ?? 0);
    if (d !== 0) return d;
  }
  if (x.umbra !== y.umbra) return x.umbra - y.umbra;
  if (x.pre !== y.pre) return x.pre === null ? 1 : y.pre === null ? -1 : x.pre < y.pre ? -1 : 1;
  return 0;
}

function applies(release: Record<string, unknown>, platform: string): boolean {
  const p = release.platforms;
  return !Array.isArray(p) || p.includes(platform);
}

/** null: nothing to show (no announced newer release, or a document this code cannot read). */
export function evaluateUpdates(
  doc: unknown,
  product: string,
  platform: string,
  installed: string,
): UpdateNotice | null {
  if (!doc || typeof doc !== 'object' || (doc as Record<string, unknown>).schema !== 1) return null;
  const prod = (doc as Record<string, unknown>)[product] as Record<string, unknown> | undefined;
  const releases = prod?.releases;
  if (!Array.isArray(releases) || !parseVersion(installed)) return null;
  const usable = releases.filter(
    (r): r is Record<string, unknown> =>
      !!r && typeof r === 'object' && typeof r.version === 'string' && !!parseVersion(r.version) && applies(r, platform),
  );
  const newer = usable.filter((r) => compareVersions(r.version as string, installed) > 0);
  let latest: string | null = null;
  for (const r of newer) {
    if (r.notify !== false && (latest === null || compareVersions(r.version as string, latest) > 0)) latest = r.version as string;
  }
  if (latest === null) return null;
  const listed = newer
    .filter((r) => compareVersions(r.version as string, latest!) <= 0)
    .sort((a, b) => compareVersions(b.version as string, a.version as string))
    .map((r) => ({
      version: r.version as string,
      date: typeof r.date === 'string' ? r.date : undefined,
      notes_url: typeof r.notes_url === 'string' ? r.notes_url : undefined,
      highlights: Array.isArray(r.highlights) ? r.highlights.filter((h): h is string => typeof h === 'string') : [],
    }));
  const how = (prod?.how_to_update as Record<string, unknown> | undefined)?.[platform];
  return {
    latest,
    releases: listed,
    howToUpdate: typeof how === 'string' ? how : null,
    downloadUrl: typeof prod?.download_url === 'string' ? (prod.download_url as string) : null,
  };
}
