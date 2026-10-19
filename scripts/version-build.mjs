import { cp, mkdir, readFile } from "node:fs/promises";
const pkg = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const root = new URL("../dist/", import.meta.url);
const versionDir = new URL(`../dist/${pkg.version}/`, import.meta.url);
await mkdir(versionDir, { recursive: true });
await cp(
  new URL("remoteEntry.js", root),
  new URL("remoteEntry.js", versionDir),
);
await cp(new URL("assets/", root), new URL("assets/", versionDir), {
  recursive: true,
});
