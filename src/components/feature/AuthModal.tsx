import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStudySync } from "@/hooks/useStudySync";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const { syncToCloud, loadFromCloud, updateLeaderboard } = useStudySync();
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const translateError = (msg: string): string => {
    if (msg.includes("Invalid login credentials")) return "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
    if (msg.includes("Email not confirmed")) return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư và nhấn link xác nhận.";
    if (msg.includes("User already registered")) return "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.";
    if (msg.includes("Password should be at least")) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (msg.includes("Unable to validate email")) return "Email không hợp lệ. Vui lòng kiểm tra lại.";
    if (msg.includes("rate limit")) return "Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.";
    if (msg.includes("network")) return "Lỗi kết nối mạng. Vui lòng thử lại.";
    return msg;
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: "select_account" },
        },
      });
      if (err) setError(translateError(err.message));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendLoading(true);
    const { error: err } = await supabase.auth.resend({ type: "signup", email });
    setResendLoading(false);
    if (err) {
      setError(translateError(err.message));
    } else {
      setSuccess("Email xác nhận đã được gửi lại! Kiểm tra hộp thư (kể cả thư mục Spam).");
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vui lòng nhập email"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account-settings`,
    });
    setLoading(false);
    if (err) { setError(translateError(err.message)); return; }
    setSuccess("Email đặt lại mật khẩu đã được gửi! Kiểm tra hộp thư của bạn (kể cả thư mục Spam).");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error: err } = await signIn(email, password);
        if (err) {
          setError(translateError(err.message));
          return;
        }
        if (data.user) {
          await loadFromCloud(data.user.id);
          await updateLeaderboard(data.user.id, data.user.user_metadata?.display_name || email.split("@")[0]);
          setSuccess("Đăng nhập thành công! Đang đồng bộ dữ liệu...");
          setTimeout(onClose, 1000);
        }
      } else {
        if (!displayName.trim()) { setError("Vui lòng nhập tên hiển thị"); return; }
        if (password.length < 6) { setError("Mật khẩu phải có ít nhất 6 ký tự"); return; }
        const { data, error: err } = await signUp(email, password, displayName);
        if (err) {
          setError(translateError(err.message));
          return;
        }
        // Show email verification screen
        setMode("verify");
        if (data.user && data.session) {
          // Auto-confirmed (email confirmation disabled in Supabase)
          await syncToCloud(data.user.id);
          await updateLeaderboard(data.user.id, displayName);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email verification screen ──────────────────────────────────────────
  if (mode === "verify") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div className="bg-[#1a1d27] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#e8c84a]/10 mx-auto mb-4">
              <i className="ri-mail-check-line text-[#e8c84a] text-3xl"></i>
            </div>
            <h2 className="text-white text-lg font-bold mb-2">Kiểm tra email của bạn!</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-2">
              Chúng tôi đã gửi email xác nhận đến:
            </p>
            <p className="text-[#e8c84a] font-semibold text-sm mb-4 break-all">{email}</p>
            <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-5 text-left space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[#e8c84a] font-bold text-sm flex-shrink-0">1.</span>
                <p className="text-white/60 text-xs">Mở email và nhấn vào link xác nhận tài khoản</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#e8c84a] font-bold text-sm flex-shrink-0">2.</span>
                <p className="text-white/60 text-xs">Kiểm tra cả thư mục <strong className="text-white/80">Spam / Junk</strong> nếu không thấy</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#e8c84a] font-bold text-sm flex-shrink-0">3.</span>
                <p className="text-white/60 text-xs">Sau khi xác nhận, quay lại đây và đăng nhập</p>
              </div>
            </div>

            {success && <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-3">{success}</p>}
            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">{error}</p>}

            <button
              onClick={handleResendConfirmation}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full py-2.5 mb-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {resendLoading ? "Đang gửi..." : resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại email xác nhận"}
            </button>
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="w-full py-2.5 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Đã xác nhận — Đăng nhập ngay
            </button>
            <button onClick={onClose} className="mt-3 text-white/30 text-xs hover:text-white/60 cursor-pointer">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm p-4"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-[#1a1d27] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col"
        style={{ maxHeight: "min(90vh, 580px)", overflowY: "auto", position: "relative", zIndex: 1 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-white text-lg font-bold">
              {mode === "login" ? "Đăng nhập" : mode === "register" ? "Tạo tài khoản" : "Quên mật khẩu"}
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              {mode === "forgot" ? "Nhập email để đặt lại mật khẩu" : "Đồng bộ dữ liệu học tập lên cloud"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Cloud sync benefit */}
          {mode !== "forgot" && (
            <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-3 flex items-start gap-2.5">
              <i className="ri-cloud-line text-[#e8c84a] text-sm mt-0.5 flex-shrink-0"></i>
              <p className="text-white/55 text-xs leading-relaxed">
                Streak, flashcard, điểm EPS lưu cloud — không mất khi đổi thiết bị!
              </p>
            </div>
          )}

          {/* Google OAuth button */}
          {mode !== "forgot" && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white hover:bg-white/90 disabled:opacity-60 text-[#1a1d27] font-semibold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-[#1a1d27]/30 border-t-[#1a1d27] rounded-full animate-spin"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? "Đang kết nối..." : "Tiếp tục với Google"}
              </button>

              {/* Google note */}
              <p className="text-white/25 text-[10px] text-center -mt-2">
                Nếu Google không hoạt động, hãy dùng email/mật khẩu bên dưới
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8"></div>
                <span className="text-white/25 text-xs">hoặc</span>
                <div className="flex-1 h-px bg-white/8"></div>
              </div>
            </>
          )}

          {/* Forgot password form */}
          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40"
                />
              </div>
              {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap disabled:opacity-50">
                {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
              </button>
              <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className="w-full text-white/40 text-xs hover:text-white/70 cursor-pointer py-1">
                ← Quay lại đăng nhập
              </button>
            </form>
          ) : (
            /* Email/password form */
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">Tên hiển thị</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40" />
                </div>
              )}
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Email</label>
                <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com" required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/50 text-xs">Mật khẩu</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                      className="text-[#e8c84a]/60 text-[10px] hover:text-[#e8c84a] cursor-pointer whitespace-nowrap">
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                    <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-red-400 text-xs">{error}</p>
                  {error.includes("chưa được xác nhận") && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading || resendCooldown > 0}
                      className="mt-1.5 text-[#e8c84a] text-[10px] hover:underline cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại email xác nhận →"}
                    </button>
                  )}
                </div>
              )}
              {success && <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#e8c84a] hover:bg-[#d4b43a] text-[#0f1117] font-bold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50">
                {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>

              {mode === "register" && (
                <p className="text-white/25 text-[10px] text-center leading-relaxed">
                  Sau khi đăng ký, bạn sẽ nhận email xác nhận. Kiểm tra cả thư mục Spam nhé!
                </p>
              )}
            </form>
          )}

          {/* Switch mode */}
          {mode !== "forgot" && (
            <div className="text-center pt-1">
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
                className="text-white/40 text-xs hover:text-white/70 cursor-pointer">
                {mode === "login" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
