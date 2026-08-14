// ABOUTME: Provides the browser and build-time client for the public letters API.
// ABOUTME: Converts failed HTTP responses into errors the existing UI can report.

import {
  DatabaseLetter,
  DatabaseLetterInsertInfo,
  LetterInteractionData,
} from "../types";

const LettersApiUrl =
  process.env.NEXT_PUBLIC_LETTERS_API_URL ||
  "https://we-bsite-api.spencerc99.workers.dev";

interface FetchRange {
  from: number;
  to: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${LettersApiUrl}${path}`, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || `Letters service returned ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export function fetchLetters({ from, to }: FetchRange): Promise<DatabaseLetter[]> {
  const params = new URLSearchParams({
    from: String(from),
    to: String(to),
  });
  return request<DatabaseLetter[]>(`/letters?${params}`);
}

export function createLetter(letter: DatabaseLetterInsertInfo): Promise<{ id: number }> {
  return request<{ id: number }>("/letters", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(letter),
  });
}

export function saveLetterInteractions(
  id: number,
  interactionData: LetterInteractionData
): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/letters/${id}/interactions`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(interactionData),
  });
}
