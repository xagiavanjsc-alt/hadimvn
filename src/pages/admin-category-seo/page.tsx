import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface CategorySEO {
  id: string;
  category_name: string;
  category_type: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
  canonical_url: string;
  meta_robots: string;
}

const DEFAULT_FORM = {
  category_name: "",
  category_type: "community",
  title: "",
  description: "",
  keywords: "",
  og_image: "",
  canonical_url: "",
  meta_robots: "index, follow",
};

export default function AdminCategorySEOPage() {
  const [categories, setCategories] = useState<CategorySEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategorySEO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [filterType, setFilterType] = useState<"all" | "community" | "hanja">("all");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("category_seo")
        .select("*")
        .order("category_type, category_name");
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error loading category SEO:", err);
      showToast("Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleEdit = (cat: CategorySEO) => {
    setEditing(cat);
    setForm({
      category_name: cat.category_name,
      category_type: cat.category_type as "community" | "hanja",
      title: cat.title || "",
      description: cat.description || "",
      keywords: cat.keywords || "",
      og_image: cat.og_image || "",
      canonical_url: cat.canonical_url || "",
      meta_robots: cat.meta_robots || "index, follow",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("category_seo")
        .upsert({
          id: editing?.id,
          category_name: form.category_name,
          category_type: form.category_type,
          title: form.title,
          description: form.description,
          keywords: form.keywords,
          og_image: form.og_image,
          canonical_url: form.canonical_url,
          meta_robots: form.meta_robots,
          updated_at: new Date().toISOString(),
        }, { onConflict: "category_name" });
      
      if (error) throw error;
      showToast("Đã lưu SEO danh mục!");
      setIsModalOpen(false);
      setEditing(null);
      setForm(DEFAULT_FORM);
      loadCategories();
    } catch (err) {
      console.error("Error saving category SEO:", err);
      showToast("Lỗi lưu SEO danh mục");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa SEO của danh mục này?")) return;
    try {
      const { error } = await supabase
        .from("category_seo")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      showToast("Đã xóa SEO danh mục!");
      loadCategories();
    } catch (err) {
      console.error("Error deleting category SEO:", err);
      showToast("Lỗi xóa SEO danh mục");
    }
  };

  const filteredCategories = filterType === "all" 
    ? categories 
    : categories.filter(c => c.category_type === filterType);

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">SEO Danh mục</h1>
          <p className="text-app-text-secondary text-sm">Cấu hình SEO cho các danh mục (community, hanja)</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${filterType === "all" ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-app-text-muted border border-app-border"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType("community")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${filterType === "community" ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-app-text-muted border border-app-border"}`}
          >
            Cộng đồng
          </button>
          <button
            onClick={() => setFilterType("hanja")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${filterType === "hanja" ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-app-text-muted border border-app-border"}`}
          >
            Hán Hàn
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-app-text-secondary">
            <i className="ri-loader-4-line animate-spin text-2xl mb-2"></i>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-app-surface/50 border border-app-border rounded-xl p-4 hover:border-app-accent-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.category_type === "community" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                      {cat.category_type}
                    </span>
                    <h3 className="text-white font-semibold mt-2">{cat.category_name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-surface hover:bg-app-hover text-app-text-muted hover:text-white cursor-pointer transition-colors"
                    >
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-surface hover:bg-red-500/10 text-app-text-muted hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                </div>
                
                {cat.title && (
                  <p className="text-app-text-secondary text-xs mb-2 line-clamp-2">{cat.title}</p>
                )}
                
                {cat.description && (
                  <p className="text-app-text-muted text-xs line-clamp-3">{cat.description}</p>
                )}

                {!cat.title && !cat.description && (
                  <p className="text-app-text-faint text-xs italic">Chưa cấu hình SEO</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-app-border">
                <h2 className="text-white font-bold text-lg">
                  {editing ? "Chỉnh sửa SEO danh mục" : "Thêm SEO danh mục"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditing(null);
                    setForm(DEFAULT_FORM);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-surface hover:bg-app-hover text-app-text-muted hover:text-white cursor-pointer transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên danh mục</label>
                    <input
                      type="text"
                      value={form.category_name}
                      onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                      className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                      placeholder="share"
                    />
                  </div>
                  <div>
                    <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Loại danh mục</label>
                    <select
                      value={form.category_type}
                      onChange={(e) => setForm({ ...form, category_type: e.target.value as "community" | "hanja" })}
                      className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    >
                      <option value="community">Cộng đồng</option>
                      <option value="hanja">Hán Hàn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Title (Tiêu đề SEO)</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="Tiêu đề hiển thị trên Google"
                  />
                </div>

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Description (Mô tả)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary resize-none"
                    placeholder="Mô tả ngắn về danh mục..."
                  />
                </div>

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Keywords (Từ khóa)</label>
                  <input
                    type="text"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                  />
                </div>

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">OG Image URL</label>
                  <input
                    type="text"
                    value={form.og_image}
                    onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                    className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="https://hanquocoi.vn/og-category.png"
                  />
                </div>

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Canonical URL</label>
                  <input
                    type="text"
                    value={form.canonical_url}
                    onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
                    className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="https://hanquocoi.vn/community/category/share"
                  />
                </div>

                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Meta Robots</label>
                  <select
                    value={form.meta_robots}
                    onChange={(e) => setForm({ ...form, meta_robots: e.target.value })}
                    className="w-full bg-app-surface/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                  >
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditing(null);
                      setForm(DEFAULT_FORM);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-app-surface/50 text-app-text-muted border border-app-border hover:bg-app-hover cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg cursor-pointer transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-app-accent-success/10 border border-app-accent-success/30 rounded-xl px-5 py-3 text-app-accent-success text-sm font-medium flex items-center gap-2">
            <i className="ri-checkbox-circle-line"></i>
            {toast}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
