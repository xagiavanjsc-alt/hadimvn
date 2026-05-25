import { describe, it, expect } from "vitest";
import { validateSignupEmail } from "@/lib/emailValidation";

describe("validateSignupEmail", () => {
  describe("accepts legitimate consumer email", () => {
    it.each([
      "nguyenvana@gmail.com",
      "Nguyen.Van.A@gmail.com", // mixed case + dots are fine
      "user_123@outlook.com",
      "abc-xyz@hotmail.com.vn",
      "lee@icloud.com",
      "han_quoc.oi@yahoo.com.vn",
    ])("accepts %s", (email) => {
      expect(validateSignupEmail(email).ok).toBe(true);
    });
  });

  describe("rejects empty/malformed input", () => {
    it.each([
      ["", "Vui lòng nhập email"],
      ["   ", "Vui lòng nhập email"],
      ["noatsign", "Email không hợp lệ"],
      ["@gmail.com", "Email không hợp lệ"],
      ["user@", "Email không hợp lệ"],
      ["user @gmail.com", "Email không hợp lệ"],
      ["user@nodot", "Email không hợp lệ"],
    ])("%s → %s", (input, reason) => {
      const r = validateSignupEmail(input);
      expect(r.ok).toBe(false);
      expect(r.reason).toBe(reason);
    });
  });

  describe("rejects non-allowlisted domains", () => {
    it.each([
      "user@company.com",
      "test@protonmail.com",
      "x@tutanota.com",
      "spam@mailinator.com",
    ])("rejects %s", (email) => {
      const r = validateSignupEmail(email);
      expect(r.ok).toBe(false);
      expect(r.reason).toContain("Gmail, Outlook");
    });
  });

  describe("rejects Gmail-style + alias abuse", () => {
    it.each([
      "nguyenvana+test1@gmail.com",
      "user+anything@outlook.com",
      "x+ctv@yahoo.com",
      "+leading@gmail.com",
    ])("rejects %s", (email) => {
      const r = validateSignupEmail(email);
      expect(r.ok).toBe(false);
      expect(r.reason).toContain("+");
    });
  });

  describe("rejects exotic / abuse-prone local parts", () => {
    it.each([
      "user..double@gmail.com",   // consecutive dots
      ".leading@gmail.com",        // leading dot
      "trailing.@gmail.com",       // trailing dot
      "-leading@gmail.com",        // leading hyphen
      "trailing-@gmail.com",       // trailing hyphen
      "weird!chars@gmail.com",     // exclamation
      "user#tag@gmail.com",        // hash
      "with space@gmail.com",      // whitespace (also caught earlier)
      "tab\tinside@gmail.com",
    ])("rejects %s", (email) => {
      expect(validateSignupEmail(email).ok).toBe(false);
    });
  });

  it("normalizes case before checking domain", () => {
    expect(validateSignupEmail("USER@GMAIL.COM").ok).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    expect(validateSignupEmail("  user@gmail.com  ").ok).toBe(true);
  });
});
