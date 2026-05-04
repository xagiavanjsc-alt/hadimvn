/**
 * slugify.ts — Tạo SEO-friendly slug từ tiếng Việt, tiếng Hàn, hoặc bất kỳ ngôn ngữ nào
 *
 * Quy tắc:
 * - Tiếng Hàn → phiên âm latinh (romanization)
 * - Tiếng Việt → bỏ dấu, chuyển thành ASCII
 * - Khoảng trắng → dấu gạch ngang
 * - Ký tự đặc biệt → bỏ
 * - Chữ thường toàn bộ
 *
 * Ví dụ:
 * "Mẹo học tiếng Hàn 안전모" → "meo-hoc-tieng-han-anjeonmo"
 * "EPS-TOPIK 2024" → "eps-topik-2024"
 */

// ─── Vietnamese diacritics removal ───────────────────────────────────────────
const VI_MAP: Record<string, string> = {
  à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
  ă: "a", ắ: "a", ặ: "a", ằ: "a", ẳ: "a", ẵ: "a",
  â: "a", ấ: "a", ầ: "a", ẩ: "a", ẫ: "a", ậ: "a",
  è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
  ê: "e", ế: "e", ề: "e", ể: "e", ễ: "e", ệ: "e",
  ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
  ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
  ô: "o", ố: "o", ồ: "o", ổ: "o", ỗ: "o", ộ: "o",
  ơ: "o", ớ: "o", ờ: "o", ở: "o", ỡ: "o", ợ: "o",
  ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
  ư: "u", ứ: "u", ừ: "u", ử: "u", ữ: "u", ự: "u",
  ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  đ: "d",
  // 
  À: "a", Á: "a", Ả: "a", Ã: "a", Ạ: "a",
  Ă: "a", Ắ: "a", Ặ: "a", Ằ: "a", Ẳ: "a", Ẵ: "a",
  Â: "a", Ấ: "a", Ầ: "a", Ẩ: "a", Ẫ: "a", Ậ: "a",
  È: "e", É: "e", Ẻ: "e", Ẽ: "e", Ẹ: "e",
  Ê: "e", Ế: "e", Ề: "e", Ể: "e", Ễ: "e", Ệ: "e",
  Ì: "i", Í: "i", Ỉ: "i", Ĩ: "i", Ị: "i",
  Ò: "o", Ó: "o", Ỏ: "o", Õ: "o", Ọ: "o",
  Ô: "o", Ố: "o", Ồ: "o", Ổ: "o", Ỗ: "o", Ộ: "o",
  Ơ: "o", Ớ: "o", Ờ: "o", Ở: "o", Ỡ: "o", Ợ: "o",
  Ù: "u", Ú: "u", Ủ: "u", Ũ: "u", Ụ: "u",
  Ư: "u", Ứ: "u", Ừ: "u", Ử: "u", Ữ: "u", Ự: "u",
  Ỳ: "y", Ý: "y", Ỷ: "y", Ỹ: "y", Ỵ: "y",
  Đ: "d",
};

// ─── Korean Romanization ──────────────────────────────────────────────────────
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
 * Tạo SEO slug từ bất kỳ chuỗi nào
 * @param text - Chuỗi đầu vào (tiếng Việt, Hàn, Anh...)
 * @param maxLength - Độ dài tối đa (mặc định 80)
 */
export function slugify(text: string, maxLength = 80): string {
  let result = "";

  for (const char of text) {
    // Tiếng Hàn
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      result += koreanToRoman(char);
      continue;
    }
    // Tiếng Việt có dấu
    if (VI_MAP[char]) {
      result += VI_MAP[char];
      continue;
    }
    // ASCII thường
    if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
      continue;
    }
    // Khoảng trắng và dấu gạch ngang → dấu gạch ngang
    if (/[\s\-_]/.test(char)) {
      result += "-";
      continue;
    }
    // Bỏ qua ký tự khác
  }

  return result
    .replace(/-+/g, "-")       // Nhiều dấu gạch ngang → một
    .replace(/^-|-$/g, "")     // Bỏ dấu gạch ngang đầu/cuối
    .slice(0, maxLength)       // Giới hạn độ dài
    || "post";                 // Fallback
}

/**
 * Tạo slug cho bài đăng cộng đồng: chỉ dùng slug từ title (SEO-friendly)
 * Lưu mapping id <-> slug trong localStorage để tra cứu
 */
export function communitySlug(id: string, title: string): string {
  return slugify(title, 80);
}

/**
 * Lấy ID từ community slug
 * Slug format mới: chỉ là title slug (không có UUID)
 * Slug format cũ: {uuid}-{title-slug}
 */
export function extractIdFromSlug(slug: string): string {
  // UUID format cũ: 8-4-4-4-12
  const uuidMatch = slug.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (uuidMatch) return uuidMatch[1];

  // Timestamp ID (số)
  const numMatch = slug.match(/^(\d+)/);
  if (numMatch) return numMatch[1];

  // Slug mới: cần tra cứu từ Supabase theo title slug
  return slug;
}
