import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function HanjaAnalyticsPage() {
  const [stats, setStats] = useState({
    totalWords: 0,
    learnedWords: 0,
    completedTrees: 0,
    flashcardCount: 0,
    masteredFlashcards: 0,
    dueForReview: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        // Get learned words from localStorage
        const learnedKey = 'kts_hanja_learned';
        const learnedSet = new Set(JSON.parse(localStorage.getItem(learnedKey) || '[]'));

        // Get flashcard stats
        const { data: flashcards } = await supabase
          .from('hanja_flashcards')
          .select('*')
          .eq('user_id', user.id);

        // Get due for review
        const { count: dueCount } = await supabase
          .from('hanja_flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('next_review_at', new Date().toISOString());

        setStats({
          totalWords: 3501, // Approximate total
          learnedWords: learnedSet.size,
          completedTrees: 0, // Would need to track this
          flashcardCount: flashcards?.length || 0,
          masteredFlashcards: flashcards?.filter(f => f.mastered).length || 0,
          dueForReview: dueCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <i className="ri-loader-4-line animate-spin text-white/30 text-3xl"></i>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white/90 mb-2">Thống kê Hán Hàn</h1>
          <p className="text-sm text-white/40">Theo dõi tiến độ học tập của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Learned Words */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/20">
                <i className="ri-book-open-line text-emerald-400 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-white/40">Từ đã học</p>
                <p className="text-2xl font-bold text-white/90">{stats.learnedWords}</p>
              </div>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(stats.learnedWords / stats.totalWords) * 100}%` }} />
            </div>
            <p className="text-[10px] text-white/30 mt-2">{stats.learnedWords}/{stats.totalWords} từ</p>
          </div>

          {/* Flashcard Count */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/20">
                <i className="ri-flashcard-line text-blue-400 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-white/40">Flashcard</p>
                <p className="text-2xl font-bold text-white/90">{stats.flashcardCount}</p>
              </div>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(stats.masteredFlashcards / stats.flashcardCount) * 100 || 0}%` }} />
            </div>
            <p className="text-[10px] text-white/30 mt-2">{stats.masteredFlashcards} đã thuộc</p>
          </div>

          {/* Due for Review */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-rose-500/20">
                <i className="ri-brain-line text-rose-400 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-white/40">Cần ôn tập</p>
                <p className="text-2xl font-bold text-white/90">{stats.dueForReview}</p>
              </div>
            </div>
            <p className="text-[10px] text-white/40 mt-2">Từ đến hạn ôn</p>
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white/90 mb-4">Tiến độ học tập</h2>
          <div className="h-48 flex items-center justify-center bg-white/5 rounded-lg">
            <p className="text-sm text-white/30">Biểu đồ tiến độ (sẽ thêm sau)</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
