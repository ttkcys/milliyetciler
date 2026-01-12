"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, ArrowLeft } from "lucide-react";

export default function AdminKatkidaEditPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const id = sp.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({ name: "", type: "" });

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

  useEffect(() => {
    if (id) fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchItem() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/katkidas/${id}`, { credentials: "include" });
      if (!res.ok) {
        setError("Kayıt bulunamadı");
        return;
      }
      const data = await res.json();
      setFormData({
        name: data.name || "",
        type: data.type || "",
      });
    } catch (e) {
      setError("Veri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    setSaving(true);

    const payload = {
      name: formData.name.trim() || null,
      type: formData.type.trim() || null,
    };

    if (!payload.name) {
      setError("İsim zorunludur.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/katkidas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Güncellenirken hata oluştu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/katkida-bulunanlar"), 1200);
    } catch (e) {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-[#333] border-t-[#ffc451]" />
          <p className="text-white/60">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-white/60 hover:text-[#ffc451] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <Users className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Düzenle</h1>
              <p className="text-white/60 text-lg mt-1">{formData.name || "Kaydı güncelleyin"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            Başarıyla güncellendi! Yönlendiriliyorsunuz...
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Bilgiler</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  İsim <span className="text-red-400">*</span>
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="İsim"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
                <input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Type"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
            </button>

            <button
              onClick={() => router.back()}
              className="rounded-full border border-[#333] bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/5"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
