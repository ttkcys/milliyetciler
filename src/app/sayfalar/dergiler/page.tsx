"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, FileText, User, ChevronLeft, ChevronRight } from "lucide-react";

const ASSET_BASE = String(process.env.NEXT_PUBLIC_ASSET_BASE || "").replace(/\/+$/, "");

function assetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const cleaned = "/" + String(path).replace(/^\/+/, "");
  const encoded = cleaned.split("/").map(encodeURIComponent).join("/");
  return ASSET_BASE ? ASSET_BASE + encoded : encoded;
}

/** Kapaklar: /storage/sayilar/kapaklar/<isim>/<isim>/<isim>_1.jpg */
function coverFromStorageKapak(isim, index = 1) {
  const name = (isim || "").trim();
  return assetUrl(`storage/sayilar/kapaklar/${name}/${name}/${name}_${index}.jpg`);
}

function placeholderCover() {
  return assetUrl("logo/logo_color.svg");
}

/** ---- Yardımcılar ---- */
function yearPart(s) {
  if (!s) return null;
  const m = String(s).match(/\d{4}/);
  return m ? m[0] : null;
}

function formatDonem(cikis, bitis) {
  const c = yearPart(cikis);
  const b = yearPart(bitis);
  if (!c && !b) return "—";
  if (c && !b) return `${c} - …`;
  if (!c && b) return `… - ${b}`;
  return `${c} - ${b}`;
}

function startYearOfDonem(donem) {
  const m = String(donem || "").match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

/** ---- Kart ---- */
function MagazineCard({ m }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] transition-all duration-300 hover:border-[#ffc451] hover:shadow-2xl hover:shadow-[#ffc451]/10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/0 to-[#ffc451]/0 group-hover:from-[#ffc451]/5 group-hover:to-transparent transition-all duration-500" />

      <div className="relative aspect-[3/4] overflow-hidden bg-[#141414] p-8">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.img}
            alt={m.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = placeholderCover();
            }}
          />
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-[#ffc451]/90 px-3 py-1.5 backdrop-blur-sm">
          <FileText className="h-3.5 w-3.5 text-[#1a1a1a]" />
          <span className="text-xs font-bold text-[#1a1a1a]">{m.count ?? 0} Sayı</span>
        </div>
      </div>

      <div className="relative p-5 space-y-3">
        <h3 className="text-lg font-bold text-white group-hover:text-[#ffc451] transition-colors line-clamp-2">
          {m.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Calendar className="h-4 w-4 text-[#ffc451]" />
          <span>{m.donem}</span>
        </div>

        <a
          href={`/sayfalar/dergi-detay?id=${m.id}`}
          className="cursor-pointer w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#ffc451] hover:text-[#1a1a1a] border border-[#333] group-hover:border-[#ffc451]"
        >
          <BookOpen className="h-4 w-4" />
          <span>İncele</span>
        </a>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}

/** ---- Sayfa ---- */
export default function DergilerPage() {
  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Data state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // API base
  const API_BASE = String(process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

  // debounce
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // fetch
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      if (!API_BASE) {
        setErr("API adresi tanımlı değil. NEXT_PUBLIC_API_BASE ayarlayın.");
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (qDebounced.trim()) params.set("search", qDebounced.trim());

        const res = await fetch(`${API_BASE}/dergis?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          let msg = `Sunucu hatası (${res.status})`;
          try {
            const j = await res.json();
            if (j?.message) msg = j.message;
          } catch {}
          throw new Error(msg);
        }

        const json = await res.json();
        if (cancelled) return;

        setRows(json?.data || []);
        setTotal(json?.total || 0);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Bir hata oluştu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, qDebounced, API_BASE]);

  // arama değişince sayfa 1
  useEffect(() => setPage(1), [qDebounced]);

  // mapping + sorting + filtering
  const items = useMemo(() => {
    const mapped = (rows || []).map((d) => {
      const donem = formatDonem(d.cikis, d.bitis);
      return {
        id: d.id,
        name: d.isim,
        donem,
        img: coverFromStorageKapak(d.isim, 1), // ✅ BURASI DÜZELTİLDİ
        count: Number(d.toplam_sayi || 0),
        _yilStart: startYearOfDonem(donem),
      };
    });

    const sorted = mapped.slice().sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name, "tr-TR");
        case "name-desc":
          return b.name.localeCompare(a.name, "tr-TR");
        case "year-asc":
          return a._yilStart - b._yilStart;
        case "year-desc":
          return b._yilStart - a._yilStart;
        case "count-asc":
          return (a.count ?? 0) - (b.count ?? 0);
        case "count-desc":
          return (b.count ?? 0) - (a.count ?? 0);
        default:
          return a.name.localeCompare(b.name, "tr-TR");
      }
    });

    const qNorm = q.trim().toLocaleLowerCase("tr-TR");
    return !qNorm
      ? sorted
      : sorted.filter((m) => `${m.name} ${m.donem}`.toLocaleLowerCase("tr-TR").includes(qNorm));
  }, [rows, sort, q]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-black text-white opacity-85 mx-auto max-w-7xl">
      {/* Hero */}
      <div className="relative overflow-hidden bg-black border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative px-6 py-16 md:py-24">
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <a href="/" className="text-white/60 hover:text-[#ffc451] transition-colors">
              Anasayfa
            </a>
            <span className="text-white/40">›</span>
            <span className="text-[#ffc451] font-medium">Dergiler</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Dergiler</h1>
              <p className="text-white/60 text-lg mt-1">Milliyetçi düşün dünyasının seçkileri.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre & Sıralama */}
      <div className="px-6 pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative w-full md:max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Dergi ara… (isim veya dönem)"
              className="w-full rounded-xl border border-[#333] bg-[#141414] px-10 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20"
              aria-label="Dergi ara"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </label>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              {loading ? "Yükleniyor…" : `${total} dergi bulundu`}
            </span>
            <div className="h-4 w-px bg-[#333]" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Sırala:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                aria-label="Sıralama seç"
              >
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
                <option value="year-asc">Yıl (Artan)</option>
                <option value="year-desc">Yıl (Azalan)</option>
                <option value="count-asc">Sayı (Az-Çok)</option>
                <option value="count-desc">Sayı (Çok-Az)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-8 md:py-12">
        {err ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-[#1a1a1a] p-6">
              <User className="h-12 w-12 text-red-400" />
            </div>
            <p className="text-lg text-red-400">Hata: {err}</p>
          </div>
        ) : loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-[#1a1a1a] p-6">
              <BookOpen className="h-12 w-12 text-white/40" />
            </div>
            <p className="text-lg text-white/60">Yükleniyor…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-[#1a1a1a] p-6">
              <BookOpen className="h-12 w-12 text-white/40" />
            </div>
            <p className="text-lg text-white/60">Eşleşen dergi bulunamadı</p>
            <p className="text-sm text-white/40 mt-2">Farklı bir arama terimi deneyin</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((m) => (
                <MagazineCard key={m.id} m={m} />
              ))}
            </div>

            {/* Sayfalama */}
            <div className="mt-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Sayfa</span>
                <strong className="text-white">{page}</strong>
                <span>/</span>
                <span>{totalPages}</span>
                <div className="h-4 w-px bg-[#333] mx-3" />
                <span>Gösterim:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-[#333] bg-[#141414] px-2 py-1 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                >
                  {[12, 20, 28, 36, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:border-[#ffc451] hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Geri
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:border-[#ffc451] hover:text-white"
                >
                  İleri
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
