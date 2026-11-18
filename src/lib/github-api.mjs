// Plain JS so both Astro (build) and scripts/snapshot.mjs (plain Node) can import it.

const API = "https://api.github.com";
const TIMEOUT_MS = 10_000;
const PER_PAGE = 100;
const MAX_PAGES = 10;
const MIN_SKILL_PCT = 1;

/**
 * @typedef {{ name: string, description: string | null, url: string, homepage: string | null, language: string | null, stars: number, pushedAt: string }} Project
 * @typedef {{ name: string, pct: number }} Skill
 * @typedef {{ projects: Project[], skills: Skill[], fetchedAt: string }} GitHubData
 */

/** @param {string} path @param {string | undefined} token */
async function getJson(path, token) {
  /** @type {Record<string, string>} */
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dhrovak.github.io-build",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

/** @param {unknown} value */
function httpsUrlOrNull(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** @param {unknown} value */
function textOrNull(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * Fetches public, non-fork repos (archived included) and byte-weighted language totals.
 * Throws on any network/API failure so callers can decide how to fall back.
 * @param {string} user
 * @param {string | undefined} [token]
 * @returns {Promise<GitHubData>}
 */
export async function fetchGitHubData(user, token) {
  const owner = encodeURIComponent(user);
  /** @type {any[]} */
  const repos = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getJson(
      `/users/${owner}/repos?type=owner&sort=pushed&direction=desc&per_page=${PER_PAGE}&page=${page}`,
      token,
    );
    if (!Array.isArray(batch)) throw new Error("GitHub API returned a non-array repo list");
    repos.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  // The site repo and the <user>/<user> profile-README repo aren't projects.
  const excluded = new Set([`${user}.github.io`.toLowerCase(), user.toLowerCase()]);
  const visible = repos
    .filter(
      (r) =>
        r && !r.fork && !r.private && !r.disabled && typeof r.name === "string" &&
        !excluded.has(r.name.toLowerCase()),
    )
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));

  /** @type {Project[]} */
  const projects = [];
  for (const r of visible) {
    const url = httpsUrlOrNull(r.html_url);
    if (!url) continue;
    projects.push({
      name: r.name,
      description: textOrNull(r.description),
      url,
      homepage: httpsUrlOrNull(r.homepage),
      language: textOrNull(r.language),
      stars: Number.isFinite(r.stargazers_count) ? r.stargazers_count : 0,
      pushedAt: typeof r.pushed_at === "string" ? r.pushed_at : new Date(0).toISOString(),
    });
  }

  const languageMaps = await Promise.all(
    projects.map((p) => getJson(`/repos/${owner}/${encodeURIComponent(p.name)}/languages`, token)),
  );

  /** @type {Map<string, number>} */
  const totals = new Map();
  for (const map of languageMaps) {
    if (!map || typeof map !== "object") continue;
    for (const [lang, bytes] of Object.entries(map)) {
      if (typeof bytes === "number" && bytes > 0) totals.set(lang, (totals.get(lang) ?? 0) + bytes);
    }
  }
  const totalBytes = [...totals.values()].reduce((sum, n) => sum + n, 0);
  const skills = totalBytes
    ? [...totals]
        .map(([name, bytes]) => ({ name, pct: Math.round((bytes / totalBytes) * 1000) / 10 }))
        .filter((s) => s.pct >= MIN_SKILL_PCT)
        .sort((a, b) => b.pct - a.pct)
    : [];

  return { projects, skills, fetchedAt: new Date().toISOString() };
}
