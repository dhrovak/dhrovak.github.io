// Refreshes the committed fallback used when the build can't reach GitHub.
// Usage: GITHUB_TOKEN=<optional> npm run data:snapshot
import { writeFile } from "node:fs/promises";
import { fetchGitHubData } from "../src/lib/github-api.mjs";

const USER = "dhrovak";
const OUT = new URL("../src/data/github-fallback.json", import.meta.url);

try {
  const data = await fetchGitHubData(USER, process.env.GITHUB_TOKEN || undefined);
  await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${data.projects.length} projects, ${data.skills.length} skills -> src/data/github-fallback.json`);
} catch (err) {
  console.error(`Snapshot failed: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
}
