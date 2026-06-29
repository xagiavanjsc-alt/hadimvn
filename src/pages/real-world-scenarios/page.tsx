import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRealWorldScenarios } from "@/hooks/useRealWorldScenarios";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function RealWorldScenariosPage() {
  const { user } = useAuth();
  const {
    scenarios,
    selectedType,
    loading,
    filterByType,
    clearFilter,
    getFilteredScenarios,
    getScenario,
    getTypeLabel,
    getTypeIcon,
    getTypeColor,
    getDifficultyLabel,
    getDifficultyColor,
  } = useRealWorldScenarios();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  usePageSEO({
    title: "Tình huống thực tế | Hàn Quốc Ơi!",
    description: "Học tiếng Hàn qua tình huống thực tế:.phỏng vấn, email công việc, hội thoại công trường.",
    keywords: "tình huống thực tế, real-world scenarios, phỏng vấn, email, hội thoại",
    path: "/real-world-scenarios",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Tình huống thực tế",
      description: "Real-world scenarios for Korean learning",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const filteredScenarios = getFilteredScenarios();

  const handleScenarioClick = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  return (
    <DashboardLayout title="Tình huống thực tế" subtitle="Phỏng vấn, Email, Hội thoại">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{scenarios.length}</p>
            <p className="text-app-text-muted text-xs">Tình huống</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">
              {scenarios.filter(s => s.type === "interview").length}
            </p>
            <p className="text-app-text-muted text-xs">Phỏng vấn</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {scenarios.filter(s => s.type === "email").length}
            </p>
            <p className="text-app-text-muted text-xs">Email</p>
          </div>
        </div>

        {/* Type Filter */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Lọc theo loại</h2>
            {selectedType && (
              <button
                onClick={clearFilter}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["interview", "email", "conversation"] as const).map((type) => (
              <button
                key={type}
                onClick={() => filterByType(type)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedType === type
                    ? "border-app-accent-primary bg-app-accent-primary/10"
                    : "border-app-border hover:border-app-border/50 bg-app-surface/30"
                }`}
              >
                <div className="text-3xl mb-2">
                  <i className={getTypeIcon(type)} style={{ color: getTypeColor(type) }} />
                </div>
                <p className="text-white text-sm font-medium">{getTypeLabel(type)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-book-open-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Không tìm thấy tình huống</p>
            <p className="text-app-text-muted text-sm mb-4">Thử thay đổi bộ lọc hoặc xóa bộ lọc hiện tại</p>
            <button
              onClick={clearFilter}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Tình huống</h2>
            <div className="space-y-3">
              {filteredScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => handleScenarioClick(scenario.id)}
                  className="bg-app-surface/30 rounded-xl p-4 cursor-pointer hover:bg-app-surface/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${getTypeColor(scenario.type)}15` }}
                      >
                        <i
                          className={getTypeIcon(scenario.type)}
                          style={{ color: getTypeColor(scenario.type) }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-medium">{scenario.title}</h3>
                        <p className="text-app-text-muted text-xs">{scenario.category}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getDifficultyColor(scenario.difficulty)}15`,
                        color: getDifficultyColor(scenario.difficulty),
                      }}
                    >
                      {getDifficultyLabel(scenario.difficulty)}
                    </span>
                  </div>
                  <p className="text-app-text-muted text-xs line-clamp-2">
                    {scenario.content.vietnamese}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenario Detail Modal */}
        {selectedScenario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
              className="w-full max-w-lg rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
            >
              <div className="p-5 border-b border-app-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">
                    {getScenario(selectedScenario)?.title}
                  </h3>
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="text-app-text-muted hover:text-white cursor-pointer"
                  >
                    <i className="ri-close-line text-xl" />
                  </button>
                </div>
              </div>

              {getScenario(selectedScenario) && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${getTypeColor(getScenario(selectedScenario)!.type)}15` }}
                    >
                      <i
                        className={getTypeIcon(getScenario(selectedScenario)!.type)}
                        style={{ color: getTypeColor(getScenario(selectedScenario)!.type) }}
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{getTypeLabel(getScenario(selectedScenario)!.type)}</p>
                      <p className="text-app-text-muted text-xs">{getScenario(selectedScenario)!.category}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-app-text-muted text-xs mb-1">Tiếng Hàn</p>
                    <div className="bg-app-surface/50 rounded-lg p-3">
                      <p className="text-white text-sm whitespace-pre-line">
                        {getScenario(selectedScenario)!.content.korean}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-app-text-muted text-xs mb-1">Tiếng Việt</p>
                    <div className="bg-app-surface/50 rounded-lg p-3">
                      <p className="text-white text-sm whitespace-pre-line">
                        {getScenario(selectedScenario)!.content.vietnamese}
                      </p>
                    </div>
                  </div>

                  {getScenario(selectedScenario)!.tips.length > 0 && (
                    <div>
                      <p className="text-app-accent-primary text-xs font-semibold mb-2">
                        <i className="ri-lightbulb-line mr-1"></i>Mẹo
                      </p>
                      <ul className="text-app-text-muted text-xs space-y-1">
                        {getScenario(selectedScenario)!.tips.map((tip, idx) => (
                          <li key={idx}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {getScenario(selectedScenario)!.vocabulary.length > 0 && (
                    <div>
                      <p className="text-app-accent-primary text-xs font-semibold mb-2">
                        <i className="ri-book-line mr-1"></i>Từ vựng
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getScenario(selectedScenario)!.vocabulary.map((word, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-app-surface/50 text-app-text-muted">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Học qua tình huống thực tế: phỏng vấn, email, hội thoại</li>
            <li>• Mẹo và từ vựng cho mỗi tình huống</li>
            <li>• Áp dụng ngay vào công việc EPS thực tế</li>
            <li>• Lọc theo loại để tập trung vào nhu cầu cụ thể</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
