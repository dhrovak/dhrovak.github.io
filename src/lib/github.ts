import { fetchGitHubData } from "./github-api.mjs";
import type { GitHubData } from "./github-api.mjs";
import fallback from "../data/github-fallback.json";
import { site } from "../content/site";

export type { GitHubData, Project, Skill } from "./github-api.mjs";

let cached: Promise<GitHubData> | undefined;

/** Live data at build time; committed snapshot if GitHub is unreachable so the build never fails. */
export function getGitHubData(): Promise<GitHubData> {
  cached ??= fetchGitHubData(site.githubUser, process.env.GITHUB_TOKEN || undefined).catch((err: unknown) => {
    console.warn(
      `[github] Live fetch failed, using src/data/github-fallback.json (${fallback.fetchedAt}): ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return fallback as GitHubData;
  });
  return cached;
}
