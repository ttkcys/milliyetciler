"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft } from "lucide-react";

export default function AdminKatkidaAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const data = {
      name: form.get("name")?.toString().trim() || null,
      type: form.get("type")?.toString().trim() || null,
    };

    if (!data.name) {
      setError("İsim zorunludur.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/katkidas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Eklenirken hata oluştu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/katkida-bulunanlar"), 1200);
    } catch (err) {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-4xl font-bold">Yeni Katkıda Bulunan</h1>
              <p className="text-white/60 text-lg mt-1">Bilgileri doldurun</p>
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
            Başarıyla eklendi! Yönlendiriliyorsunuz...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Bilgiler</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  İsim <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Örn: Mehmet Yılmaz"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Type
                </label>
                <input
                  name="type"
                  type="text"
                  placeholder="Örn: Editör / Katkıcı / Destekçi"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-[#333] bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/5"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
