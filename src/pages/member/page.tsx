import { useParams, Navigate } from "react-router-dom";

// Route /member/:userId cũ — redirect sang /public-profile/:userId để dùng data thật
// Code cũ hardcode "Kim Minji" đã xóa (xem git commit trước 0b3c9b8)
export default function MemberProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={`/public-profile/${userId ?? ""}`} replace />;
}
