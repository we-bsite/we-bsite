// ABOUTME: Exercises the Worker API against real local D1 and R2 implementations.
// ABOUTME: Verifies reads, writes, validation, interaction updates, CORS, and stamp storage.

import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const wranglerConfig = "worker/wrangler.jsonc";

test("letters API works with D1 and R2", async () => {
  const stateDirectory = await mkdtemp(path.join(os.tmpdir(), "we-bsite-test-"));
  const port = await availablePort();
  let worker;

  try {
    execFileSync(
      "npx",
      [
        "wrangler",
        "d1",
        "migrations",
        "apply",
        "we-bsite",
        "--local",
        "--config",
        wranglerConfig,
        "--persist-to",
        stateDirectory,
      ],
      { cwd: repositoryRoot, stdio: "pipe" }
    );

    worker = spawn(
      "npx",
      [
        "wrangler",
        "dev",
        "--config",
        wranglerConfig,
        "--port",
        String(port),
        "--persist-to",
        stateDirectory,
      ],
      { cwd: repositoryRoot, stdio: ["ignore", "pipe", "pipe"] }
    );
    const workerOutput = await waitUntilReady(worker);
    const apiUrl = `http://localhost:${port}`;

    const health = await fetch(`${apiUrl}/health`);
    assert.deepEqual(await health.json(), { ok: true, letters: 0 });

    const invalid = await fetch(`${apiUrl}/letters`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), { error: "Letter sender is invalid." });

    const created = await fetch(`${apiUrl}/letters`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to_person: "the internet",
        from_person: {
          name: "Integration test",
          stamp: "data:image/png;base64,iVBORw0KGgo=",
        },
        letter_content: { content: "test", type: "Content" },
        interaction_data: {},
        should_hide: false,
      }),
    });
    assert.equal(created.status, 201, workerOutput());
    const { id } = await created.json();

    const listed = await fetch(`${apiUrl}/letters?from=0&to=0`);
    const letters = await listed.json();
    assert.equal(letters.length, 1);
    assert.equal(letters[0].id, id);
    assert.match(letters[0].from_person.stamp, /\/stamps\/[a-f0-9]{64}\.png$/);

    const stamp = await fetch(letters[0].from_person.stamp);
    assert.equal(stamp.status, 200);
    assert.equal(stamp.headers.get("content-type"), "image/png");
    assert.deepEqual(new Uint8Array(await stamp.arrayBuffer()),
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));

    const updated = await fetch(`${apiUrl}/letters/${id}/interactions`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ red: { numDrags: 1, numOpens: 0 } }),
    });
    assert.equal(updated.status, 200);
    assert.deepEqual(await updated.json(), { ok: true });

    const missing = await fetch(`${apiUrl}/letters/999999/interactions`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(missing.status, 404);

    const options = await fetch(`${apiUrl}/letters`, { method: "OPTIONS" });
    assert.equal(options.status, 204);
    assert.equal(options.headers.get("access-control-allow-origin"), "*");
  } finally {
    worker?.kill("SIGTERM");
    await rm(stateDirectory, { recursive: true, force: true });
  }
});

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  server.close();
  return address.port;
}

function waitUntilReady(worker) {
  let output = "";
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.kill("SIGTERM");
      reject(new Error(`Worker did not start.\n${output}`));
    }, 20_000);
    const onOutput = (chunk) => {
      output += chunk.toString();
      if (output.includes("Ready on")) {
        clearTimeout(timeout);
        resolve(() => output);
      }
    };
    worker.stdout.on("data", onOutput);
    worker.stderr.on("data", onOutput);
    worker.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Worker exited with code ${code}.\n${output}`));
    });
  });
}
