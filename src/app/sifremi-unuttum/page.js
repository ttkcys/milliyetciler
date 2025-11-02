"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setOk(false);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");

    if (!email) {
      setErr("Lütfen e-posta adresinizi girin.");
      return;
    }

    setLoading(true);

    // 👉 Buraya gerçek “şifre sıfırlama bağlantısı gönder” isteğini bağlayacaksın.
    // Örn: await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) })
    await new Promise((r) => setTimeout(r, 900)); // demo bekleme

    setLoading(false);
    setOk(true);
    e.currentTarget.reset();
  }

  return (
    <div className="min-h-screen bg-black opacity-85 text-white">
      <div className="relative overflow-hidden bg-black border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <a
              href="/"
              className="text-white/60 hover:text-[#ffc451] transition-colors"
            >
              Anasayfa
            </a>
            <span className="text-white/40">›</span>
            <span className="text-[#ffc451] font-medium">Şifre Yenileme</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Şifre Yenileme</h1>
              <p className="text-white/60 text-lg mt-1">
                Yeni şifreniz e-posta adresinize gönderilecektir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-md px-6 py-10 md:py-14">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,196,81,0.05)]"
        >
          {err && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {err}
            </div>
          )}
          {ok && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısı
              e-posta adresinize gönderildi.
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-white/70"
              >
                E-posta adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@eposta.com"
                required
                className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"
                    />
                  </svg>
                  Gönderiliyor…
                </>
              ) : (
                "Gönder"
              )}
            </button>

            <p className="text-sm text-white/60">
              <Link
                href="/giris-yap"
                className="font-semibold text-[#ffc451] hover:underline"
              >
                Giriş yap
              </Link>{" "}
              veya{" "}
              <Link
                href="/kayit-ol"
                className="font-semibold text-[#ffc451] hover:underline"
              >
                yeni hesap oluştur
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
