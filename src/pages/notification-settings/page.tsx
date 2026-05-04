import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileNav from "../../components/feature/MobileNav";

interface ToggleItemProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleItem = ({ label, description, value, onChange }: ToggleItemProps) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
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
          value ? "bg-[#4F46E5]" : "bg-gray-200"
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

  const [settings, setSettings] = useState({
    dailyReminder: true,
    streakAlert: true,
    xpUpdate: false,
    newContent: true,
    communityActivity: false,
    weeklyReport: true,
    promotions: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: "Study Reminders",
      items: [
        { key: "dailyReminder" as const, label: "Daily Reminder", description: "Get a daily nudge to keep your streak alive" },
        { key: "streakAlert" as const, label: "Streak Alert", description: "Be warned before your streak expires" },
      ],
    },
    {
      title: "Progress Updates",
      items: [
        { key: "xpUpdate" as const, label: "XP Updates", description: "Notify when you earn new XP milestones" },
        { key: "weeklyReport" as const, label: "Weekly Report", description: "Receive your weekly study summary" },
      ],
    },
    {
      title: "Content & Community",
      items: [
        { key: "newContent" as const, label: "New Content", description: "Be the first to know about new lessons" },
        { key: "communityActivity" as const, label: "Community Activity", description: "Replies and likes on your posts" },
        { key: "promotions" as const, label: "Promotions", description: "Special offers and discounts" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <i className="ri-arrow-left-line text-gray-600 text-lg" />
        </button>
        <h1 className="text-base font-bold text-gray-800">Notification Settings</h1>
      </div>

      <div className="pt-16 px-4 mt-4 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl shadow-sm px-4">
            <p className="text-xs font-semibold text-gray-400 tracking-wide pt-4 pb-2">
              {section.title}
            </p>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => (
                <ToggleItem
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  value={settings[item.key]}
                  onChange={() => toggle(item.key)}
                />
              ))}
            </div>
            <div className="pb-2" />
          </div>
        ))}

        {/* Save Button */}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 rounded-2xl bg-[#4F46E5] text-white font-semibold text-sm mt-2"
        >
          Save Settings
        </button>
      </div>

      <MobileNav />
    </div>
  );
};

export default NotificationSettingsPage;
