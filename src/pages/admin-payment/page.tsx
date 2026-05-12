import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface PaymentSettings {
  bankAccount: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    branch: string;
    qrCodeUrl: string;
  };
  momo: {
    phoneNumber: string;
    displayName: string;
    enabled: boolean;
  };
  zaloPay: {
    phoneNumber: string;
    displayName: string;
    enabled: boolean;
  };
  autoRenewal: {
    enabled: boolean;
    reminderDays: number;
  };
  paymentSuccessMessage: string;
  paymentFailedMessage: string;
}

const DEFAULT_PAYMENT: PaymentSettings = {
  bankAccount: {
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    branch: "",
    qrCodeUrl: "",
  },
  momo: {
    phoneNumber: "",
    displayName: "",
    enabled: false,
  },
  zaloPay: {
    phoneNumber: "",
    displayName: "",
    enabled: false,
  },
  autoRenewal: {
    enabled: true,
    reminderDays: 7,
  },
  paymentSuccessMessage: "Cảm ơn bạn đã thanh toán VIP! Tài khoản của bạn đã được kích hoạt.",
  paymentFailedMessage: "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
};

export default function AdminPaymentPage() {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("key", "payment_settings")
        .single();
      
      if (error) throw error;
      if (data?.value) {
        setSettings(JSON.parse(data.value));
      }
    } catch (err) {
      console.error("Error loading payment settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key: "payment_settings",
          value: JSON.stringify(settings),
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" });
      
      if (error) throw error;
      showToast("Đã lưu cài đặt thanh toán!");
    } catch (err) {
      console.error("Error saving payment settings:", err);
      showToast("Lỗi lưu cài đặt thanh toán");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof PaymentSettings, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...(prev[section] as Record<string, unknown>), [field]: value }
        : value
    }));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Cài đặt thanh toán VIP</h1>
          <p className="text-app-text-secondary text-sm">Cấu hình cổng thanh toán và thông tin ngân hàng</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-app-text-secondary">
            <i className="ri-loader-4-line animate-spin text-2xl mb-2"></i>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bank Account */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-bank-line text-app-accent-primary text-lg"></i>
                <h3 className="text-white font-semibold">Tài khoản ngân hàng</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên ngân hàng</label>
                  <input type="text" value={settings.bankAccount.bankName}
                    onChange={(e) => handleChange("bankAccount", "bankName", e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="Vietcombank" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">
                    Mã ngân hàng <span className="text-white/30">(dùng cho VietQR)</span>
                  </label>
                  <input type="text" value={settings.bankAccount.bankCode}
                    onChange={(e) => handleChange("bankAccount", "bankCode", e.target.value.toUpperCase())}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary font-mono"
                    placeholder="VD: VCB • MB • TCB • BIDV • VTB" />
                  <p className="text-[10px] text-app-text-muted mt-1">
                    <a href="https://api.vietqr.io/v2/banks" target="_blank" rel="noreferrer" className="underline hover:text-white/60">Xem danh sách mã ngân hàng</a>
                  </p>
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Số tài khoản</label>
                  <input type="text" value={settings.bankAccount.accountNumber}
                    onChange={(e) => handleChange("bankAccount", "accountNumber", e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary font-mono"
                    placeholder="1234567890" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Chủ tài khoản</label>
                  <input type="text" value={settings.bankAccount.accountName}
                    onChange={(e) => handleChange("bankAccount", "accountName", e.target.value.toUpperCase())}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="NGUYEN VAN A" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Chi nhánh</label>
                  <input type="text" value={settings.bankAccount.branch}
                    onChange={(e) => handleChange("bankAccount", "branch", e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="Hà Nội" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">URL mã QR tùy chỉnh (nếu có)</label>
                  <input type="text" value={settings.bankAccount.qrCodeUrl}
                    onChange={(e) => handleChange("bankAccount", "qrCodeUrl", e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary"
                    placeholder="https://... (trống = tự tạo VietQR)" />
                </div>
              </div>

              {/* VietQR Preview */}
              {settings.bankAccount.bankCode && settings.bankAccount.accountNumber && (
                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-5">
                  <img
                    src={`https://img.vietqr.io/image/${settings.bankAccount.bankCode}-${settings.bankAccount.accountNumber}-compact2.jpg?accountName=${encodeURIComponent(settings.bankAccount.accountName || "")}`}
                    alt="VietQR Preview"
                    className="w-28 h-28 rounded-lg bg-white"
                  />
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-white/90">{settings.bankAccount.bankName || settings.bankAccount.bankCode}</p>
                    <p className="font-mono text-white/70">{settings.bankAccount.accountNumber}</p>
                    <p className="text-white/50">{settings.bankAccount.accountName}</p>
                    <p className="text-[10px] text-app-text-muted mt-1">QR tự động tạo qua VietQR API</p>
                  </div>
                </div>
              )}
            </div>

            {/* MoMo */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-money-dollar-circle-line text-pink-500 text-lg"></i>
                  <h3 className="text-white font-semibold">MoMo</h3>
                </div>
                <button
                  onClick={() => handleChange("momo", "enabled", !settings.momo.enabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${settings.momo.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}
                >
                  {settings.momo.enabled ? "Bật" : "Tắt"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    value={settings.momo.phoneNumber}
                    onChange={(e) => handleChange("momo", "phoneNumber", e.target.value)}
                    disabled={!settings.momo.enabled}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary disabled:opacity-50"
                    placeholder="09xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên hiển thị</label>
                  <input
                    type="text"
                    value={settings.momo.displayName}
                    onChange={(e) => handleChange("momo", "displayName", e.target.value)}
                    disabled={!settings.momo.enabled}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary disabled:opacity-50"
                    placeholder="HÀN VIỆT KTS"
                  />
                </div>
              </div>
            </div>

            {/* ZaloPay */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-money-dollar-circle-line text-blue-500 text-lg"></i>
                  <h3 className="text-white font-semibold">ZaloPay</h3>
                </div>
                <button
                  onClick={() => handleChange("zaloPay", "enabled", !settings.zaloPay.enabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${settings.zaloPay.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}
                >
                  {settings.zaloPay.enabled ? "Bật" : "Tắt"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    value={settings.zaloPay.phoneNumber}
                    onChange={(e) => handleChange("zaloPay", "phoneNumber", e.target.value)}
                    disabled={!settings.zaloPay.enabled}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary disabled:opacity-50"
                    placeholder="09xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Tên hiển thị</label>
                  <input
                    type="text"
                    value={settings.zaloPay.displayName}
                    onChange={(e) => handleChange("zaloPay", "displayName", e.target.value)}
                    disabled={!settings.zaloPay.enabled}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary disabled:opacity-50"
                    placeholder="HÀN VIỆT KTS"
                  />
                </div>
              </div>
            </div>

            {/* Auto Renewal */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-refresh-line text-app-accent-primary text-lg"></i>
                <h3 className="text-white font-semibold">Tự động gia hạn</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleChange("autoRenewal", "enabled", !settings.autoRenewal.enabled)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${settings.autoRenewal.enabled ? "bg-emerald-500 text-white" : "bg-gray-600 text-gray-300"}`}
                >
                  {settings.autoRenewal.enabled ? "Đã bật" : "Đã tắt"}
                </button>
              </div>
              <div>
                <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Nhắc trước (ngày)</label>
                <input
                  type="number"
                  value={settings.autoRenewal.reminderDays}
                  onChange={(e) => handleChange("autoRenewal", "reminderDays", parseInt(e.target.value) || 7)}
                  disabled={!settings.autoRenewal.enabled}
                  className="w-24 bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary disabled:opacity-50"
                  min="1"
                  max="30"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-message-3-line text-app-accent-primary text-lg"></i>
                <h3 className="text-white font-semibold">Thông báo thanh toán</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Thông báo thành công</label>
                  <textarea
                    value={settings.paymentSuccessMessage}
                    onChange={(e) => handleChange("paymentSuccessMessage", "", e.target.value)}
                    rows={2}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs font-medium block mb-1.5">Thông báo thất bại</label>
                  <textarea
                    value={settings.paymentFailedMessage}
                    onChange={(e) => handleChange("paymentFailedMessage", "", e.target.value)}
                    rows={2}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {saving ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
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
