import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  location: string;
  exam_type: "EPS" | "TOPIK_I" | "TOPIK_II";
  member_count: number;
  max_members: number;
  created_by: string;
  created_at: string;
  is_joined: boolean;
}

const VIETNAM_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Bình Dương",
  "Đồng Nai",
  "Hải Phòng",
  "Đà Nẵng",
  "Cần Thơ",
  "Khác",
];

export default function StudyGroupsPage() {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    location: "",
    exam_type: "EPS" as const,
    max_members: 50,
  });

  usePageSEO({
    title: "Nhóm học tập EPS/TOPIK | Hàn Quốc Ơi!",
    description: "Tham gia nhóm học tập EPS/TOPIK theo địa phương. Kết nối với người học khác, chia sẻ kinh nghiệm thi, hỗ trợ lẫn nhau.",
    keywords: "nhóm học EPS, nhóm học TOPIK, study groups, học nhóm tiếng Hàn",
    path: "/study-groups",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nhóm học tập EPS/TOPIK",
      description: "Study groups for EPS/TOPIK exam preparation",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: groupsData, error } = await supabase
        .from("study_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check which groups user has joined
      const { data: memberships } = await supabase
        .from("study_group_members")
        .select("group_id")
        .eq("user_id", user?.id);

      const joinedGroupIds = new Set(memberships?.map(m => m.group_id) || []);

      const groupsWithStatus = (groupsData || []).map((group: StudyGroup) => ({
        ...group,
        is_joined: joinedGroupIds.has(group.id),
      }));

      setGroups(groupsWithStatus);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleCreateGroup = async () => {
    if (!user) return;

    try {
      const { data: newGroupData, error } = await supabase
        .from("study_groups")
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          location: newGroup.location,
          exam_type: newGroup.exam_type,
          max_members: newGroup.max_members,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the created group
      await supabase.from("study_group_members").insert({
        group_id: newGroupData.id,
        user_id: user.id,
      });

      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", location: "", exam_type: "EPS", max_members: 50 });
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("study_group_members").insert({
        group_id: groupId,
        user_id: user.id,
      });

      if (error) throw error;
      fetchGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("study_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "EPS": return "#4ade80";
      case "TOPIK_I": return "#60a5fa";
      case "TOPIK_II": return "#f87171";
      default: return "#94a3b8";
    }
  };

  return (
    <DashboardLayout title="Nhóm học tập" subtitle="Kết nối và học cùng nhau">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-lg font-bold">Tìm nhóm học tập</h2>
              <p className="text-app-text-muted text-sm">Tham gia nhóm theo địa phương để học cùng nhau</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              <i className="ri-add-line mr-1"></i>Tạo nhóm mới
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-app-surface/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{groups.length}</p>
              <p className="text-app-text-muted text-xs">Tổng nhóm</p>
            </div>
            <div className="bg-app-surface/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-app-accent-primary">
                {groups.filter(g => g.is_joined).length}
              </p>
              <p className="text-app-text-muted text-xs">Đã tham gia</p>
            </div>
            <div className="bg-app-surface/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {groups.reduce((sum, g) => sum + g.member_count, 0)}
              </p>
              <p className="text-app-text-muted text-xs">Tổng thành viên</p>
            </div>
          </div>
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-group-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Chưa có nhóm nào</p>
            <p className="text-app-text-muted text-sm mb-4">Tạo nhóm mới để bắt đầu học cùng nhau</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Tạo nhóm mới
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(group => (
              <div
                key={group.id}
                className="bg-app-bg border border-app-border rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getExamTypeColor(group.exam_type)}15`,
                          color: getExamTypeColor(group.exam_type),
                        }}
                      >
                        {group.exam_type}
                      </span>
                      <span className="text-app-text-muted text-xs">
                        <i className="ri-map-pin-line mr-1"></i>{group.location}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-base mb-1">{group.name}</h3>
                    <p className="text-app-text-muted text-sm">{group.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-semibold">
                      {group.member_count}/{group.max_members}
                    </p>
                    <p className="text-app-text-muted text-xs">thành viên</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-app-border">
                  <p className="text-app-text-faint text-xs">
                    Tạo {new Date(group.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  {group.is_joined ? (
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-red-500/10 transition-colors"
                      style={{ borderColor: "#f87171", color: "#f87171" }}
                    >
                      Rời nhóm
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.member_count >= group.max_members}
                      className="px-3 py-1.5 rounded-lg bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {group.member_count >= group.max_members ? "Đầy" : "Tham gia"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="p-5 border-b border-app-border">
              <h3 className="text-white font-bold text-lg">Tạo nhóm học tập mới</h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Tên nhóm</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="VD: Nhóm học EPS Hà Nội"
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                />
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Mô tả</label>
                <textarea
                  value={newGroup.description}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Mô tả về nhóm học tập..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Địa điểm</label>
                <select
                  value={newGroup.location}
                  onChange={e => setNewGroup({ ...newGroup, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                >
                  <option value="">Chọn địa điểm</option>
                  {VIETNAM_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Loại thi</label>
                <select
                  value={newGroup.exam_type}
                  onChange={e => setNewGroup({ ...newGroup, exam_type: e.target.value as "EPS" | "TOPIK_I" | "TOPIK_II" })}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                >
                  <option value="EPS">EPS-TOPIK</option>
                  <option value="TOPIK_I">TOPIK I</option>
                  <option value="TOPIK_II">TOPIK II</option>
                </select>
              </div>

              <div>
                <label className="text-app-text-muted text-xs mb-1 block">Số thành viên tối đa</label>
                <input
                  type="number"
                  value={newGroup.max_members}
                  onChange={e => setNewGroup({ ...newGroup, max_members: parseInt(e.target.value) || 50 })}
                  min={5}
                  max={100}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                />
              </div>
            </div>

            <div className="p-5 border-t border-app-border flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroup.name || !newGroup.location}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
