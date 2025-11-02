"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Layers, FileText, Users } from "lucide-react";

const STATS = [
  { icon: BookOpen, label: "Dergiler", count: "0", href: "/sayfalar/dergiler" },
  { icon: Layers,   label: "Sayılar",  count: "0" },
  { icon: FileText, label: "Yazılar",  count: "0", href: "/sayfalar/yazarlar" },
  { icon: Users,    label: "Yazarlar", count: "0" },
];

const MENU_ITEMS = [
  { label: "Dergiler", href: "/sayfalar/dergiler" },
  { label: "Yazarlar", href: "/sayfalar/yazarlar" },
  { label: "Fihrist", href: "/sayfalar/fihrist" },
  { label: "Bağış", href: "/sayfalar/bagis" },
  { label: "Arama", href: "/sayfalar/arama" },
  { label: "Hakkında", href: "/sayfalar/hakkinda/hakkimizda" },
  { label: "Kadro", href: "/sayfalar/kadro" },
  { label: "Katkıda Bulunanlar", href: "/sayfalar/hakkinda/katkida-bulunanlar" },
  { label: "İletişim", href: "/sayfalar/iletisim" },
  { label: "Kullanım Koşulları", href: "/sayfalar/kullanim-kosullari" },
  { label: "Gizlilik Politikası", href: "/sayfalar/gizlilik-politikasi" },
];

export default function Footer() {
  /* --------------------- Sayaç için hazırlık --------------------- */
  const statsRef = useRef(null);

  // Fallback: STATS içindeki mevcut sayıları sayıya çeviriyoruz
  const fallbackTargetsRef = useRef(
    STATS.map((s) => parseInt(String(s.count).replace(/\D/g, ""), 10) || 0)
  );

  // Ekranda göründü mü?
  const [visible, setVisible] = useState(false);
  // API/ya da fallback ile kullanılacak hedef değerler
  const [targets, setTargets] = useState(fallbackTargetsRef.current);
  // Animasyon state
  const [animated, setAnimated] = useState(() => targets.map(() => 0));
  const [started, setStarted] = useState(false);

  // Görünürlük gözlemcisi
  useEffect(() => {
    if (!statsRef.current) return;
    const el = statsRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // API'den toplamları çek (sıra STATS ile aynı: Dergiler, Sayılar, Yazılar, Yazarlar)
  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const endpoints = [
          "/api/dergis?limit=1",
          "/api/sayis?limit=1",
          "/api/yazis?limit=1",
          "/api/yazars?limit=1",
        ];

        const resps = await Promise.allSettled(
          endpoints.map((url) =>
            fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
          )
        );

        const totals = resps.map((r, i) => {
          if (r.status === "fulfilled" && r.value) {
            const v = r.value.total;
            return typeof v === "number" && v >= 0 ? v : fallbackTargetsRef.current[i];
          }
          return fallbackTargetsRef.current[i];
        });

        if (!cancelled) {
          setTargets(totals);
          // Eğer daha önce animasyon başladıysa ama yanlış/fallback değerle başladıysa
          // animasyonu tekrar doğru hedeflere göre başlatabilmek için resetliyoruz.
          setAnimated(totals.map(() => 0));
          setStarted(false);
        }
      } catch {
        // Sessizce fallback'lerle devam
      }
    }

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Göründüğünde ve hedefler hazırken animasyonu çalıştır
  useEffect(() => {
    if (!visible || started) return;

    const duration = 1200; // ms
    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    let rafId = 0;

    const tick = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = easeOutCubic(p);
      setAnimated(targets.map((t) => Math.min(t, Math.floor(t * eased))));
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setAnimated(targets);
        setStarted(true);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [visible, targets, started]);

  /* --------------------- /Sayaç için hazırlık --------------------- */

  return (
    <footer className="bg-black text-white opacity-85">
      {/* İstatistikler Bölümü */}
      <div className="border-b border-[#333]" ref={statsRef}>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              const value = (animated[idx] ?? 0).toLocaleString("tr-TR");

              const content = (
                <div className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6 transition-all duration-300 hover:border-[#ffc451] hover:shadow-lg hover:shadow-[#ffc451]/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-3 rounded-xl ring-1 ring-[#333] bg-[#1b1b1b] p-3 transition-transform duration-300 group-hover:scale-110">
                      <Icon aria-hidden="true" className="h-8 w-8 text-[#ffc451]" strokeWidth={2} />
                    </div>
                    <h3 className="mb-2 text-sm font-medium text-white/70 transition-colors duration-300 group-hover:text-[#ffc451]">
                      {stat.label}
                    </h3>
                    <p className="text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-110">
                      {value}
                    </p>
                  </div>
                </div>
              );

              return stat.href ? (
                <Link key={stat.label} href={stat.href}>
                  {content}
                </Link>
              ) : (
                <div key={stat.label}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ana Footer İçeriği */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Logo ve İletişim */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffc451] rounded-lg blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <Image
                  src="/logo/logo.png"
                  alt="Milliyetçi Dergiler logosu"
                  width={60}
                  height={60}
                  className="relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">Milliyetçi Dergiler</span>
                <span className="text-xs text-[#ffc451] font-medium tracking-wider uppercase">
                  Milliyetçiliğin Dijital Hafızası
                </span>
              </div>
            </Link>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-white/70">
                <svg
                  className="w-5 h-5 mt-0.5 text-[#ffc451] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p>Kızılay, Şehit Adem Yavuz Sk. No:4/26</p>
                  <p>06420 Çankaya/Ankara</p>
                </div>
              </div>

              <a
                href="mailto:info@milliyetcidergiler.org"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-[#ffc451] transition-colors duration-300 group"
              >
                <svg className="w-5 h-5 text-[#ffc451]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@milliyetcidergiler.org</span>
              </a>
            </div>

            {/* Sosyal Medya */}
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] bg-[#222] text-white/70 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451] hover:text-[#333] hover:scale-110"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#333] bg-[#222] text-white/70 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451] hover:text-[#333] hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Menü Linkleri */}
          <div className="md:col-span-2">
            <h3 className="mb-6 text-lg font-bold text-white">Milliyetçi Dergiler</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-white/70 transition-all duration-300 hover:text-[#ffc451] hover:translate-x-1"
                >
                  <span className="text-[#ffc451] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    ›
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Twitter Widget Bölümü */}
        <div className="mt-12 rounded-2xl border border-[#333] bg-[#1a1a1a] ">
          {/* 🔽 Twitter Embed Alanı 🔽 */}
          <div className="overflow-y-auto h-[620px] rounded-xl border border-[#333] bg-[#1a1a1a] p-2 scrollbar-thin scrollbar-thumb-[#555] scrollbar-track-[#222]">
            <a
              className="twitter-timeline"
              href="https://twitter.com/milliyetcidergi?ref_src=twsrc%5Etfw"
              data-theme="dark"
              data-chrome="nofooter noborders transparent"
              data-tweet-limit="10"
              data-height="600"
            >
              Tweets by milliyetcidergi
            </a>
            <Script src="https://platform.twitter.com/widgets.js" async charSet="utf-8" />
          </div>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="border-t border-[#333]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-center text-sm text-white/50">
            © {new Date().getFullYear()} Milliyetçi Dergiler. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
