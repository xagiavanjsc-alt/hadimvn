import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Props {
  onClose: () => void;
  /** Called after the user successfully saves a new display name. */
  onSaved?: (newName: string) => void;
  /** Show the modal in "blocking" mode — hide the Skip button. Used when a
   *  public action (post / comment) requires the name to change first. */
  blocking?: boolean;
}

/**
 * Prompts a user whose display_name still leaks their email (e.g. the
 * "abc@gmail.com" local-part after Google OAuth) to pick a safe name.
 *
 * Cascades the new name into community_posts.author_name and
 * community_comments.author_name so prior posts stop showing the email-like
 * name.
 */
export default function DisplayNamePromptModal({ onClose, onSaved, blocking = false }: Props) {
  const { user, profile, updateProfile } = useAuthContext();
  const navigate = useNavigate();

  // Pre-fill: if current name contains "@", strip the domain to give the user
  // a sane starting point. Otherwise leave blank so they're nudged to think
  // of a real name.
  const suggested = useMemo(() => {
    const cur = profile?.display_name ?? "";
    if (cur.includes("@")) return cur.split("@")[0];
    return "";
  }, [profile?.display_name]);

  const [name, setName] = useState(suggested);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (raw: string): string | null => {
    const v = raw.trim();
    if (v.length < 2) return "Tên hiển thị tối thiểu 2 ký tự";
    if (v.length > 30) return "Tên hiển thị tối đa 30 ký tự";
    if (v.includes("@")) return "Tên không được chứa ký tự '@' (tránh lộ email)";
    return null;
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    const err = validate(trimmed);
    if (err) { setError(err); return; }
    if (!user) { setError("Cần đăng nhập"); return; }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({ display_name: trimmed });
      if (!updated) {
        setError("Lưu thất bại. Vui lòng thử lại.");
        return;
      }
      // Cascade into past posts/comments so they stop displaying the
      // email-like name. Failures here are non-fatal — name is changed
      // regardless and admin can re-run if needed.
      void Promise.all([
        supabase.from("community_posts")
          .update({ author_name: trimmed })
          .eq("user_id", user.id),
        supabase.from("community_comments")
          .update({ author_name: trimmed })
          .eq("user_id", user.id),
      ]).catch(e => console.warn("[DisplayNamePrompt] cascade update failed:", e));

      onSaved?.(trimmed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1a1d27] border border-app-border rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/15 flex-shrink-0">
              <i className="ri-shield-user-line text-amber-400 text-xl"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white/90 leading-snug">
                Đổi tên hiển thị để bảo vệ riêng tư
              </h3>
              <p className="text-xs text-app-text-secondary mt-1 leading-relaxed">
                Tên hiện tại của bạn (<span className="text-white/70 font-medium">{profile?.display_name}</span>) trông giống email.
                Để tránh lộ thông tin liên hệ trên bảng xếp hạng và cộng đồng, hãy chọn một tên hiển thị khác.
              </p>
            </div>
          </div>

          <label className="block text-xs font-medium text-white/70 mb-1.5">Tên hiển thị mới</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(null); }}
            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
            placeholder="VD: Minh Anh, Học viên K53..."
            maxLength={30}
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg bg-app-card/50 border border-app-border text-white/90 text-sm placeholder-white/30 focus:outline-none focus:border-app-accent-primary/50 transition-colors"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-app-text-muted">2-30 ký tự, không chứa @</p>
            <p className="text-[10px] text-app-text-muted">{name.trim().length}/30</p>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>{error}
            </p>
          )}

          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {saving ? "Đang lưu..." : "Lưu tên mới"}
            </button>
            {!blocking && (
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/60 text-sm cursor-pointer transition-colors"
              >
                Để sau
              </button>
            )}
          </div>

          <button
            onClick={() => { onClose(); navigate("/profile"); }}
            className="mt-3 w-full text-xs text-app-text-muted hover:text-white/60 cursor-pointer text-center"
          >
            Hoặc đổi trong trang Hồ sơ →
          </button>
        </div>
      </div>
    </div>
  );
}
