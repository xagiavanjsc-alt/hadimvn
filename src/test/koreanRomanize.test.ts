import { describe, it, expect } from "vitest";
import {
  romanizeKorean,
  normalizeForCache,
  sha256Hex,
  buildAudioFilename,
} from "@/utils/koreanRomanize";

describe("romanizeKorean", () => {
  it("romanizes a simple greeting", () => {
    expect(romanizeKorean("안녕하세요")).toBe("annyeonghaseyo");
  });

  it("romanizes a single syllable", () => {
    expect(romanizeKorean("학")).toBe("hag");
    expect(romanizeKorean("교")).toBe("gyo");
  });

  it("preserves ASCII alphanumerics", () => {
    expect(romanizeKorean("abc123")).toBe("abc123");
  });

  it("lowercases ASCII letters", () => {
    expect(romanizeKorean("HELLO")).toBe("hello");
  });

  it("collapses non-Hangul/non-alphanumeric to dashes", () => {
    expect(romanizeKorean("학교 가다")).toBe("haggyo-gada");
    expect(romanizeKorean("안녕!")).toBe("annyeong");
  });

  it("collapses consecutive separators and trims edges", () => {
    expect(romanizeKorean("  ---hello---  ")).toBe("hello");
  });

  it("returns 'audio' for empty / whitespace input", () => {
    expect(romanizeKorean("")).toBe("audio");
    expect(romanizeKorean("   ")).toBe("audio");
    expect(romanizeKorean("!!!")).toBe("audio");
  });

  it("truncates at 40 chars to keep filenames tidy", () => {
    // 12 syllables × 4-ish chars each = well over 40
    const long = "안녕하세요반갑습니다오늘날씨좋네요열심히공부합시다";
    expect(romanizeKorean(long).length).toBeLessThanOrEqual(40);
  });

  it("produces a deterministic output (same input → same slug)", () => {
    const a = romanizeKorean("안녕");
    const b = romanizeKorean("안녕");
    expect(a).toBe(b);
  });
});

describe("normalizeForCache", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeForCache("  안녕  ")).toBe("안녕");
  });

  it("collapses internal whitespace runs", () => {
    expect(normalizeForCache("안녕   하세요")).toBe("안녕 하세요");
  });

  it("normalizes NFC vs NFD forms to the same string", () => {
    // ㄱ + ㅏ + ㅎ vs precomposed 각 should normalize identically
    const composed = "각";
    const decomposed = "각".normalize("NFD");
    expect(normalizeForCache(composed)).toBe(normalizeForCache(decomposed));
  });
});

describe("sha256Hex", () => {
  it("returns a 64-char hex string", async () => {
    const h = await sha256Hex("hello");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic across calls", async () => {
    const a = await sha256Hex("안녕하세요");
    const b = await sha256Hex("안녕하세요");
    expect(a).toBe(b);
  });

  it("produces different hashes for different inputs", async () => {
    const a = await sha256Hex("안녕");
    const b = await sha256Hex("학교");
    expect(a).not.toBe(b);
  });
});

describe("buildAudioFilename", () => {
  it("returns slug, filename, and textHash", async () => {
    const r = await buildAudioFilename("안녕하세요");
    expect(r.slug).toBe("annyeonghaseyo");
    expect(r.filename).toMatch(/^annyeonghaseyo-[0-9a-f]{8}\.mp3$/);
    expect(r.textHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes before hashing so trivial variations collide", async () => {
    const a = await buildAudioFilename("  안녕  하세요  ");
    const b = await buildAudioFilename("안녕 하세요");
    expect(a.textHash).toBe(b.textHash);
    expect(a.filename).toBe(b.filename);
  });

  it("different texts produce different filenames", async () => {
    const a = await buildAudioFilename("안녕");
    const b = await buildAudioFilename("학교");
    expect(a.filename).not.toBe(b.filename);
  });
});
