// ABOUTME: Serves the public letters API from Cloudflare D1.
// ABOUTME: Stores uploaded stamp images in R2 and exposes them with immutable caching.

const MAX_PAGE_SIZE = 500;
const MAX_STAMP_BYTES = 5 * 1024 * 1024;
const MAX_INTERACTION_DATA_BYTES = 100_000;
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(request, env) {
    try {
      return await routeRequest(request, env);
    } catch (error) {
      if (error instanceof RequestError) {
        return json({ error: error.message }, 400);
      }
      console.error(error);
      return json({ error: "The letters service could not complete the request." }, 500);
    }
  },
};

async function routeRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/health") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM letters").first();
    return json({ ok: true, letters: row.count });
  }

  if (request.method === "GET" && url.pathname === "/letters") {
    return listLetters(url, env);
  }

  if (request.method === "POST" && url.pathname === "/letters") {
    return createLetter(request, url, env);
  }

  const interactionMatch = url.pathname.match(/^\/letters\/(\d+)\/interactions$/);
  if (request.method === "PUT" && interactionMatch) {
    return updateInteractions(request, Number(interactionMatch[1]), env);
  }

  const stampMatch = url.pathname.match(
    /^\/stamps\/([a-f0-9]{64}\.(?:heic|jpeg|png|svg))$/
  );
  if (request.method === "GET" && stampMatch) {
    return getStamp(stampMatch[1], env);
  }

  return json({ error: "Not found." }, 404);
}

async function listLetters(url, env) {
  const from = parseNonNegativeInteger(url.searchParams.get("from"), 0);
  const requestedTo = parseNonNegativeInteger(
    url.searchParams.get("to"),
    from + MAX_PAGE_SIZE - 1
  );
  const to = Math.max(from, requestedTo);
  const limit = Math.min(to - from + 1, MAX_PAGE_SIZE);

  const result = await env.DB.prepare(
    `SELECT id, to_person, from_person, creation_timestamp, letter_content,
      interaction_data, should_hide
     FROM letters
     WHERE should_hide = 0
     ORDER BY id ASC
     LIMIT ? OFFSET ?`
  )
    .bind(limit, from)
    .all();

  return json(result.results.map(deserializeLetter));
}

async function createLetter(request, url, env) {
  const letter = await readJson(request);
  validateLetter(letter);

  const fromPerson = { ...letter.from_person };
  if (fromPerson.stamp) {
    fromPerson.stamp = await storeStamp(fromPerson.stamp, url.origin, env);
  }

  const result = await env.DB.prepare(
    `INSERT INTO letters (
      to_person, from_person, letter_content, interaction_data, should_hide
    ) VALUES (?, ?, ?, ?, 0)`
  )
    .bind(
      JSON.stringify(letter.to_person),
      JSON.stringify(fromPerson),
      JSON.stringify(letter.letter_content),
      JSON.stringify(letter.interaction_data)
    )
    .run();

  return json({ id: result.meta.last_row_id }, 201);
}

async function updateInteractions(request, id, env) {
  const interactionData = await readJson(request);
  validateInteractionData(interactionData);

  const result = await env.DB.prepare(
    "UPDATE letters SET interaction_data = ? WHERE id = ?"
  )
    .bind(JSON.stringify(interactionData), id)
    .run();

  if (result.meta.changes === 0) {
    return json({ error: "Letter not found." }, 404);
  }

  return json({ ok: true });
}

async function getStamp(key, env) {
  const object = await env.STAMPS.get(key);
  if (!object) {
    return json({ error: "Stamp not found." }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("content-security-policy", "default-src 'none'; sandbox");
  headers.set("x-content-type-options", "nosniff");
  headers.set("access-control-allow-origin", "*");
  return new Response(object.body, { headers });
}

async function storeStamp(stamp, origin, env) {
  if (/^https:\/\//.test(stamp)) {
    return stamp;
  }

  const match = stamp.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new RequestError("Stamp must be a PNG or JPEG image.");
  }

  const bytes = Uint8Array.from(atob(match[2]), (character) =>
    character.charCodeAt(0)
  );
  if (bytes.byteLength > MAX_STAMP_BYTES) {
    throw new RequestError("Stamp must be smaller than 5 MB.");
  }

  const hash = await sha256(bytes);
  const extension = match[1];
  const key = `${hash}.${extension}`;
  await env.STAMPS.put(key, bytes, {
    httpMetadata: { contentType: `image/${extension}` },
    onlyIf: { etagDoesNotMatch: "*" },
  });
  return `${origin}/stamps/${key}`;
}

async function sha256(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function validateLetter(letter) {
  if (!isObject(letter)) {
    throw new RequestError("Letter must be a JSON object.");
  }
  if (!isPerson(letter.from_person)) {
    throw new RequestError("Letter sender is invalid.");
  }
  if (
    !(
      (typeof letter.to_person === "string" && letter.to_person.length <= 200) ||
      isPerson(letter.to_person)
    )
  ) {
    throw new RequestError("Letter recipient is invalid.");
  }
  if (
    !isObject(letter.letter_content) ||
    typeof letter.letter_content.content !== "string" ||
    letter.letter_content.content.length > 10_000 ||
    !["IFrame", "Content"].includes(letter.letter_content.type)
  ) {
    throw new RequestError("Letter content is invalid.");
  }
  validateInteractionData(letter.interaction_data);
}

function isPerson(value) {
  return (
    isObject(value) &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    value.name.length <= 200 &&
    (value.stamp === undefined || typeof value.stamp === "string")
  );
}

function validateInteractionData(value) {
  if (!isObject(value)) {
    throw new RequestError("Interaction data must be a JSON object.");
  }
  for (const [color, interaction] of Object.entries(value)) {
    if (
      color.length > 100 ||
      !isObject(interaction) ||
      !isNonNegativeInteger(interaction.numDrags) ||
      !isNonNegativeInteger(interaction.numOpens)
    ) {
      throw new RequestError("Interaction data is invalid.");
    }
  }
  if (
    new TextEncoder().encode(JSON.stringify(value)).byteLength >
    MAX_INTERACTION_DATA_BYTES
  ) {
    throw new RequestError("Interaction data is too large.");
  }
}

function deserializeLetter(row) {
  return {
    ...row,
    to_person: JSON.parse(row.to_person),
    from_person: JSON.parse(row.from_person),
    letter_content: JSON.parse(row.letter_content),
    interaction_data: JSON.parse(row.interaction_data),
    should_hide: Boolean(row.should_hide),
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new RequestError("Request body must be valid JSON.");
  }
}

function parseNonNegativeInteger(value, fallback) {
  if (value === null) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

class RequestError extends Error {}
