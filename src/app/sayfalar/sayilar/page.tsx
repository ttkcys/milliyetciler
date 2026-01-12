"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Hash, Search, Library, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

type SayiDTO = {
    id: number;
    dergi_id: number;
    dergi_isim?: string | null;

    sayi_num: string | number | null;
    ay: string | number | null;
    yil: string | number | null;

    image?: string | null;
    pdf?: string | null;
    toplam_sayfa?: number | null;
    toplam_yazi?: number | null;
};

type ListResponse<T> = { page: number; limit: number; total: number; data: T[] };
type DergiDTO = { id: number; isim: string };

/* ---------------- helpers ---------------- */

function fmtSayiLine(s: Pick<SayiDTO, "sayi_num" | "ay" | "yil">) {
    const n = s.sayi_num ?? "—";
    const ay = s.ay ?? "—";
    const yil = s.yil ?? "—";
    return `Sayı ${n} · ${ay}/${yil}`;
}

/** public klasöründeki path'leri düzgün hale getirir ("/pdfImage/...", "/covers/..." vs) */
function normalizePublicPath(p?: string | null) {
    if (!p) return null;
    let s = String(p).trim();

    if (/^https?:\/\//i.test(s)) return s;

    s = s.replace(/^\/+/, "");
    s = s.replace(/^public\/+/, "");

    return "/storage/" + s.split("/").map(encodeURIComponent).join("/");
}

function pdfPathToImage(pdf?: string | null) {
    if (!pdf) return null;

    let s = String(pdf).trim();
    s = s.replace(/^https?:\/\/[^/]+\/+/, "");
    s = s.replace(/^\/+/, "");
    s = s.replace(/^public\/+/, "");
    s = s.replace(/^(pdfs?|PDFS?)\//, "pdfImage/");
    s = s.replace(/(_compressed)?\.(pdf|PDF)$/, ".jpg");

    return "/storage/" + s.split("/").map(encodeURIComponent).join("/");
}

function coverFromPdfImageRaw(dergiIsim: string, no: number) {
    const enc = encodeURIComponent(dergiIsim.trim());
    return `/storage/pdfImage/${enc}/${enc}_${no}.jpg`;
}

function placeholderCover() {
    return "/logo/logo_color.svg"; // bu zaten public’te
}




function extractIssueNo(sayi_num: string | number | null): number {
    const m = String(sayi_num ?? "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 1;
}



/** ✅ backend uyumlu cover bulma */
function issueCover(dergiIsim: string | undefined, sayi: SayiDTO) {
    const fromImage = normalizePublicPath(sayi.image);
    if (fromImage) return fromImage;

    const fromPdf = pdfPathToImage(sayi.pdf);
    if (fromPdf) return fromPdf;

    if (dergiIsim) {
        const no = extractIssueNo(sayi.sayi_num);
        return coverFromPdfImageRaw(dergiIsim, no);
    }

    return placeholderCover();
}


/* ---------------- page ---------------- */

export default function SayilarPage() {
    const [q, setQ] = useState("");
    const [qDebounced, setQDebounced] = useState(q);
    useEffect(() => {
        const t = setTimeout(() => setQDebounced(q), 300);
        return () => clearTimeout(t);
    }, [q]);

    const [dergiId, setDergiId] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [rows, setRows] = useState<SayiDTO[]>([]);
    const [total, setTotal] = useState(0);

    const [dergiler, setDergiler] = useState<DergiDTO[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [qDebounced, dergiId, limit]);

    /* -------- dergiler -------- */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setFiltersLoading(true);
            try {
                const res = await fetch(`/api/dergis?page=1&limit=200`, { cache: "no-store" });
                if (!res.ok) throw new Error();
                const json: ListResponse<any> = await res.json();
                if (!cancelled) setDergiler((json.data || []).map((d: any) => ({ id: d.id, isim: d.isim })));
            } catch {
                if (!cancelled) setDergiler([]);
            } finally {
                if (!cancelled) setFiltersLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    /* -------- sayılar -------- */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (qDebounced.trim()) params.set("search", qDebounced.trim());
                if (dergiId) params.set("dergi_id", dergiId);

                const res = await fetch(`/api/sayis?${params.toString()}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);
                const json: ListResponse<SayiDTO> = await res.json();
                if (!cancelled) {
                    setRows(json.data || []);
                    setTotal(json.total || 0);
                }
            } catch (e: any) {
                if (!cancelled) setErr(e?.message || "Bir hata oluştu");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [page, limit, qDebounced, dergiId]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const subtitle = useMemo(() => (loading ? "Yükleniyor…" : `${total} sayı bulundu`), [loading, total]);

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-16">
                    <nav className="mb-8 text-sm">
                        <a href="/" className="text-white/60 hover:text-[#ffc451]">Anasayfa</a>
                        <span className="mx-2 text-white/40">›</span>
                        <span className="text-[#ffc451] font-medium">Sayılar</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020]">
                            <Hash className="w-8 h-8 text-[#1a1a1a]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Sayılar</h1>
                            <p className="text-white/60 mt-1">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mx-auto max-w-7xl px-6 pt-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <label className="relative w-full md:max-w-md">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Sayı ara… (örn: 1980, ocak, 12)"
                            className="w-full rounded-xl border border-[#333] bg-[#141414] px-10 py-3 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    </label>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Library className="h-4 w-4 text-[#ffc451]" />
                            <select
                                value={dergiId}
                                onChange={(e) => setDergiId(e.target.value)}
                                disabled={filtersLoading}
                                className="rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451]"
                            >
                                <option value="">Tüm Dergiler</option>
                                {dergiler.map((d) => (
                                    <option key={d.id} value={String(d.id)}>{d.isim}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-white/60">
                            <span>Gösterim:</span>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="rounded-lg border border-[#333] bg-[#141414] px-2 py-1"
                            >
                                {[12, 20, 36, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        <button onClick={() => { setQ(""); setDergiId(""); }} className="text-sm text-white/60 hover:text-[#ffc451]">
                            Filtreleri sıfırla
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="mx-auto max-w-7xl px-6 py-12">
                {err ? (
                    <div className="rounded-xl border border-[#333] bg-[#111] p-8 text-center text-red-400">{err}</div>
                ) : loading && rows.length === 0 ? (
                    <div className="rounded-xl border border-[#333] bg-[#111] p-8 text-center text-white/60">Yükleniyor…</div>
                ) : rows.length === 0 ? (
                    <div className="rounded-xl border border-[#333] bg-[#111] p-8 text-center text-white/60">Kayıt bulunamadı</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rows.map((s) => {
                                const dergiIsim = s.dergi_isim ?? dergiler.find((d) => d.id === s.dergi_id)?.isim;
                                const coverUrl = issueCover(dergiIsim, s);
                                const dergiAdi = dergiIsim ?? "—";

                                return (
                                    <div
                                        key={s.id}
                                        className="group rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 hover:border-[#ffc451]"
                                    >
                                        <div className="flex gap-4">
                                            <div className="h-24 w-16 overflow-hidden rounded-lg border border-[#333] bg-[#141414]">
                                                {coverUrl ? (
                                                    <img
                                                        src={coverUrl}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).src = placeholderCover();
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="grid h-full place-items-center text-white/40">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-white/50">Sayı</div>
                                                <div className="text-lg font-bold group-hover:text-[#ffc451]">
                                                    {fmtSayiLine(s)}
                                                </div>
                                                <div className="mt-1 text-sm text-white/60">{dergiAdi}</div>

                                                <div className="mt-3 flex gap-2 text-xs text-white/60">
                                                    {typeof s.toplam_yazi === "number" && <span>{s.toplam_yazi} yazı</span>}
                                                    {typeof s.toplam_sayfa === "number" && <span>{s.toplam_sayfa} sayfa</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={`/sayfalar/sayilar/sayi-detay?id=${s.id}`}
                                            className="mt-5 block rounded-xl border border-[#333] bg-[#141414] px-4 py-2.5 text-center text-sm hover:bg-[#ffc451] hover:text-[#1a1a1a]"
                                        >
                                            Sayıyı Aç
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="mt-10 flex justify-between items-center">
                            <div className="text-sm text-white/60">
                                Sayfa <strong>{page}</strong> / {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="rounded-lg border border-[#333] px-3 py-2 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="rounded-lg border border-[#333] px-3 py-2 disabled:opacity-40"
                                >
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
