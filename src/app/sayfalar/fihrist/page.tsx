// app/fihrist/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

/* ---------- Backend tipleri ---------- */
type DergiRow = {
  id: number;
  isim: string;
  alt_baslik?: string | null;
  slogan?: string | null;
  aciklama?: string | null;
  imtiyaz?: string | null;
  yazi_mudur?: string | null;
  cikis?: number | string | null;
  bitis?: number | string | null;
  basim_yeri?: string | null;
  toplam_sayi?: number | string | null;
  eksikler?: string | null;
  telif?: string | null;
  created_at?: string;
  updated_at?: string;
};

type DergiListResponse = {
  page: number;
  limit: number;
  total: number;
  data: DergiRow[];
};

/* ---------- Tablo satırı tipi ---------- */
type Row = {
  id: number;
  name: string;              // isim
  owner: string;             // imtiyaz
  editor: string;            // yazi_mudur
  startYear: number | null;  // cikis
  endYear: number | null;    // bitis
  city: string;              // basim_yeri
  total: number | null;      // toplam_sayi
  missing?: string | null;   // eksikler
  donation?: boolean | null; // telif'ten türetilir
};

/* ---------- UI sınıfları ---------- */
const thBase =
  "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-white/70 select-none";
const tdBase = "px-3 py-2 text-sm text-white/85";
const cell = "border-b border-[#2b2b2b]";

/* ---------- Yardımcılar ---------- */
function sortIcon(dir?: "asc" | "desc") {
  if (!dir)
    return (
      <svg className="ml-1 inline h-3.5 w-3.5 opacity-40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5-5 5 5H7zm10 4l-5 5-5-5h10z" />
      </svg>
    );
  if (dir === "asc")
    return (
      <svg className="ml-1 inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14l5-5 5 5H7z" />
      </svg>
    );
  return (
    <svg className="ml-1 inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

type SortKey = "name" | "owner" | "editor" | "city" | "startYear" | "endYear" | "total";
type SortState = { key: SortKey; dir: "asc" | "desc" };

/* ---------- İstek atılacak endpoint ---------- */
const ENDPOINT = "/api/dergis";

/* ---------- Adaptörler ---------- */
function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^\d-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Türkçe küçük harfe indir, aksanları sadeleştir. */
function trFold(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** telif alanından bağış durumunu güvenli çıkarır. */
function parseDonation(telif: unknown): boolean | null {
  if (telif === null || telif === undefined) return null;
  const raw = String(telif).trim();
  if (!raw) return null;
  const s = trFold(raw);

  // Negatif kalıplar (öncelik)
  const negative =
    /(bagis deg(il|ildir)?|bagis yok|bagis alinmadi|telif(li)?|ucret(li)?|parali|satilik|satildi)/i.test(
      s
    );
  if (negative) return false;

  // Pozitif kalıplar
  const positive =
    /(bagis|hibe|bagislandi|bagis yoluyla|bağış)/i.test(s) || /\b(true|1|evet|yes)\b/.test(s);
  if (positive) return true;

  return null;
}

function mapRow(r: DergiRow): Row {
  return {
    id: Number(r.id),
    name: r.isim || "",
    owner: r.imtiyaz || "",
    editor: r.yazi_mudur || "",
    startYear: toIntOrNull(r.cikis),
    endYear: toIntOrNull(r.bitis),
    city: r.basim_yeri || "",
    total: toIntOrNull(r.toplam_sayi),
    missing: r.eksikler ?? null,
    donation: parseDonation(r.telif),
  };
}

/* ---------- İstemci sıralama ---------- */
const collTR = new Intl.Collator("tr", { sensitivity: "base", numeric: true });

function cmp(a: Row, b: Row, key: SortKey, dir: "asc" | "desc") {
  const mul = dir === "asc" ? 1 : -1;

  // Sayısal sütunlar
  if (key === "startYear" || key === "endYear" || key === "total") {
    const an = (typeof a[key] === "number" ? a[key] : toIntOrNull(a[key] as any)) ?? -Infinity;
    const bn = (typeof b[key] === "number" ? b[key] : toIntOrNull(b[key] as any)) ?? -Infinity;
    return (an - bn) * mul;
  }

  // String sütunlar — Türkçe duyarlı, numerik bilinçli
  const av = String((a as any)[key] ?? "");
  const bv = String((b as any)[key] ?? "");
  return collTR.compare(av, bv) * mul;
}

export default function FihristPage() {
  /* ---------- Filtreler ---------- */
  const [fName, setFName] = useState("");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fCity, setFCity] = useState("");
  const [fOwner, setFOwner] = useState("");
  const [fEditor, setFEditor] = useState("");
  const [fDonation, setFDonation] = useState<"all" | "bagis" | "none">("all");

  /* ---------- Sıralama (varsayılan: Dergi Adı A→Z) ---------- */
  const [sort, setSort] = useState<SortState>({ key: "name", dir: "asc" });
  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  /* ---------- Veri ---------- */
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // /api/dergis çağrısı (sayfalama yok; tüm veriyi çek)
  const fetchList = (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    // Backend alan bazlı filtre almıyor; hepsini tek search’e sıkıştır.
    const tokens: string[] = [];
    if (fName.trim()) tokens.push(fName.trim());
    if (fCity.trim()) tokens.push(fCity.trim());
    if (fOwner.trim()) tokens.push(fOwner.trim());
    if (fEditor.trim()) tokens.push(fEditor.trim());
    if (fStart.trim()) tokens.push(fStart.trim());
    if (fEnd.trim()) tokens.push(fEnd.trim());

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "100000"); // tüm kayıtlar
    if (tokens.length) params.set("search", tokens.join(" "));

    fetch(`${ENDPOINT}?${params.toString()}`, { cache: "no-store", signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json = (await res.json()) as DergiListResponse;
        const mapped = (json.data || []).map(mapRow);

        // Bağış filtresi (client-side). "none" => donation !== true (false veya null)
        const filtered =
          fDonation === "all"
            ? mapped
            : mapped.filter((r) => (fDonation === "bagis" ? r.donation === true : r.donation !== true));

        setRows(filtered);
      })
      .catch((e: any) => {
        if (e?.name === "AbortError") return;
        setRows([]);
        setError(e?.message || "Bilinmeyen bir hata oluştu.");
      })
      .finally(() => setLoading(false));
  };

  // Filtreler değişince istek (sayfalama yok)
  useEffect(() => {
    const controller = new AbortController();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchList(controller.signal), 300);
    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fName, fStart, fEnd, fCity, fOwner, fEditor, fDonation]);

  // İstemci sıralama (varsayılan: name asc)
  const sortedRows = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => cmp(a, b, sort.key, sort.dir));
    return arr;
  }, [rows, sort]);

  return (
    <div className="opacity-85 min-h-screen bg-black text-white">
      {/* Hero + Breadcrumb */}
      <div className="relative overflow-hidden bg-black border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <a href="/" className="text-white/60 hover:text-[#ffc451] transition-colors">
              Anasayfa
            </a>
            <span className="text-white/40">›</span>
            <span className="text-[#ffc451] font-medium">Fihrist</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Fihrist</h1>
              <p className="text-white/60 text-lg mt-1">Dergi künyeleri, yıllar ve sayılar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre Barı */}
      <div className="sticky top-0 z-10 border-b border-[#2b2b2b] bg-[#0d0d-0d]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Dergi Adı"
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              className="rounded-lg border border-[#333] bg-[#141414] pl-3 py-2 text-sm outline-none focus:border-[#ffc451]"
            />
            <input
              placeholder="Çıkış Tarihi"
              value={fStart}
              onChange={(e) => setFStart(e.target.value)}
              className="w-32 rounded-lg border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
            />
            <input
              placeholder="Kapanış Tarihi"
              value={fEnd}
              onChange={(e) => setFEnd(e.target.value)}
              className="w-36 rounded-lg border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
            />
            <input
              placeholder="Basım Yeri"
              value={fCity}
              onChange={(e) => setFCity(e.target.value)}
              className="w-40 rounded-lg border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
            />
            <input
              placeholder="İmtiyaz Sahibi"
              value={fOwner}
              onChange={(e) => setFOwner(e.target.value)}
              className="w-44 rounded-lg border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
            />
            <input
              placeholder="Yazı İşleri Müdürü"
              value={fEditor}
              onChange={(e) => setFEditor(e.target.value)}
              className="w-48 rounded-lg border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
            />
            <select
              value={fDonation}
              onChange={(e) => setFDonation(e.target.value as "all" | "bagis" | "none")}
              className="w-36 rounded-lg border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
              title="Bağış filtresi"
            >
              <option value="all">Tümü</option>
              <option value="bagis">Sadece bağış olanlar</option>
              <option value="none">Bağış olmayanlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="overflow-x-auto rounded-2xl border border-[#2b2b2b] bg-[#101010]">
          <table className="min-w-[900px] w-full border-collapse">
            <thead className="bg-[#141414]">
              <tr className="border-b border-[#2b2b2b]">
                <th className={`${thBase} ${cell} cursor-pointer`} onClick={() => toggleSort("name")}>
                  <span className="inline-flex items-center">
                    Dergi Adı {sort.key === "name" ? sortIcon(sort.dir) : sortIcon()}
                  </span>
                </th>
                <th className={`${thBase} ${cell}`}>İmtiyaz Sahibi</th>
                <th className={`${thBase} ${cell}`}>Yazı İşleri Müdürü</th>
                <th className={`${thBase} ${cell}`}>Çıkış Tarihi</th>
                <th className={`${thBase} ${cell}`}>Kapanış Tarihi</th>
                <th className={`${thBase} ${cell}`}>Basım Yeri</th>
                <th className={`${thBase} ${cell}`}>Toplam Sayı Adedi</th>
                <th className={`${thBase} ${cell}`}>Eksik Sayılar</th>
                <th className={`${thBase} ${cell}`}>Bağış</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td className={`${tdBase} ${cell}`} colSpan={9}>Yükleniyor…</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td className={`${tdBase} ${cell}`} colSpan={9}>
                    <div className="space-y-2">
                      <div><span className="text-red-400">Hata:</span> {error}</div>
                      <div className="text-white/50 text-xs">
                        İstek: <code>{ENDPOINT}</code> (GET, query: <code>page</code>, <code>limit</code>, <code>search</code>)
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && sortedRows.length === 0 && (
                <tr><td className={`${tdBase} ${cell}`} colSpan={9}>Kayıt bulunamadı.</td></tr>
              )}

              {!loading && !error && sortedRows.map((r, i) => (
                <tr key={r.id} className={`hover:bg-[#161616] ${i % 2 === 0 ? "bg-[#121212]" : "bg-[#101010]"}`}>
                  <td className={`${tdBase} ${cell}`}>{r.name}</td>
                  <td className={`${tdBase} ${cell}`}>{r.owner}</td>
                  <td className={`${tdBase} ${cell}`}>{r.editor}</td>
                  <td className={`${tdBase} ${cell}`}>{r.startYear ?? "—"}</td>
                  <td className={`${tdBase} ${cell}`}>{r.endYear ?? "—"}</td>
                  <td className={`${tdBase} ${cell}`}>{r.city}</td>
                  <td className={`${tdBase} ${cell}`}>{r.total ?? "—"}</td>
                  <td className={`${tdBase} ${cell}`}>
                    {r.missing ? (
                      <span className="rounded bg-[#ffc451]/15 px-2 py-0.5 text-xs text-[#ffc451]">{r.missing}</span>
                    ) : (<span className="text-white/40">—</span>)}
                  </td>
                  <td className={`${tdBase} ${cell}`}>
                    {r.donation === true ? (
                      <span className="rounded-full bg-[#ffc451] px-3 py-1 text-xs font-semibold text-[#1a1a1a]">Bağış</span>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
