// ABOUTME: Converts a gzipped Supabase cluster backup into D1-compatible SQL and stamp files.
// ABOUTME: Moves inline PNG and JPEG data URLs into content-addressed files for R2 upload.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const [backupPath, outputDirectory, apiUrl] = process.argv.slice(2);

if (!backupPath || !outputDirectory || !apiUrl) {
  throw new Error(
    "Usage: node scripts/prepare-d1-import.mjs BACKUP OUTPUT_DIRECTORY API_URL"
  );
}

const sql = gunzipSync(await readFile(backupPath)).toString("utf8");
const stampsDirectory = path.join(outputDirectory, "stamps");
await mkdir(stampsDirectory, { recursive: true });

const activeRows = parseCopyRows(sql, "letters", 7);
const archivedRows = parseCopyRows(sql, "letters_archive", 8);
const stampFiles = new Map();

for (const row of activeRows) {
  row[5] ||= "{}";
  row[6] = sqliteBoolean(row[6]);
}
for (const row of archivedRows) {
  row[5] ||= "{}";
  row[6] = sqliteBoolean(row[6]);
  row[7] = sqliteBoolean(row[7]);
}

for (const row of [...activeRows, ...archivedRows]) {
  const sender = JSON.parse(row[2]);
  if (
    sender &&
    typeof sender.stamp === "string" &&
    sender.stamp.startsWith("data:")
  ) {
    const stamp = decodeStamp(sender.stamp);
    const hash = createHash("sha256").update(stamp.bytes).digest("hex");
    const key = `${hash}.${stamp.extension}`;
    stampFiles.set(key, stamp.bytes);
    sender.stamp = `${apiUrl.replace(/\/$/, "")}/stamps/${key}`;
    row[2] = JSON.stringify(sender);
  }
}

const statements = [
  "DELETE FROM letters;",
  "DELETE FROM letters_archive;",
  ...activeRows.map((row) => insertStatement("letters", row)),
  ...archivedRows.map((row) => insertStatement("letters_archive", row)),
  `UPDATE sqlite_sequence SET seq = ${Math.max(...activeRows.map((row) => Number(row[0])))} WHERE name = 'letters';`,
];

await Promise.all(
  Array.from(stampFiles, ([key, bytes]) =>
    writeFile(path.join(stampsDirectory, key), bytes)
  )
);
await writeFile(path.join(outputDirectory, "letters.sql"), statements.join("\n"));

console.log(
  JSON.stringify(
    {
      activeLetters: activeRows.length,
      archivedLetters: archivedRows.length,
      stampFiles: stampFiles.size,
      sqlPath: path.join(outputDirectory, "letters.sql"),
      stampsDirectory,
    },
    null,
    2
  )
);

function parseCopyRows(source, table, expectedFields) {
  const marker = `COPY public.${table} (`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Backup does not contain public.${table}.`);
  }
  const dataStart = source.indexOf("\n", start) + 1;
  const dataEnd = source.indexOf("\n\\.\n", dataStart);
  if (dataEnd === -1) {
    throw new Error(`Backup data for public.${table} is incomplete.`);
  }

  return source
    .slice(dataStart, dataEnd)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const fields = line.split("\t").map(decodeCopyField);
      if (fields.length !== expectedFields) {
        throw new Error(`Unexpected public.${table} row with ${fields.length} fields.`);
      }
      return fields;
    });
}

function decodeCopyField(value) {
  if (value === "\\N") {
    return null;
  }
  return value.replace(/\\([btnrfv\\])/g, (_match, character) => {
    return { b: "\b", t: "\t", n: "\n", r: "\r", f: "\f", v: "\v", "\\": "\\" }[
      character
    ];
  });
}

function decodeStamp(dataUrl) {
  const match = dataUrl.match(
    /^data:image\/(png|jpeg|heic|svg\+xml);base64,(.+)$/
  );
  if (!match) {
    const mediaType = dataUrl.slice(0, dataUrl.indexOf(","));
    throw new Error(`Backup contains an unsupported stamp type: ${mediaType}`);
  }
  const extension = match[1] === "svg+xml" ? "svg" : match[1];
  return { extension, bytes: Buffer.from(match[2], "base64") };
}

function insertStatement(table, row) {
  return `INSERT INTO ${table} VALUES (${row.map(sqlValue).join(", ")});`;
}

function sqlValue(value) {
  if (value === null) {
    return "NULL";
  }
  return `'${value.replaceAll("'", "''")}'`;
}

function sqliteBoolean(value) {
  if (value === null) {
    return null;
  }
  if (value === "t") {
    return "1";
  }
  if (value === "f") {
    return "0";
  }
  throw new Error(`Unexpected PostgreSQL boolean value: ${value}`);
}
