import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

interface ToggleItemProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleItem = ({ label, description, value, onChange }: ToggleItemProps) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-app-text-muted mt-0.5">{description}</p>
    </div>
    {/* Custom Toggle */}
    <div className="relative">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="opacity-0 absolute w-0 h-0"
        id={`toggle-${label}`}
      />
      <label
        htmlFor={`toggle-${label}`}
        className={`flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${
          value ? "bg-app-accent-primary" : "bg-app-surface/30"
        }`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            value ? "translate-x-5.5" : "translate-x-0.5"
          }`}
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </label>
    </div>
  </div>
);

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { settings, permission, requestPermission, updateSettings } = useNotifications();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  return (
    <DashboardLayout title="Cài đặt thông báo" subtitle="Quản lý thông báo học tập">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Browser Permission */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Quyền thông báo trình duyệt</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">
                Trạng thái:{" "}
                <span className={`font-semibold ${
                  permission === "granted" ? "text-emerald-400" :
                  permission === "denied" ? "text-rose-400" :
                  "text-app-text-muted"
                }`}>
                  {permission === "granted" ? "Đã cho phép" :
                   permission === "denied" ? "Đã từ chối" :
                   "Chưa thiết lập"}
                </span>
              </p>
              <p className="text-xs text-app-text-muted mt-1">
                Cho phép trình duyệt hiển thị thông báo
              </p>
            </div>
            {permission !== "granted" && (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
              >
                {permission === "denied" ? "Mở cài đặt" : "Cho phép"}
              </button>
            )}
          </div>
        </div>

        {/* Master Toggle */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <ToggleItem
            label="Bật thông báo"
            description="Bật/tắt tất cả thông báo"
            value={settings.enabled}
            onChange={(v) => updateSettings({ enabled: v })}
          />
        </div>

        {/* Daily Reminder */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Nhắc nhở học tập</h3>
          <div className="space-y-4">
            <ToggleItem
              label="Nhắc nhở hàng ngày"
              description="Nhắc nhở học mỗi ngày để giữ streak"
              value={settings.dailyReminder}
              onChange={(v) => updateSettings({ dailyReminder: v })}
            />
            {settings.dailyReminder && (
              <div>
                <label className="text-app-text-muted text-xs mb-2 block">Giờ nhắc nhở</label>
                <input
                  type="time"
                  value={settings.dailyReminderTime}
                  onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Review Reminder */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Nhắc nhở ôn tập</h3>
          <div className="space-y-4">
            <ToggleItem
              label="Nhắc nhở ôn tập từ vựng"
              description="Nhắc khi có từ vựng cần review (SRS)"
              value={settings.reviewReminder}
              onChange={(v) => updateSettings({ reviewReminder: v })}
            />
            {settings.reviewReminder && (
              <div>
                <label className="text-app-text-muted text-xs mb-2 block">Khoảng cách (giờ)</label>
                <select
                  value={settings.reviewReminderInterval}
                  onChange={(e) => updateSettings({ reviewReminderInterval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-app-surface/50 border border-app-border text-white text-sm outline-none focus:border-app-accent-primary/50"
                >
                  <option value={6}>6 giờ</option>
                  <option value={12}>12 giờ</option>
                  <option value={24}>24 giờ</option>
                  <option value={48}>48 giờ</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Thông báo trình duyệt cần được cho phép để nhận thông báo</li>
            <li>• Nhắc nhở hàng ngày giúp bạn giữ streak học tập</li>
            <li>• Nhắc nhở ôn tập dựa trên thuật toán Spaced Repetition</li>
            <li>• Bạn có thể tắt thông báo bất cứ lúc nào</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationSettingsPage;
