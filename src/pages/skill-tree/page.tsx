import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSkillTree } from "@/hooks/useSkillTree";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function SkillTreePage() {
  const { user } = useAuth();
  const { skillTree, selectedNode, setSelectedNode, completeNode, getNode, getProgress, getCategoryNodes } = useSkillTree();
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  usePageSEO({
    title: "Cây kỹ năng học tập | Hàn Quốc Ơi!",
    description: "Xem toàn cảnh lộ trình học tập với cây kỹ năng. Theo dõi tiến độ và mở khóa bài học mới.",
    keywords: "cây kỹ năng, skill tree, lộ trình học tập, unlock system",
    path: "/skill-tree",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Cây kỹ năng học tập",
      description: "Skill tree visualization for learning progress",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const progress = getProgress();
  const epsNodes = getCategoryNodes("eps");

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleComplete = (nodeId: string) => {
    completeNode(nodeId);
  };

  const getNodeColor = (node: any) => {
    if (node.completed) return "#4ade80";
    if (node.unlocked) return "#60a5fa";
    return "#64748b";
  };

  const getNodeIcon = (node: any) => {
    if (node.type === "milestone") return "ri-trophy-line";
    if (node.type === "skill") return "ri-skill-line";
    return "ri-book-open-line";
  };

  return (
    <DashboardLayout title="Cây kỹ năng học tập" subtitle="Toàn cảnh lộ trình EPS">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{progress.completed}</p>
            <p className="text-app-text-muted text-xs">Đã hoàn thành</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{progress.total}</p>
            <p className="text-app-text-muted text-xs">Tổng số</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{progress.percentage.toFixed(0)}%</p>
            <p className="text-app-text-muted text-xs">Tiến độ</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex-1 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                viewMode === "tree"
                  ? "bg-app-accent-primary text-app-bg font-semibold"
                  : "bg-app-surface/30 text-app-text-muted"
              }`}
            >
              <i className="ri-node-tree mr-1"></i>Cây kỹ năng
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                viewMode === "list"
                  ? "bg-app-accent-primary text-app-bg font-semibold"
                  : "bg-app-surface/30 text-app-text-muted"
              }`}
            >
              <i className="ri-list-check mr-1"></i>Danh sách
            </button>
          </div>
        </div>

        {/* Tree View */}
        {viewMode === "tree" && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="grid grid-cols-10 gap-2">
              {epsNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className={`relative aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    node.completed
                      ? "bg-emerald-500/20 border-2 border-emerald-500"
                      : node.unlocked
                      ? "bg-blue-500/20 border-2 border-blue-500"
                      : "bg-app-surface/30 border-2 border-app-border opacity-50"
                  }`}
                  style={{
                    gridColumn: `span ${node.type === "milestone" ? 2 : 1}`,
                  }}
                >
                  <div className="text-center">
                    <i
                      className={`${getNodeIcon(node)} text-2xl`}
                      style={{ color: getNodeColor(node) }}
                    />
                    <p className="text-white text-xs mt-1 font-medium">{node.title}</p>
                  </div>
                  {node.completed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-white text-xs" />
                    </div>
                  )}
                  {!node.unlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-app-surface rounded-full flex items-center justify-center">
                      <i className="ri-lock-line text-app-text-muted text-xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="space-y-2">
              {epsNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    node.completed
                      ? "bg-emerald-500/10"
                      : node.unlocked
                      ? "bg-blue-500/10"
                      : "bg-app-surface/30 opacity-50"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${getNodeColor(node)}15` }}
                  >
                    <i
                      className={`${getNodeIcon(node)} text-lg`}
                      style={{ color: getNodeColor(node) }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{node.title}</p>
                      {node.type === "milestone" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-app-accent-primary/20 text-app-accent-primary">
                          Mốc
                        </span>
                      )}
                    </div>
                    <p className="text-app-text-muted text-xs">{node.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-app-text-muted">+{node.xpReward} XP</span>
                    {node.completed && (
                      <i className="ri-checkbox-circle-fill text-emerald-400 text-lg" />
                    )}
                    {!node.unlocked && (
                      <i className="ri-lock-line text-app-text-muted text-lg" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node Detail Modal */}
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div
              className="w-full max-w-md rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
            >
              <div className="p-5 border-b border-app-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">{getNode(selectedNode)?.title}</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-app-text-muted hover:text-white cursor-pointer"
                  >
                    <i className="ri-close-line text-xl" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${getNodeColor(getNode(selectedNode)!)}15` }}
                  >
                    <i
                      className={`${getNodeIcon(getNode(selectedNode)!)} text-2xl`}
                      style={{ color: getNodeColor(getNode(selectedNode)!) }}
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{getNode(selectedNode)?.description}</p>
                    <p className="text-app-text-muted text-sm">+{getNode(selectedNode)?.xpReward} XP</p>
                  </div>
                </div>

                {getNode(selectedNode)?.prerequisites.length > 0 && (
                  <div>
                    <p className="text-app-text-muted text-xs mb-2">Yêu cầu trước:</p>
                    <div className="flex flex-wrap gap-2">
                      {getNode(selectedNode)?.prerequisites.map((prereqId) => {
                        const prereqNode = getNode(prereqId);
                        return (
                          <span
                            key={prereqId}
                            className={`text-xs px-2 py-1 rounded-full ${
                              prereqNode?.completed
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-app-surface/30 text-app-text-muted"
                            }`}
                          >
                            {prereqNode?.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {getNode(selectedNode)?.unlocked && !getNode(selectedNode)?.completed && (
                    <button
                      onClick={() => handleComplete(selectedNode)}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold cursor-pointer transition-colors"
                    >
                      Hoàn thành
                    </button>
                  )}
                  {getNode(selectedNode)?.completed && (
                    <button
                      disabled
                      className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold cursor-not-allowed"
                    >
                      Đã hoàn thành
                    </button>
                  )}
                  {!getNode(selectedNode)?.unlocked && (
                    <button
                      disabled
                      className="flex-1 py-3 rounded-xl bg-app-surface/30 text-app-text-muted font-bold cursor-not-allowed"
                    >
                      Chưa mở khóa
                    </button>
                  )}
                </div>
              </div>
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
            <li>• Mỗi bài học cần hoàn thành bài trước để mở khóa bài tiếp theo</li>
            <li>• Các mốc quan trọng (10, 30, 60 bài) có thưởng XP cao</li>
            <li>• Xem toàn cảnh lộ trình để biết mình đang ở đâu</li>
            <li>• Hoàn thành bài học để nhận XP và mở khóa nội dung mới</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
