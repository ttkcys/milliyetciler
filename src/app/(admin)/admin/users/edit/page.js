"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, ArrowLeft } from "lucide-react";

export default function AdminUserEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

  useEffect(() => {
    if (!userId) {
      setError("Kullanıcı ID bulunamadı");
      setFetching(false);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    }

    fetchUser();
  }, [userId, API_BASE]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    
    const data = {
      name: form.get("name")?.toString().trim() || null,
      email: form.get("email")?.toString().trim() || null,
      password: form.get("password")?.toString().trim() || null,
      level: form.get("level") ? parseInt(form.get("level")) : null,
      isCan: form.get("isCan") ? parseInt(form.get("isCan")) : 0,
      tel: form.get("tel")?.toString().trim() || null,
      adres: form.get("adres")?.toString().trim() || null,
      meslek: form.get("meslek")?.toString().trim() || null,
      kurum: form.get("kurum")?.toString().trim() || null,
      kullanim: form.get("kullanim")?.toString().trim() || null,
      biyografi: form.get("biyografi")?.toString().trim() || null,
    };

    // Şifre boşsa gönderme
    if (!data.password) {
      delete data.password;
    }

    if (!data.name || !data.email) {
      setError("İsim ve e-posta zorunludur.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Kullanıcı güncellenirken hata oluştu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (err) {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc451] border-t-transparent" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/admin/users")}
            className="text-[#ffc451] hover:underline"
          >
            Kullanıcılara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white">
      {/* Header */}
      <div className="relative overflow-hidden  border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <button
            onClick={() => router.push("/admin/users")}
            className="mb-6 flex items-center gap-2 text-white/60 hover:text-[#ffc451] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kullanıcılara Dön</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <User className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Kullanıcı Düzenle</h1>
              <p className="text-white/60 text-lg mt-1">
                {user?.name} - #{userId}
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
            Kullanıcı başarıyla güncellendi! Yönlendiriliyorsunuz...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Temel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                  İsim <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={user?.name}
                  placeholder="Kullanıcı adı"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                  E-posta <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={user?.email}
                  placeholder="ornek@eposta.com"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  Şifre <span className="text-white/40 text-xs">(Değiştirmek istemiyorsanız boş bırakın)</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>
            </div>
          </div>

          {/* Yetki Bilgileri */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Yetki Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-white/70 mb-2">
                  Seviye
                </label>
                <select
                  id="level"
                  name="level"
                  defaultValue={user?.level || ""}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                >
                  <option value="">Seçiniz</option>
                  <option value="1">1 - Admin</option>
                  <option value="2">2 - Moderatör</option>
                  <option value="3">3 - Kullanıcı</option>
                </select>
              </div>

              <div>
                <label htmlFor="isCan" className="block text-sm font-medium text-white/70 mb-2">
                  Durum
                </label>
                <select
                  id="isCan"
                  name="isCan"
                  defaultValue={user?.isCan || 0}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                >
                  <option value="0">Pasif</option>
                  <option value="1">Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">İletişim Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tel" className="block text-sm font-medium text-white/70 mb-2">
                  Telefon
                </label>
                <input
                  id="tel"
                  name="tel"
                  type="text"
                  defaultValue={user?.tel}
                  placeholder="05XX XXX XX XX"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="meslek" className="block text-sm font-medium text-white/70 mb-2">
                  Meslek
                </label>
                <input
                  id="meslek"
                  name="meslek"
                  type="text"
                  defaultValue={user?.meslek}
                  placeholder="Meslek"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="kurum" className="block text-sm font-medium text-white/70 mb-2">
                  Kurum
                </label>
                <input
                  id="kurum"
                  name="kurum"
                  type="text"
                  defaultValue={user?.kurum}
                  placeholder="Kurum"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="adres" className="block text-sm font-medium text-white/70 mb-2">
                  Adres
                </label>
                <textarea
                  id="adres"
                  name="adres"
                  rows="2"
                  defaultValue={user?.adres}
                  placeholder="Adres bilgisi"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Diğer Bilgiler */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Diğer Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="kullanim" className="block text-sm font-medium text-white/70 mb-2">
                  Kullanım Amacı
                </label>
                <input
                  id="kullanim"
                  name="kullanim"
                  type="text"
                  defaultValue={user?.kullanim}
                  placeholder="Kullanım amacı"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label htmlFor="biyografi" className="block text-sm font-medium text-white/70 mb-2">
                  Biyografi
                </label>
                <textarea
                  id="biyografi"
                  name="biyografi"
                  rows="4"
                  defaultValue={user?.biyografi}
                  placeholder="Kullanıcı hakkında..."
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] resize-none"
                />
              </div>
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
                  Güncelleniyor...
                </span>
              ) : (
                "Değişiklikleri Kaydet"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/users")}
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