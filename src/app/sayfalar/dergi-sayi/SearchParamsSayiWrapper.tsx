"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, FileText, List, ChevronLeft } from "lucide-react";

/* ---- Tipler ---- */
type Sayi = {
  id: number;
  dergi_id: number;
  sayi_num: string;
  ay: string | null;
  yil: number | null;
  image: string | null;
  pdf: string | null;
  toplam_sayfa: number | null;
  toplam_yazi: number | null;
  created_at: string;
  updated_at: string;
};

type Dergi = { id: number; isim: string };

type YaziApiRow = {
  id: number;
  sayi_id: number | null;
  baslik: string | null;
  sayfa: number | null;
  yazar_id: number | null;
  yazar_isim: string | null;
};

type Yazi = {
  id: number;
  sayi_id: number;
  baslik: string;
  yazar: string;
  yazar_id: number | null;
  sayfa: number | null;
};

function pdfFromRule(dergiIsim: string, sayiNo: number) {
  const enc = encodeURIComponent((dergiIsim || "").trim());
  return `/pdf/${enc}/${enc}_${sayiNo}_compressed.pdf`;
}

/* ---- Yardımcılar ---- */
const placeholderCover = () => "/logo/logo_color.svg";

function normalizePublicPath(p?: string | null) {
  if (!p) return null;
  let s = String(p).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, "");
  s = s.replace(/^\/+/, "");
  s = s.replace(/^public\/+/, "");
  return "/" + s.split("/").map(encodeURIComponent).join("/");
}

function pdfPathToImage(pdf?: string | null) {
  if (!pdf) return null;
  let s = String(pdf).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, "");
  s = s.replace(/^\/+/, "");
  s = s.replace(/^public\/+/, "");
  s = s.replace(/^(pdfs?|PDFS?)\//, "pdfImage/");
  s = s.replace(/(_compressed)?\.(pdf|PDF)$/, ".jpg");
  return "/" + s.split("/").map(encodeURIComponent).join("/");
}

function extractIssueNo(sayi_num: string): number {
  const m = String(sayi_num || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 1;
}

function coverFromPdfImageRaw(dergiIsim: string, no: number) {
  const enc = encodeURIComponent((dergiIsim || "").trim());
  const n = Number(no) || 1;
  return `/pdfImage/${enc}/${enc}_${n}.jpg`;
}

function issueCover(dergiIsim: string | undefined, sayi: Sayi) {
  const fromImage = normalizePublicPath(sayi.image || undefined);
  if (fromImage && !/^\/?public\/pdfs?/i.test(sayi.image || "")) return fromImage;
  const fromPdf = pdfPathToImage(sayi.pdf);
  if (fromPdf) return fromPdf;
  if (dergiIsim) return coverFromPdfImageRaw(dergiIsim, extractIssueNo(sayi.sayi_num));
  return placeholderCover();
}

/* ---- CLIENT WRAPPER (default export) ---- */
export default function SearchParamsSayiWrapper() {
  const sp = useSearchParams();
  const idParam = sp.get("id");
  const sayiId = idParam ? Number(idParam) : NaN;

  const [sayi, setSayi] = useState<Sayi | null>(null);
  const [dergi, setDergi] = useState<Dergi | null>(null);
  const [yazilar, setYazilar] = useState<Yazi[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // verileri çek
  useEffect(() => {
    if (!sayiId) return;
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) sayı
        const rSayi = await fetch(`/api/sayis/${sayiId}`, { cache: "no-store" });
        if (!rSayi.ok) throw new Error("Sayı bulunamadı");
        const s = (await rSayi.json()) as Sayi;
        if (cancel) return;
        setSayi(s);

        // 2) dergi
        const rD = await fetch(`/api/dergis/${s.dergi_id}`, { cache: "no-store" });
        if (rD.ok) setDergi((await rD.json()) as Dergi);

        // 3) yazılar
        const rY = await fetch(`/api/yazis?sayi_id=${sayiId}&limit=1000`, { cache: "no-store" });
        let rows: YaziApiRow[] = [];
        if (rY.ok) {
          const j = await rY.json();
          rows = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        }

        const mapped: Yazi[] = rows.map((x) => ({
          id: x.id,
          sayi_id: x.sayi_id ?? s.id,
          baslik: x.baslik ?? "-",
          yazar: x.yazar_isim ?? "-",
          yazar_id: x.yazar_id ?? null,
          sayfa: x.sayfa ?? null,
        }));

        if (!cancel) setYazilar(mapped);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || "Veriler yüklenemedi");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [sayiId]);

  const kapak = useMemo(
    () => (sayi && dergi ? issueCover(dergi.isim, sayi) : placeholderCover()),
    [sayi, dergi]
  );

  const baslik = useMemo(() => {
    if (!sayi || !dergi) return "Sayı";
    return `${dergi.isim} ${extractIssueNo(sayi.sayi_num)}. Sayı`;
  }, [sayi, dergi]);

  const periodText = useMemo(() => {
    if (!sayi) return "";
    const m = sayi.ay ? `${sayi.ay} ` : "";
    return `${m}${sayi.yil ?? ""}`.trim();
  }, [sayi]);

  const pdfHref = useMemo(() => normalizePublicPath(sayi?.pdf || undefined) || undefined, [sayi]);

  if (!idParam || Number.isNaN(sayiId)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Geçersiz bağlantı. Örn: <span className="ml-1 text-[#ffc451]">/sayi?id=2659</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white opacity-85">
      {/* Üst şerit / breadcrumb */}
      <div className="border-b border-[#333]">
        <div className="mx-auto max-w-7xl px-6 py-4 text-sm">
          <a href="/" className="text-white/60 hover:text-[#ffc451]">Anasayfa</a>
          <span className="text-white/40 mx-1.5">›</span>
          {dergi ? (
            <a href={`/sayfalar/dergi-detay?id=${dergi.id}`} className="text-white/60 hover:text-[#ffc451]">{dergi.isim}</a>
          ) : (
            <span className="text-white/60">Dergi</span>
          )}
          <span className="text-white/40 mx-1.5">›</span>
          <span className="text-[#ffc451]">{sayi?.sayi_num || "Sayı"}</span>
        </div>
      </div>

      {/* Başlık */}
      <div className="relative overflow-hidden bg-black border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-7 h-7 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{baslik}</h1>
              <p className="text-white/60">{periodText || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik grid */}
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tablo */}
        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-[#333] bg-[#0f0f0f]">
            <div className="bg-[#151515] border-b border-[#333] px-4 py-3 text-sm text-white/70">
              Yazılar
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#141414]">
                    <th className="text-left px-4 py-2 font-medium text-white/80">Yazı Başlığı</th>
                    <th className="text-left px-4 py-2 font-medium text-white/80">Yazar</th>
                    <th className="text-center px-4 py-2 font-medium text-white/80">Sayfa</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="px-4 py-10 text-center text-white/60">Yükleniyor…</td></tr>
                  ) : err ? (
                    <tr><td colSpan={3} className="px-4 py-10 text-center text-red-400">Hata: {err}</td></tr>
                  ) : yazilar.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-10 text-center text-white/60">Bu sayıya ait yazı kaydı yok.</td></tr>
                  ) : (
                    yazilar
                      .slice()
                      .sort((a, b) => (a.sayfa ?? 0) - (b.sayfa ?? 0))
                      .map((y, i) => (
                        <tr key={y.id} className={i % 2 ? "bg-[#101010]" : "bg-[#0c0c0c]"}>
                          <td className="px-4 py-2">{y.baslik}</td>
                          <td className="px-4 py-2 text-white/90">{y.yazar || "-"}</td>
                          <td className="px-4 py-2 text-center text-white/80">{y.sayfa ?? "-"}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#333] px-4 py-3 text-sm text-white/60 flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Toplam {sayi?.toplam_yazi ?? yazilar.length} yazı • {sayi?.toplam_sayfa ?? "-"} sayfa
            </div>
          </div>
        </div>

        {/* Sağ panel: Kapak + Butonlar */}
        <div className="md:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-[#333] bg-[#0f0f0f]">
            <img
              src={kapak}
              alt={baslik}
              className="w-full object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderCover(); }}
            />
          </div>

          <div className="mt-3 flex gap-3 justify-center">
            {pdfHref ? (
              <a
                href={`/sayfalar/pdf-oku?id=${sayi!.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ffc451] hover:bg-[#ffb020] px-4 py-2 text-[#1a1a1a] text-sm font-semibold transition"
              >
                <FileText className="w-4 h-4" />
                PDF Önizleme
              </a>
            ) : null}

            <a
              href={`/sayfalar/dergi-detay?id=${sayi?.dergi_id ?? ""}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#333] px-4 py-2 text-sm text-white/90 hover:border-[#ffc451] transition"
            >
              <List className="w-4 h-4 text-[#ffc451]" />
              Dergiye Dön
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
