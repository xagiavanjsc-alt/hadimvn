/**
 * Korean Hangul → Latin slug (Revised Romanization, simplified).
 *
 * Used to build URL-safe filenames for the TTS audio cache. Korean
 * characters in URLs work in most browsers but break some CDN edges
 * and crash some older Android WebViews — keeping filenames ASCII
 * avoids the whole class of problems.
 *
 * Strategy:
 *   - Decompose each Hangul syllable (U+AC00..U+D7A3) into
 *     initial (choseong) + medial (jungseong) + final (jongseong).
 *   - Map each jamo to its RR Latin spelling.
 *   - Strip diacritics, lowercase, replace spaces/punctuation with `-`.
 *   - Truncate to 40 chars to keep filenames tidy; pair with a hash
 *     suffix at the caller so collisions don't matter.
 *
 * This is intentionally NOT a perfect romanizer — it skips contextual
 * assimilation rules (e.g. 입학 → "iphak" not "iphak" / "ipak"). For
 * filenames we only need *deterministic + URL-safe*, not linguistically
 * perfect.
 */

// ─── RR jamo tables ───────────────────────────────────────────────────────────
// Index = jamo position in the syllable. Order is the standard Unicode order.

const INITIALS = [
  "g",  "kk", "n",  "d",  "tt", "r",  "m",  "b",
  "pp", "s",  "ss", "",   "j",  "jj", "ch", "k",
  "t",  "p",  "h",
];

const MEDIALS = [
  "a",   "ae",  "ya",  "yae", "eo",  "e",   "yeo", "ye",
  "o",   "wa",  "wae", "oe",  "yo",  "u",   "wo",  "we",
  "wi",  "yu",  "eu",  "ui",  "i",
];

const FINALS = [
  "",   "g",  "kk", "gs", "n",  "nj", "nh", "d",
  "l",  "lg", "lm", "lb", "ls", "lt", "lp", "lh",
  "m",  "b",  "bs", "s",  "ss", "ng", "j",  "ch",
  "k",  "t",  "p",  "h",
];

const HANGUL_BASE = 0xAC00;
const HANGUL_END  = 0xD7A3;

function romanizeChar(code: number): string {
  if (code < HANGUL_BASE || code > HANGUL_END) return "";
  const offset = code - HANGUL_BASE;
  const initial = Math.floor(offset / 588);
  const medial  = Math.floor((offset % 588) / 28);
  const final   = offset % 28;
  return INITIALS[initial] + MEDIALS[medial] + FINALS[final];
}

/**
 * Romanize a Korean string into a URL-safe slug.
 *
 *   romanizeKorean("안녕하세요")  // "annyeonghaseyo"
 *   romanizeKorean("학교 가다")  // "haggyo-gada"
 *   romanizeKorean("123 + 사랑")  // "123-sarang"
 *
 * Non-Hangul characters are kept if they're already ASCII alnum,
 * everything else collapses to `-`. Empty input returns "audio".
 */
export function romanizeKorean(input: string): string {
  if (!input) return "audio";
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code >= HANGUL_BASE && code <= HANGUL_END) {
      out += romanizeChar(code);
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch;
    } else {
      out += "-";
    }
  }
  return out
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    || "audio";
}

/**
 * Hash a string with SHA-256 → hex. Used to dedupe cache rows and to
 * append a short suffix to romanized filenames so two different texts
 * with the same slug still get distinct storage objects.
 *
 * Uses the Web Crypto API which is available in modern browsers and
 * in Deno (edge functions), so this works on both sides of the wire.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(buf);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Normalize text before hashing so trivial variations (extra spaces,
 * NFC vs NFD) all hit the same cache row.
 */
export function normalizeForCache(input: string): string {
  return input.normalize("NFC").trim().replace(/\s+/g, " ");
}

/**
 * Build the canonical filename for a Korean text in the tts-audio bucket.
 *   buildAudioFilename("안녕하세요")
 *     → { slug: "annyeonghaseyo", hash: "...", filename: "annyeonghaseyo-7c4f1e92.mp3", textHash: "<64 hex>" }
 */
export async function buildAudioFilename(input: string): Promise<{
  slug: string;
  filename: string;
  textHash: string;
}> {
  const normalized = normalizeForCache(input);
  const textHash = await sha256Hex(normalized);
  const slug = romanizeKorean(normalized);
  const shortHash = textHash.slice(0, 8);
  return {
    slug,
    filename: `${slug}-${shortHash}.mp3`,
    textHash,
  };
}
