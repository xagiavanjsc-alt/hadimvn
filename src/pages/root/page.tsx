import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse">
          <i className="ri-leaf-line text-white text-lg"></i>
        </div>
        <p className="text-app-text-secondary text-sm">Đang tải...</p>
      </div>
    </div>
  );
}
