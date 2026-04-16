import type { SajuInput } from "./types";

interface PersonalShareParams {
  type: "personal";
  input: SajuInput;
  concern?: string;
}

interface CompatibilityShareParams {
  type: "compatibility";
  person1: SajuInput;
  person2: SajuInput;
  relationshipType?: string;
}

type ShareParams = PersonalShareParams | CompatibilityShareParams;

export function buildShareUrl(params: ShareParams): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const json = JSON.stringify(params);
  // URI-encode the JSON, then base64 — handles Korean safely
  const encoded = encodeURIComponent(json);
  return `${base}?s=${encoded}`;
}

export function parseShareUrl(url: string): ShareParams | null {
  try {
    const u = new URL(url);
    const s = u.searchParams.get("s");
    if (!s) return null;
    const json = decodeURIComponent(s);
    return JSON.parse(json) as ShareParams;
  } catch {
    return null;
  }
}
