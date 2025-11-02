// src/app/arama/page.tsx
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  LibraryBig,
  Layers3,
  FileText,
  Feather,
  ChevronDown,
  ChevronUp,
  Filter,
  BookOpen,
  Calendar,
  User2,
  ExternalLink,
} from "lucide-react";

/* ====================== Tipler ====================== */
type Dergi = { id: number; isim: string; alt_baslik?: string | null };
type Sayi = {
  id: number;
  dergi_id: number;
  sayi_num: string;
  ay: string | null;
  yil: number | null;
  image?: string | null;
  pdf?: string | null;
  toplam_sayfa?: number | null;
  toplam_yazi?: number | null;
};
type Yazar = { id: number; isim: string };

type YaziRow = {
  id: number;
  baslik: string | null;
  alt_baslik: string | null;
  sayi_id: number | null;
  dergi_id: number | null;
  dergi_isim: string | null;
  sayi_num: string | null;
  ay: string | null;
  yil: number | null;
  sayfa: number | null;
  yazar_id?: number | null;
  yazar_isim?: string | null; // API'den geliyor
};

type Counters = { dergi: number; sayi: number; yazi: number; yazar: number };

type ResultItem =
  | { kind: "dergi"; data: Dergi }
  | { kind: "sayi"; data: Sayi & { dergi_isim?: string | null } }
  | { kind: "yazi"; data: YaziRow }
  | { kind: "yazar"; data: Yazar };

/* ====================== Yardımcılar ====================== */
function badge(kind: ResultItem["kind"]) {
  if (kind === "dergi") return "Dergi";
  if (kind === "sayi") return "Sayı";
  if (kind === "yazi") return "Yazı";
  return "Yazar";
}
function KindIcon({ kind }: { kind: ResultItem["kind"] }) {
  if (kind === "dergi") return <LibraryBig className="w-4 h-4" />;
  if (kind === "sayi") return <Layers3 className="w-4 h-4" />;
  if (kind === "yazi") return <FileText className="w-4 h-4" />;
  return <Feather className="w-4 h-4" />;
}
async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(url + " -> " + r.status);
  return r.json();
}

/* ====================== Sayfa ====================== */
export default function GenelAramaPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const qGeneral0 = sp.get("q") || "";
  const qDergi0 = sp.get("dergi") || "";
  const qYil0 = sp.get("yil") || "";
  const qYazi0 = sp.get("yazi") || "";
  const qYazar0 = sp.get("yazar") || "";
  const pathname = usePathname();

  const [qGeneral, setQGeneral] = useState(qGeneral0);
  const [qDergi, setQDergi] = useState(qDergi0);
  const [qYil, setQYil] = useState(qYil0);
  const [qYazi, setQYazi] = useState(qYazi0);
  const [qYazar, setQYazar] = useState(qYazar0);

  const [counters, setCounters] = useState<Counters>({
    dergi: 0,
    sayi: 0,
    yazi: 0,
    yazar: 0,
  });

  // Facet toplamları (API total)
  const [facetTotals, setFacetTotals] = useState({
    dergi: 0,
    sayi: 0,
    yazi: 0,
    yazar: 0,
  });

  const [expandedFilters, setExpandedFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState({
    dergi: true,
    sayi: true,
    yazi: true,
    yazar: true,
  });
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 24;

  // sayaçlar
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [d, s, y, z] = await Promise.all([
          fetchJSON<{ total: number }>("/api/dergis?limit=1&page=1"),
          fetchJSON<{ total: number }>("/api/sayis?limit=1&page=1"),
          fetchJSON<{ total: number }>("/api/yazis?limit=1&page=1"),
          fetchJSON<{ total: number }>("/api/yazars?limit=1&page=1"),
        ]);
        if (!cancel)
          setCounters({
            dergi: d.total || 0,
            sayi: s.total || 0,
            yazi: y.total || 0,
            yazar: z.total || 0,
          });
      } catch {}
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // kapsam
  const effectiveScope = useMemo(() => {
    const onlyYazi = qYazi.trim().length > 0 && !qGeneral && !qDergi && !qYazar;
    const onlyYazar = qYazar.trim().length > 0 && !qGeneral && !qDergi && !qYazi;
    const onlyDergi = qDergi.trim().length > 0 && !qGeneral && !qYazar && !qYazi;

    if (onlyYazi) return { dergi: false, sayi: false, yazi: true, yazar: false };
    if (onlyYazar) return { dergi: false, sayi: false, yazi: true, yazar: true };
    if (onlyDergi) return { dergi: true, sayi: true, yazi: true, yazar: false };
    return { ...typeFilter };
  }, [qGeneral, qDergi, qYazi, qYazar, typeFilter]);

  // arama
  const doSearch = async (pg = 1) => {
    setLoading(true);
    setPage(pg);
    // ilk sayfada sıfırla; load more'da ekle
    if (pg === 1) setResults([]);

    try {
      const params = new URLSearchParams();
      if (qGeneral) params.set("q", qGeneral);
      if (qDergi) params.set("dergi", qDergi);
      if (qYil) params.set("yil", qYil);
      if (qYazi) params.set("yazi", qYazi);
      if (qYazar) params.set("yazar", qYazar);
      router.replace(`${pathname}?${params.toString()}` as any, { scroll: false });

      const promises: Promise<ResultItem[]>[] = [];
      const totals = { dergi: 0, sayi: 0, yazi: 0, yazar: 0 };

      // Dergi
      if (effectiveScope.dergi) {
        const url = `/api/dergis?search=${encodeURIComponent(
          qDergi || qGeneral
        )}&limit=${limit}&page=${pg}`;
        promises.push(
          fetchJSON<{ data: Dergi[]; total: number }>(url)
            .then((j) => {
              totals.dergi = j?.total ?? 0;
              return (j?.data || []).map(
                (d) => ({ kind: "dergi", data: d } as ResultItem)
              );
            })
            .catch(() => [] as ResultItem[])
        );
      }

      // Sayı
      if (effectiveScope.sayi) {
        let dergiIds: number[] = [];
        if (qDergi) {
          const j = await fetchJSON<{ data: Dergi[]; total: number }>(
            `/api/dergis?search=${encodeURIComponent(qDergi)}&limit=200&page=1`
          ).catch(() => ({ data: [] as Dergi[], total: 0 }));
          dergiIds = (j?.data || []).map((x) => x.id);
        }

        const query = new URLSearchParams();
        if (qGeneral) query.set("search", qGeneral);
        if (qYil) query.set("yil", qYil);
        query.set("limit", String(limit));
        query.set("page", String(pg));
        const base = `/api/sayis?${query.toString()}`;

        if (dergiIds.length === 0) {
          const resp = await fetchJSON<{ data: Sayi[]; total: number }>(base).catch(
            () => ({ data: [] as Sayi[], total: 0 })
          );
          totals.sayi = resp.total ?? 0;
          promises.push(
            Promise.resolve(
              (resp.data || []).map(
                (s) => ({ kind: "sayi", data: s } as ResultItem)
              )
            )
          );
        } else {
          // Birden fazla dergi varsa: veri için ilk 8 dergi, toplam için ilk derginin total'ı
          const totalFirst = await fetchJSON<{ data: Sayi[]; total: number }>(
            `${base}&dergi_id=${dergiIds[0]}`
          ).catch(() => ({ data: [] as Sayi[], total: 0 }));
          totals.sayi = totalFirst.total ?? 0;

          const group = await Promise.all(
            dergiIds.slice(0, 8).map(async (id) => {
              const u = `${base}&dergi_id=${id}`;
              const j = await fetchJSON<{ data: Sayi[] }>(u).catch(() => ({
                data: [] as Sayi[],
              }));
              return (j?.data || []).map(
                (s) => ({ kind: "sayi", data: s } as ResultItem)
              );
            })
          );
          promises.push(Promise.resolve(group.flat() as ResultItem[]));
        }
      }

      // Yazar
      if (effectiveScope.yazar) {
        const url = `/api/yazars?search=${encodeURIComponent(
          qYazar || qGeneral
        )}&limit=${limit}&page=${pg}`;
        promises.push(
          fetchJSON<{ data: Yazar[]; total: number }>(url)
            .then((j) => {
              totals.yazar = j?.total ?? 0;
              return (j?.data || []).map(
                (y) => ({ kind: "yazar", data: y } as ResultItem)
              );
            })
            .catch(() => [] as ResultItem[])
        );
      }

      // Yazı
      if (effectiveScope.yazi) {
        const query = new URLSearchParams();
        const baslik = qYazi || qGeneral;
        if (baslik) query.set("search", baslik);
        if (qYil) query.set("yil", qYil);

        // dergi adı → id (opsiyonel: ilk eşleşme)
        if (qDergi) {
          const j = await fetchJSON<{ data: Dergi[] }>(
            `/api/dergis?search=${encodeURIComponent(qDergi)}&limit=50&page=1`
          ).catch(() => ({ data: [] as Dergi[] }));
          const ids = (j?.data || []).map((x) => x.id);
          if (ids.length) query.set("dergi_id", String(ids[0]));
        }
        // yazar adı → id (opsiyonel: ilk eşleşme)
        if (qYazar) {
          const j = await fetchJSON<{ data: Yazar[] }>(
            `/api/yazars?search=${encodeURIComponent(qYazar)}&limit=50&page=1`
          ).catch(() => ({ data: [] as Yazar[] }));
          const ids = (j?.data || []).map((x) => x.id);
          if (ids.length) query.set("yazar_id", String(ids[0]));
        }

        query.set("limit", String(limit));
        query.set("page", String(pg));

        const url = `/api/yazis?${query.toString()}`;
        const resp = await fetchJSON<{ data: YaziRow[]; total: number }>(url).catch(
          () => ({ data: [] as YaziRow[], total: 0 })
        );

        totals.yazi = resp.total ?? 0;

        const items: ResultItem[] = (resp.data || []).map((r) => ({
          kind: "yazi",
          data: r, // API zaten yazar_isim ve dergi_isim getiriyor
        }));
        promises.push(Promise.resolve(items));
      }

      // topla + sayılara dergi adı iliştir
      const chunks = await Promise.all(promises);
      const flat = chunks.flat();

      const sayiNeed = flat.filter(
        (x): x is Extract<ResultItem, { kind: "sayi" }> => x.kind === "sayi"
      );
      if (sayiNeed.length) {
        const dergiIds = Array.from(
          new Set(sayiNeed.map((s) => s.data.dergi_id))
        ).slice(0, 50);
        const pairs = await Promise.all(
          dergiIds.map(async (id) => {
            const j = await fetchJSON<Dergi>(`/api/dergis/${id}`).catch(
              () => null as any
            );
            return [id, j?.isim ?? null] as const;
          })
        );
        const map = new Map<number, string | null>(pairs);
        for (const it of sayiNeed) it.data.dergi_isim = map.get(it.data.dergi_id) ?? null;
      }

      // sonuçları ekle/yerine yaz
      setResults((prev) => (pg === 1 ? flat : [...prev, ...flat]));
      setFacetTotals(totals);
    } catch {
      if (pg === 1) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const didAutoload = useRef(false);
  useEffect(() => {
    if (didAutoload.current) return;
    if (qGeneral || qDergi || qYil || qYazi || qYazar) {
      didAutoload.current = true;
      doSearch(1);
    }
  }, []); // eslint-disable-line

  // Load more göstergesi: herhangi bir facet'te daha fazla varsa
  const canLoadMore =
    (effectiveScope.dergi && facetTotals.dergi > page * limit) ||
    (effectiveScope.sayi && facetTotals.sayi > page * limit) ||
    (effectiveScope.yazi && facetTotals.yazi > page * limit) ||
    (effectiveScope.yazar && facetTotals.yazar > page * limit);

  /* ====================== UI ====================== */
  return (
    <div className="min-h-screen bg-black text-white opacity-85">
      {/* Başlık */}
      <div className="border-b border-[#333]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#ffc451] flex items-center justify-center text-[#1a1a1a]">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Genel Arama</h1>
              <p className="text-white/60 text-sm">
                Dergiler, sayılar, yazılar ve yazarlarda arayın.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sayaçlar + Form */}
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            icon={<LibraryBig className="w-5 h-5" />}
            label="Dergiler"
            value={counters.dergi}
          />
          <StatBox
            icon={<Layers3 className="w-5 h-5" />}
            label="Sayılar"
            value={counters.sayi}
          />
          <StatBox
            icon={<FileText className="w-5 h-5" />}
            label="Yazılar"
            value={counters.yazi}
          />
          <StatBox
            icon={<Feather className="w-5 h-5" />}
            label="Yazarlar"
            value={counters.yazar}
          />
        </div>

        {/* Form */}
        <div className="space-y-3">
          <Input placeholder="Genel Arama" value={qGeneral} onChange={setQGeneral} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Dergi Adı" value={qDergi} onChange={setQDergi} />
            <Input placeholder="Yıl" value={qYil} onChange={setQYil} inputMode="numeric" />
            <Input placeholder="Yazar Adı" value={qYazar} onChange={setQYazar} />
          </div>
          <Input placeholder="Yazı Başlığı" value={qYazi} onChange={setQYazi} />

          {/* Filtre dropdown */}
          <div className="rounded-xl border border-[#333] bg-[#0f0f0f]">
            <button
              onClick={() => setExpandedFilters((x) => !x)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2 text-white/80">
                <Filter className="w-4 h-4 text-[#ffc451]" />
                <span>Tür Filtresi</span>
                <span className="text-white/50 text-xs">
                  (Dergi {facetTotals.dergi} • Sayı {facetTotals.sayi} • Yazı{" "}
                  {facetTotals.yazi} • Yazar {facetTotals.yazar})
                </span>
              </div>
              {expandedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedFilters && (
              <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {(["dergi", "sayi", "yazi", "yazar"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={typeFilter[k]}
                      onChange={(e) =>
                        setTypeFilter((f) => ({ ...f, [k]: e.target.checked }))
                      }
                    />
                    <span>{k[0].toUpperCase() + k.slice(1)}</span>
                  </label>
                ))}
                <button
                  onClick={() =>
                    setTypeFilter({ dergi: true, sayi: true, yazi: true, yazar: true })
                  }
                  className="mt-2 md:mt-0 justify-self-end rounded-lg border border-[#333] px-3 py-1.5 text-xs hover:border-[#ffc451]"
                >
                  Tümünü seç
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => doSearch(1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ffc451] hover:bg-[#ffb020] px-4 py-2 text-[#1a1a1a] font-semibold"
            >
              <Search className="w-4 h-4" />
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Sonuçlar */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white/80">
            <BookOpen className="w-4 h-4 text-[#ffc451]" />
            <span>
              Arama Sonuçları <span className="text-white/50">({results.length})</span>
            </span>
          </div>
          {results.length > 0 && <span className="text-xs text-white/50">Sayfa {page}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && page === 1
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl border border-[#333] bg-[#0f0f0f] animate-pulse"
                />
              ))
            : results.length === 0
            ? (
              <div className="col-span-full text-white/60">Sonuç bulunamadı.</div>
            )
            : (
              results.map((r) => (
                <ResultCard key={`${r.kind}-${(r as any).data.id}`} item={r} />
              ))
            )}
        </div>

        {canLoadMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => doSearch(page + 1)}
              className="rounded-lg border border-[#333] px-4 py-2 text-sm hover:border-[#ffc451]"
            >
              Daha Fazla Yükle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================== Bileşenler ====================== */
function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-[#333] bg-[#0f0f0f] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#151515] flex items-center justify-center text-[#ffc451]">
          {icon}
        </div>
        <div>
          <div className="text-xs text-white/60">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full rounded-xl border border-[#333] bg-[#0f0f0f] px-3 py-2 outline-none focus:border-[#ffc451] placeholder:text-white/40"
    />
  );
}

function ResultCard({ item }: { item: ResultItem }) {
  const k = item.kind;

  if (k === "dergi") {
    const d = item.data;
    return (
      <a
        href={`/dergi?id=${d.id}`}
        className="block rounded-2xl border border-[#333] bg-[#0f0f0f] p-4 hover:border-[#ffc451] transition"
      >
        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#141414] px-2 py-0.5">
            <KindIcon kind="dergi" />
            {badge("dergi")}
          </span>
        </div>
        <div className="text-[#ffc451] font-semibold line-clamp-1">{d.isim}</div>
        {d.alt_baslik ? (
          <div className="text-white/60 text-sm line-clamp-1 mt-1">{d.alt_baslik}</div>
        ) : null}
      </a>
    );
  }

  if (k === "sayi") {
    const s = item.data;
    return (
      <a
        href={`/sayi?id=${s.id}`}
        className="block rounded-2xl border border-[#333] bg-[#0f0f0f] p-4 hover:border-[#ffc451] transition"
      >
        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#141414] px-2 py-0.5">
            <KindIcon kind="sayi" />
            {badge("sayi")}
          </span>
        </div>
        <div className="font-semibold text-[#ffc451] line-clamp-1">
          {(s as any).dergi_isim || "Dergi"} {extractNo(s.sayi_num)}. Sayı
        </div>
        <div className="text-sm text-white/70 mt-1 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#ffc451]" />
          <span>{(s.ay ? s.ay + " " : "") + (s.yil ?? "") || "—"}</span>
        </div>
      </a>
    );
  }

  if (k === "yazi") {
    const y = item.data as YaziRow;
    return (
      <a
        href={y.sayi_id ? `/sayi?id=${y.sayi_id}` : "#"}
        className="block rounded-2xl border border-[#333] bg-[#0f0f0f] p-4 hover:border-[#ffc451] transition"
      >
        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#141414] px-2 py-0.5">
            <KindIcon kind="yazi" />
            {badge("yazi")}
          </span>
        </div>
        <div className="font-semibold text-[#ffc451] line-clamp-1">{y.baslik || "-"}</div>
        <div className="mt-1 text-sm text-white/80">
          {y.dergi_isim ? <b>{y.dergi_isim}</b> : null}
          {y.sayi_num ? <> {y.sayi_num}</> : null}
          {y.sayfa ? <> • {y.sayfa}.Sayfa</> : null}
        </div>
        <div className="mt-0.5 text-xs text-white/70 flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <User2 className="w-3.5 h-3.5 text-[#ffc451]" />
            {y.yazar_isim || "Belirtilmemiş"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#ffc451]" />
            {y.yil ?? "—"}
          </span>
        </div>
      </a>
    );
  }

  const a = item.data as Yazar;
  return (
    <a
      href={`/sayfalar/yazar-detay?id=${a.id}`}
      className="block rounded-2xl border border-[#333] bg-[#0f0f0f] p-4 hover:border-[#ffc451] transition"
    >
      <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
        <span className="inline-flex items-center gap-1 rounded-md bg-[#141414] px-2 py-0.5">
          <KindIcon kind="yazar" />
          {badge("yazar")}
        </span>
      </div>
      <div className="font-semibold text-[#ffc451] line-clamp-1">{a.isim}</div>
      <div className="text-xs text-white/60 mt-1">
        Yazar profiline git <ExternalLink className="inline w-3 h-3" />
      </div>
    </a>
  );
}

function extractNo(sayi_num: string | null | undefined) {
  const m = String(sayi_num || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 1;
}