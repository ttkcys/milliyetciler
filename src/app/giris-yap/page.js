"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      setErr("Lütfen e-posta ve şifreyi doldurun.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        let msg =
          res.status === 401
            ? "E-posta veya şifre hatalı."
            : "Giriş yapılamadı. Lütfen tekrar deneyin.";
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        setErr(msg);
        return;
      }

      // Başarılı giriş -> her zaman dergiler sayfasına
      router.replace("/sayfalar/dergiler");
      router.refresh();
      return;
    } catch {
      setErr("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
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
            <span className="text-[#ffc451] font-medium">Giriş Yap</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Giriş Yap</h1>
              <p className="text-white/60 text-lg mt-1">
                Hesabınıza erişin ve devam edin.
              </p>
            </div>
          </div>
        </div>
      </div>

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
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-white/70"
              >
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-[#ffc451]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-white/60 hover:text-[#ffc451] transition-colors"
                  aria-label="Şifreyi göster/gizle"
                >
                  {show ? "Gizle" : "Göster"}
                </button>
              </div>
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
                  Giriş yapılıyor…
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>

            <div className="space-y-2 text-sm">
              <p className="text-white/60">
                Hesabınız yok mu?{" "}
                <Link
                  href="/kayit-ol"
                  className="font-semibold text-[#ffc451] hover:underline"
                >
                  Kayıt Olun.
                </Link>
              </p>
              <p>
                <Link
                  href="/sifremi-unuttum"
                  className="text-[#ffc451] hover:underline"
                >
                  Şifremi unuttum.
                </Link>
              </p>
            </div>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          Giriş yaparken sorun yaşıyorsanız{" "}
          <Link
            href="/sayfalar/iletisim"
            className="text-[#ffc451] hover:underline"
          >
            bizimle iletişime geçin
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
