"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

const NAV = [
  { label: "Dergiler", href: "/sayfalar/dergiler" },
  { label: "Yazarlar", href: "/sayfalar/yazarlar" },
  { label: "Fihrist", href: "/sayfalar/fihrist" },
  { label: "Bağış", href: "/sayfalar/bagis" },
  { label: "İletişim", href: "/sayfalar/iletisim" },
];

const ABOUT_SUB = [
  { label: "Milliyetçi Dergiler Projesi", href: "/sayfalar/hakkinda/hakkimizda" },
  { label: "Katkıda Bulunanlar", href: "/sayfalar/hakkinda/katkida-bulunanlar" },
  { label: "Kadro", href: "/sayfalar/hakkinda/kadro" },
];

export default function Header() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  // Scroll gizle/göster
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastScrollY) setVisible(true);
      else if (y > lastScrollY && y > 50) setVisible(false);
      setLastScrollY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  // /api/me kontrolünü fonksiyon yap
  const checkMe = useCallback(async () => {
    try {
      setChecking(true);
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include", // cookie'yi garanti gönder
      });
      if (res.ok) {
        const data = await res.json();
        setMe(data || null);
      } else {
        setMe(null);
      }
    } catch {
      setMe(null);
    } finally {
      setChecking(false);
    }
  }, []);

  // İlk açılışta ve route değişince kontrol et
  useEffect(() => {
    checkMe();
  }, [checkMe, pathname]);

  // Pencere odağa gelince (örn. login yönlendirmesi sonrası) tekrar kontrol et
  useEffect(() => {
    const onFocus = () => checkMe();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkMe]);

  async function onLogout() {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch { }
    // Tam temiz sayfa
    window.location.reload();
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-black text-white shadow-2xl backdrop-blur-sm border-b border-[#444] transition-transform duration-500 ease-in-out ${visible ? "translate-y-0" : "-translate-y-full"}`}
      style={{ opacity: 0.85 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#ffc451] rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <img
              src="/logo/logo.png"
              alt="Milliyetçi Dergiler logosu"
              width="42"
              height="42"
              className="relative z-10 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-wide text-white leading-tight">
              Milliyetçi Dergiler
            </span>
            <span className="text-[10px] text-[#ffc451] font-medium tracking-widest uppercase">
              Milliyetçiliğin Dijital Hafızası
            </span>
          </div>
        </a>

        {/* Masaüstü menü */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 text-[13px] font-medium text-white/90 transition-all duration-300 hover:text-white group"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-0 bg-[#ffc451]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#ffc451] group-hover:w-3/4 group-hover:left-[12.5%] transition-all duration-300"></span>
            </a>
          ))}

          {/* Hakkında */}
          <div className="relative group">
            <button
              className="relative px-4 py-2 text-[13px] font-medium text-white/90 transition-all duration-300 hover:text-white flex items-center gap-1"
              type="button"
            >
              <span className="relative z-10">Hakkında</span>
              <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="absolute inset-0 bg-[#ffc451]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>

            <div className="invisible absolute right-0 mt-3 w-80 translate-y-2 rounded-xl border border-[#444] bg-[#2a2a2a] shadow-2xl opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent"></div>
              <ul className="relative p-2">
                {ABOUT_SUB.map((sub) => (
                  <li key={sub.href}>
                    <a
                      href={sub.href}
                      className="block rounded-lg px-4 py-3 text-[13px] text-white/90 hover:text-white hover:bg-[#ffc451]/10 transition-all duration-200 border-l-2 border-transparent hover:border-[#ffc451]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ffc451]"></div>
                        <span>{sub.label}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Oturum butonu / menüsü */}
          {checking ? (
            <div className="ml-3 h-8 w-24 rounded-full bg-white/5 animate-pulse" />
          ) : me ? (
            <div className="relative group ml-2">
              <button
                className="cursor-pointer relative overflow-hidden rounded-full bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-white/10 flex items-center gap-2"
              >
                <User className="w-4 h-4 opacity-90" aria-hidden="true" />
                <span>Hesabım</span>
              </button>

              <div className="invisible absolute right-0 mt-2 w-56 translate-y-2 rounded-xl border border-[#444] bg-[#2a2a2a] shadow-2xl opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 overflow-hidden">
                <ul className="relative p-2">
                  <li>
                    <a
                      href="/profilim"
                      className="block rounded-lg px-4 py-3 text-[13px] text-white/90 hover:text-white hover:bg-[#ffc451]/10 transition-all duration-200"
                    >
                      Profilim
                    </a>
                  </li>
                  <li>
                    <a
                      href="/listelerim"
                      className="block rounded-lg px-4 py-3 text-[13px] text-white/90 hover:text-white hover:bg-[#ffc451]/10 transition-all duration-200"
                    >
                      Listelerim
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={onLogout}
                      className="w-full text-left rounded-lg px-4 py-3 text-[13px] text-white/90 hover:text-white hover:bg-[#ffc451]/10 transition-all duration-200"
                    >
                      Çıkış Yap
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <a
              href="/giris-yap"
              className="ml-2 relative overflow-hidden rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-2.5 text-[13px] font-semibold text-[#333333] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc451]/30 hover:scale-105 group"
            >
              <span className="relative z-10">Giriş Yap</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#ffb020] to-[#ffc451] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>
          )}
        </nav>

        {/* Mobil menü butonu */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#555] hover:bg-[#444] transition-all duration-300"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menüyü aç/kapat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobil menü */}
      {open && (
        <div className="md:hidden border-t border-[#444] bg-gradient-to-b from-[#333333] to-[#2a2a2a] backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-3 text-[14px] text-white/90 hover:text-white hover:bg-[#ffc451]/10 transition-all duration-200 border-l-2 border-transparent hover:border-[#ffc451]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              <button
                className="flex items-center justify-between rounded-lg px-4 py-3 text-left text-[14px] text-white/90 hover:text-white hover:bg-[#ffc451]/10 transition-all duration-200"
                onClick={() => setAboutOpen((s) => !s)}
                aria-expanded={aboutOpen}
              >
                <span>Hakkında</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${aboutOpen ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {aboutOpen && (
                <div className="ml-4 flex flex-col gap-1 pb-2">
                  {ABOUT_SUB.map((sub) => (
                    <a
                      key={sub.href}
                      href={sub.href}
                      className="rounded-lg px-4 py-2.5 text-[13px] text-white/80 hover:text-white hover:bg-[#555] transition-all duration-200 flex items-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <div className="w-1 h-1 rounded-full bg-[#ffc451]"></div>
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}

              {me ? (
                <>
                  <a
                    href="/hesabim"
                    className="mt-3 rounded-full bg-white/10 px-6 py-3 text-center text-[14px] font-semibold text-white hover:bg-white/20 transition-all duration-300"
                    onClick={() => setOpen(false)}
                  >
                    Hesabım
                  </a>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    className="mt-2 rounded-full bg-white/5 px-6 py-3 text-center text-[14px] font-semibold text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <a
                  href="/giris-yap"
                  className="mt-3 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-center text-[14px] font-semibold text-[#333333] hover:shadow-lg hover:shadow-[#ffc451]/30 transition-all duration-300"
                  onClick={() => setOpen(false)}
                >
                  Giriş Yap
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
