import { useParams } from "react-router-dom";
import PostDetailPage from "./PostDetail";
import { extractIdFromSlug } from "@/lib/slugify";

export default function PostDetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  // Hỗ trợ cả slug SEO mới (title-slug) và slug cũ (uuid-title-slug) và ID thuần
  // Nếu là UUID hoặc số → dùng trực tiếp
  // Nếu là slug title → truyền nguyên để PostDetail tra cứu theo slug
  const postId = extractIdFromSlug(id);
  // Nếu extractIdFromSlug trả về nguyên slug (không phải UUID/số) → là slug mới
  const isSlug = postId === id && !/^[0-9a-f]{8}-[0-9a-f]{4}/.test(id) && !/^\d+$/.test(id);
  return <PostDetailPage postId={postId} titleSlug={isSlug ? id : undefined} />;
}
