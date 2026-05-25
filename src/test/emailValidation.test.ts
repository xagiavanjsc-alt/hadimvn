import { describe, it, expect } from "vitest";
import { validateSignupEmail, normalizeEmail } from "@/lib/emailValidation";

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

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  USER@gmail.COM  ")).toBe("user@gmail.com");
  });

  it("strips +alias on every domain", () => {
    expect(normalizeEmail("user+test1@gmail.com")).toBe("user@gmail.com");
    expect(normalizeEmail("user+anything@outlook.com")).toBe("user@outlook.com");
    expect(normalizeEmail("user+ctv@yahoo.com.vn")).toBe("user@yahoo.com.vn");
  });

  it("strips dots in Gmail local part", () => {
    expect(normalizeEmail("nguyen.van.a@gmail.com")).toBe("nguyenvana@gmail.com");
    expect(normalizeEmail("n.g.u.y.e.n@gmail.com")).toBe("nguyen@gmail.com");
    expect(normalizeEmail("info.choque24h@gmail.com")).toBe("infochoque24h@gmail.com");
  });

  it("treats googlemail.com the same as gmail.com", () => {
    expect(normalizeEmail("foo.bar@googlemail.com")).toBe("foobar@googlemail.com");
  });

  it("does NOT strip dots for non-Gmail providers", () => {
    expect(normalizeEmail("a.b.c@outlook.com")).toBe("a.b.c@outlook.com");
    expect(normalizeEmail("a.b.c@yahoo.com")).toBe("a.b.c@yahoo.com");
    expect(normalizeEmail("a.b.c@icloud.com")).toBe("a.b.c@icloud.com");
  });

  it("collapses Gmail +alias AND dots simultaneously", () => {
    expect(normalizeEmail("info.choque24h+test99@gmail.com"))
      .toBe("infochoque24h@gmail.com");
  });

  it("returns null for malformed input", () => {
    expect(normalizeEmail("")).toBeNull();
    expect(normalizeEmail("noatsign")).toBeNull();
    expect(normalizeEmail("@gmail.com")).toBeNull();
    expect(normalizeEmail("user@")).toBeNull();
    expect(normalizeEmail("+only@gmail.com")).toBeNull(); // local becomes empty after strip
  });

  it("all dot-variant abuse forms of the same Gmail collapse to one canonical", () => {
    const canonical = "nguyenvana@gmail.com";
    expect(normalizeEmail("nguyenvana@gmail.com")).toBe(canonical);
    expect(normalizeEmail("nguyen.vana@gmail.com")).toBe(canonical);
    expect(normalizeEmail("ng.uy.en.va.na@gmail.com")).toBe(canonical);
    expect(normalizeEmail("nguyenvana+test1@gmail.com")).toBe(canonical);
    expect(normalizeEmail("n.guy.en.va.na+ctv99@gmail.com")).toBe(canonical);
  });
});
