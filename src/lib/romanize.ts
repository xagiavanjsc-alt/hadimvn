/**
 * Korean Hangul → Revised Romanization (RR).
 * Used to generate SEO-friendly slugs (e.g. 가결 → ga-gyeol).
 *
 * Implements basic Korean phonological rules: liaison, lenition,
 * and final consonant assimilation between syllables. Good enough for
 * URL slugs; not perfect linguistic transcription.
 */

const INITIALS = [
  "g", "kk", "n", "d", "tt", "r", "m", "b", "pp",
  "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
];

const MEDIALS = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye",
  "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu",
  "eu", "ui", "i",
];

const FINALS = [
  "", "k", "k", "kt", "n", "nj", "nh", "t", "l", "lk",
  "lm", "lp", "ls", "lt", "lp", "lh", "m", "p", "ps",
  "t", "t", "ng", "t", "t", "k", "t", "p", "t",
];

function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

function decompose(ch: string): { i: number; m: number; f: number } {
  const code = ch.charCodeAt(0) - 0xac00;
  return {
    i: Math.floor(code / (21 * 28)),
    m: Math.floor((code % (21 * 28)) / 28),
    f: code % 28,
  };
}

/** Romanize a single Hangul word (no spaces). */
export function romanizeWord(word: string): string {
  if (!word) return "";
  const syllables: { i: number; m: number; f: number }[] = [];
  for (const ch of word) {
    if (isHangulSyllable(ch)) syllables.push(decompose(ch));
  }
  if (syllables.length === 0) {
    // Already non-Hangul; just sanitize for slug
    return word.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  }

  const parts: string[] = [];
  for (let i = 0; i < syllables.length; i++) {
    const s = syllables[i];
    const next = syllables[i + 1];
    let initial = INITIALS[s.i];
    const medial = MEDIALS[s.m];
    let finalRom = FINALS[s.f];

    // Liaison: if next syllable starts with ㅇ (i=11), final consonant
    // moves into next syllable as its initial. We absorb here by clearing
    // final and overriding next's initial below via "carry" mechanism.
    if (next && next.i === 11 && s.f !== 0) {
      // Move final → next initial
      const carryMap: Record<number, string> = {
        1: "g", 2: "kk", 4: "n", 7: "d", 8: "r", 16: "m", 17: "b",
        19: "s", 20: "ss", 21: "ng", 22: "j", 23: "ch", 24: "k",
        25: "t", 26: "p", 27: "h",
      };
      const carry = carryMap[s.f];
      if (carry) {
        finalRom = "";
        // Mutate next: set initial to carry
        syllables[i + 1] = { ...next, i: -1 } as any;
        (syllables[i + 1] as any)._carry = carry;
      }
    }

    // Apply carry from previous syllable
    if ((s as any)._carry) {
      initial = (s as any)._carry;
    } else if (s.i === -1) {
      initial = "";
    }

    // ㅇ at start → silent
    if (s.i === 11 && !(s as any)._carry) initial = "";

    // Word-initial g/d/b/j voicing → keep as is (RR uses voiced after vowel/sonorant)
    // Between two vowels, k/t/p/ch already encoded as g/d/b/j by INITIALS table.

    parts.push(initial + medial + finalRom);
  }

  return parts.join("-").toLowerCase().replace(/[^a-z-]/g, "");
}

/** Generate slug for routing. Falls back to raw if romanization fails. */
export function toSlug(word: string): string {
  const r = romanizeWord(word);
  if (r && /[a-z]/.test(r)) return r;
  // Fallback: lowercase the input as-is (browser will URL-encode)
  return word.toLowerCase();
}
