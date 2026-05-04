/**
 * slugify.ts — T?o SEO-friendly slug t? ti?ng Vi?t, ti?ng Hàn, ho?c b?t k? ngôn ng? nào
 *
 * Quy t?c:
 * - Ti?ng Hàn ? phiên âm latinh (romanization)
 * - Ti?ng Vi?t ? b? d?u, chuy?n thành ASCII
 * - Kho?ng tr?ng ? d?u g?ch ngang
 * - Ký t? d?c bi?t ? b?
 * - Ch? thu?ng toàn b?
 *
 * Ví d?:
 * "M?o h?c ti?ng Hàn ???" ? "meo-hoc-tieng-han-anjeonmo"
 * "EPS-TOPIK 2024" ? "eps-topik-2024"
 */

// --- Vietnamese diacritics removal -------------------------------------------
const VI_MAP: Record<string, string> = {
  à: "a", á: "a", ?: "a", ã: "a", ?: "a",
  a: "a", ?: "a", ?: "a", ?: "a", ?: "a", ?: "a",
  â: "a", ?: "a", ?: "a", ?: "a", ?: "a", ?: "a",
  è: "e", é: "e", ?: "e", ?: "e", ?: "e",
  ê: "e", ?: "e", ?: "e", ?: "e", ?: "e", ?: "e",
  ì: "i", í: "i", ?: "i", i: "i", ?: "i",
  ò: "o", ó: "o", ?: "o", õ: "o", ?: "o",
  ô: "o", ?: "o", ?: "o", ?: "o", ?: "o", ?: "o",
  o: "o", ?: "o", ?: "o", ?: "o", ?: "o", ?: "o",
  ù: "u", ú: "u", ?: "u", u: "u", ?: "u",
  u: "u", ?: "u", ?: "u", ?: "u", ?: "u", ?: "u",
  ?: "y", ý: "y", ?: "y", ?: "y", ?: "y",
  d: "d",
  // 
  À: "a", Á: "a", ?: "a", Ã: "a", ?: "a",
  A: "a", ?: "a", ?: "a", ?: "a", ?: "a", ?: "a",
  Â: "a", ?: "a", ?: "a", ?: "a", ?: "a", ?: "a",
  È: "e", É: "e", ?: "e", ?: "e", ?: "e",
  Ê: "e", ?: "e", ?: "e", ?: "e", ?: "e", ?: "e",
  Ì: "i", Í: "i", ?: "i", I: "i", ?: "i",
  Ò: "o", Ó: "o", ?: "o", Õ: "o", ?: "o",
  Ô: "o", ?: "o", ?: "o", ?: "o", ?: "o", ?: "o",
  O: "o", ?: "o", ?: "o", ?: "o", ?: "o", ?: "o",
  Ù: "u", Ú: "u", ?: "u", U: "u", ?: "u",
  U: "u", ?: "u", ?: "u", ?: "u", ?: "u", ?: "u",
  ?: "y", Ý: "y", ?: "y", ?: "y", ?: "y",
  Ð: "d",
};

// --- Korean Romanization ------------------------------------------------------
const CHOSEONG = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const JUNGSEONG = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const JONGSEONG = ["","g","kk","gs","n","nj","nh","d","l","lg","lm","lb","ls","lt","lp","lh","m","b","bs","s","ss","ng","j","ch","k","t","p","h"];

function koreanToRoman(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const offset = code - 0xAC00;
    const cho = Math.floor(offset / (21 * 28));
    const jung = Math.floor((offset % (21 * 28)) / 28);
    const jong = offset % 28;
    return (CHOSEONG[cho] || "") + (JUNGSEONG[jung] || "") + (JONGSEONG[jong] || "");
  }
  return "";
}

/**
 * T?o SEO slug t? b?t k? chu?i nào
 * @param text - Chu?i d?u vào (ti?ng Vi?t, Hàn, Anh...)
 * @param maxLength - Ð? dài t?i da (m?c d?nh 80)
 */
export function slugify(text: string, maxLength = 80): string {
  let result = "";

  for (const char of text) {
    // Ti?ng Hàn
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      result += koreanToRoman(char);
      continue;
    }
    // Ti?ng Vi?t có d?u
    if (VI_MAP[char]) {
      result += VI_MAP[char];
      continue;
    }
    // ASCII thu?ng
    if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
      continue;
    }
    // Kho?ng tr?ng và d?u g?ch ngang ? d?u g?ch ngang
    if (/[\s\-_]/.test(char)) {
      result += "-";
      continue;
    }
    // B? qua ký t? khác
  }

  return result
    .replace(/-+/g, "-")       // Nhi?u d?u g?ch ngang ? m?t
    .replace(/^-|-$/g, "")     // B? d?u g?ch ngang d?u/cu?i
    .slice(0, maxLength)       // Gi?i h?n d? dài
    || "post";                 // Fallback
}

/**
 * T?o slug cho bài dang c?ng d?ng: ch? dùng slug t? title (SEO-friendly)
 * Luu mapping id <-> slug trong localStorage d? tra c?u
 */
export function communitySlug(id: string, title: string): string {
  return slugify(title, 80);
}

/**
 * L?y ID t? community slug
 * Slug format m?i: ch? là title slug (không có UUID)
 * Slug format cu: {uuid}-{title-slug}
 */
export function extractIdFromSlug(slug: string): string {
  // UUID format cu: 8-4-4-4-12
  const uuidMatch = slug.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) return uuidMatch[1];

  // Timestamp ID (s?)
  const numMatch = slug.match(/^(\d+)/);
  if (numMatch) return numMatch[1];

  // Slug m?i: c?n tra c?u t? Supabase theo title slug
  return slug;
}
