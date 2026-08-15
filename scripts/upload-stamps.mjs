// ABOUTME: Uploads prepared stamp files to the production R2 bucket.
// ABOUTME: Uses explicit remote writes so Wrangler cannot target local emulator storage.

import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

const [stampsDirectory] = process.argv.slice(2);
if (!stampsDirectory) {
  throw new Error("Usage: node scripts/upload-stamps.mjs STAMPS_DIRECTORY");
}

const contentTypes = {
  ".heic": "image/heic",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const stampFiles = (await readdir(stampsDirectory)).sort();

for (const stampFile of stampFiles) {
  const contentType = contentTypes[path.extname(stampFile)];
  if (!contentType) {
    throw new Error(`Unsupported stamp file: ${stampFile}`);
  }

  execFileSync(
    "npx",
    [
      "wrangler",
      "r2",
      "object",
      "put",
      `we-bsite-stamps/${stampFile}`,
      "--remote",
      "--file",
      path.join(stampsDirectory, stampFile),
      "--content-type",
      contentType,
    ],
    { stdio: "inherit" }
  );
}

console.log(`Uploaded ${stampFiles.length} stamp files to production R2.`);
