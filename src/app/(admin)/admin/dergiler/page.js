"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function AdminDergiAddPage() {
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
      isim: form.get("isim")?.toString().trim() || null,
      alt_baslik: form.get("alt_baslik")?.toString().trim() || null,
      slogan: form.get("slogan")?.toString().trim() || null,
      aciklama: form.get("aciklama")?.toString().trim() || null,
      imtiyaz: form.get("imtiyaz")?.toString().trim() || null,
      yazi_mudur: form.get("yazi_mudur")?.toString().trim() || null,
      cikis: form.get("cikis")?.toString().trim() || null,
      bitis: form.get("bitis")?.toString().trim() || null,
      basim_yeri: form.get("basim_yeri")?.toString().trim() || null,
      toplam_sayi: form.get("toplam_sayi")?.toString().trim() || null,
      eksikler: form.get("eksikler")?.toString().trim() || null,
      telif: form.get("telif")?.toString().trim() || null,
    };

    if (!data.isim) {
      setError("Dergi ismi zorunludur.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/dergis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Dergi eklenirken hata oluştu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/dergiler");
      }, 1500);
    } catch (err) {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen  text-white">
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
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Yeni Dergi Ekle</h1>
              <p className="text-white/60 text-lg mt-1">
                Dergi bilgilerini doldurun
              </p>
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
            Dergi başarıyla eklendi! Yönlendiriliyorsunuz...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Temel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="isim" className="block text-sm font-medium text-white/70 mb-2">
                  Dergi İsmi <span className="text-red-400">*</span>
                </label>
                <input
                  id="isim"
                  name="isim"
                  type="text"
                  required
                  placeholder="Örn: Türk Yurdu"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="alt_baslik" className="block text-sm font-medium text-white/70 mb-2">
                  Alt Başlık
                </label>
                <input
                  id="alt_baslik"
                  name="alt_baslik"
                  type="text"
                  placeholder="Örn: Aylık Fikir ve Kültür Dergisi"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="slogan" className="block text-sm font-medium text-white/70 mb-2">
                  Slogan
                </label>
                <input
                  id="slogan"
                  name="slogan"
                  type="text"
                  placeholder="Dergi sloganı"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="aciklama" className="block text-sm font-medium text-white/70 mb-2">
                  Açıklama
                </label>
                <textarea
                  id="aciklama"
                  name="aciklama"
                  rows="4"
                  placeholder="Dergi hakkında detaylı açıklama..."
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Yönetim Bilgileri */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Yönetim Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="imtiyaz" className="block text-sm font-medium text-white/70 mb-2">
                  İmtiyaz Sahibi
                </label>
                <input
                  id="imtiyaz"
                  name="imtiyaz"
                  type="text"
                  placeholder="İmtiyaz sahibi adı"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="yazi_mudur" className="block text-sm font-medium text-white/70 mb-2">
                  Yazı İşleri Müdürü
                </label>
                <input
                  id="yazi_mudur"
                  name="yazi_mudur"
                  type="text"
                  placeholder="Yazı işleri müdürü adı"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>
            </div>
          </div>

          {/* Yayın Bilgileri */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Yayın Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cikis" className="block text-sm font-medium text-white/70 mb-2">
                  Çıkış Tarihi
                </label>
                <input
                  id="cikis"
                  name="cikis"
                  type="text"
                  placeholder="Örn: 1923"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="bitis" className="block text-sm font-medium text-white/70 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  id="bitis"
                  name="bitis"
                  type="text"
                  placeholder="Örn: 1950"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="basim_yeri" className="block text-sm font-medium text-white/70 mb-2">
                  Basım Yeri
                </label>
                <input
                  id="basim_yeri"
                  name="basim_yeri"
                  type="text"
                  placeholder="Örn: İstanbul"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="toplam_sayi" className="block text-sm font-medium text-white/70 mb-2">
                  Toplam Sayı
                </label>
                <input
                  id="toplam_sayi"
                  name="toplam_sayi"
                  type="text"
                  placeholder="Örn: 120"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="eksikler" className="block text-sm font-medium text-white/70 mb-2">
                  Eksik Sayılar
                </label>
                <input
                  id="eksikler"
                  name="eksikler"
                  type="text"
                  placeholder="Örn: 5, 12, 23-25"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>
            </div>
          </div>

          {/* Telif Bilgisi */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Diğer Bilgiler</h2>
            
            <div>
              <label htmlFor="telif" className="block text-sm font-medium text-white/70 mb-2">
                Telif Bilgisi
              </label>
              <textarea
                id="telif"
                name="telif"
                rows="3"
                placeholder="Telif hakları ve kullanım koşulları..."
                className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] resize-none"
              />
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                  </svg>
                  Ekleniyor...
                </span>
              ) : (
                "Dergi Ekle"
              )}
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