"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Filter, ChevronLeft, ChevronRight, FileText, User, Library } from "lucide-react";

type YaziDTO = {
    id: number;
    baslik: string;
    alt_baslik: string | null;
    sayi_id: number;
    dergi_id: number;
    dergi_isim: string | null;
    sayi_num: string | number | null;
    ay: string | number | null;
    yil: string | number | null;
    sayfa: number | null;
    yazar_id: number;
    yazar_isim: string | null;
    created_at: string;
    updated_at: string;
};

type ListResponse<T> = {
    page: number;
    limit: number;
    total: number;
    data: T[];
};

type DergiDTO = { id: number; isim: string };
type YazarDTO = { id: number; isim: string };
type SayiDTO = { id: number; sayi_num?: any; ay?: any; yil?: any; dergi_id?: number; dergi_isim?: string | null };

type SortKey = "recent" | "page-asc" | "page-desc";

const BRAND = "#ffc451";

function fmtSayi(s: Pick<YaziDTO, "sayi_num" | "ay" | "yil">) {
    const n = s.sayi_num ?? "—";
    const ay = s.ay ?? "—";
    const yil = s.yil ?? "—";
    return `Sayı ${n} · ${ay}/${yil}`;
}

export default function YazilarPage() {
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortKey>("recent");

    const [dergiId, setDergiId] = useState<string>(""); // string for select
    const [sayiId, setSayiId] = useState<string>("");
    const [yazarId, setYazarId] = useState<string>("");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [rows, setRows] = useState<YaziDTO[]>([]);
    const [total, setTotal] = useState(0);

    // filtre listeleri
    const [dergiler, setDergiler] = useState<DergiDTO[]>([]);
    const [yazarlar, setYazarlar] = useState<YazarDTO[]>([]);
    const [sayilar, setSayilar] = useState<SayiDTO[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(false);

    // debounce
    const [qDebounced, setQDebounced] = useState(q);
    useEffect(() => {
        const t = setTimeout(() => setQDebounced(q), 300);
        return () => clearTimeout(t);
    }, [q]);

    // filtre verilerini çek
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setFiltersLoading(true);
            try {
                const [dRes, yRes] = await Promise.all([
                    fetch(`/api/dergis?page=1&limit=200`, { cache: "no-store" }),
                    fetch(`/api/yazars?page=1&limit=200`, { cache: "no-store" }),
                ]);

                if (!dRes.ok) throw new Error(`Dergiler alınamadı (${dRes.status})`);
                if (!yRes.ok) throw new Error(`Yazarlar alınamadı (${yRes.status})`);

                const dJson: ListResponse<any> = await dRes.json();
                const yJson: ListResponse<any> = await yRes.json();

                if (cancelled) return;
                setDergiler((dJson.data || []).map((x: any) => ({ id: x.id, isim: x.isim })));
                setYazarlar((yJson.data || []).map((x: any) => ({ id: x.id, isim: x.isim })));
            } catch (e: any) {
                if (!cancelled) {
                    // filtre hatası sayfayı bozmasın
                    console.error(e?.message || e);
                }
            } finally {
                if (!cancelled) setFiltersLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // dergi seçilince sayıları çek (opsiyonel)
    useEffect(() => {
        let cancelled = false;

        // dergi seçilmediyse sayı dropdown'ını boş bırak
        if (!dergiId) {
            setSayilar([]);
            setSayiId("");
            return;
        }

        (async () => {
            try {
                // backend'de /api/sayis varsa:
                const res = await fetch(`/api/sayis?page=1&limit=200&dergi_id=${encodeURIComponent(dergiId)}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`Sayılar alınamadı (${res.status})`);
                const json: ListResponse<any> = await res.json();
                if (cancelled) return;

                setSayilar(
                    (json.data || []).map((s: any) => ({
                        id: s.id,
                        sayi_num: s.sayi_num ?? s.sayiNo ?? s.no,
                        ay: s.ay,
                        yil: s.yil,
                        dergi_id: s.dergi_id,
                        dergi_isim: s.dergi_isim ?? s.dergi_isim,
                    }))
                );
            } catch (e: any) {
                if (!cancelled) {
                    setSayilar([]);
                    setSayiId("");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [dergiId]);

    // yazıları çek
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                params.set("sort", sort);
                if (qDebounced.trim()) params.set("search", qDebounced.trim());
                if (yazarId) params.set("yazar_id", yazarId);
                if (sayiId) params.set("sayi_id", sayiId);
                if (dergiId) params.set("dergi_id", dergiId);

                const res = await fetch(`/api/yazis?${params.toString()}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);

                const json: ListResponse<YaziDTO> = await res.json();
                if (cancelled) return;

                setRows(json.data || []);
                setTotal(json.total || 0);
            } catch (e: any) {
                if (!cancelled) setErr(e?.message || "Bir hata oluştu");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [page, limit, sort, qDebounced, yazarId, sayiId, dergiId]);

    // filtre değişince sayfayı 1 yap
    useEffect(() => {
        setPage(1);
    }, [qDebounced, sort, yazarId, sayiId, dergiId, limit]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const activeFiltersCount = useMemo(() => {
        return [dergiId, sayiId, yazarId].filter(Boolean).length;
    }, [dergiId, sayiId, yazarId]);

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Hero */}
            <div className="relative overflow-hidden bg-black border-b border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
                    <nav className="mb-8 flex items-center gap-2 text-sm">
                        <a href="/" className="text-white/60 hover:text-[#ffc451] transition-colors">Anasayfa</a>
                        <span className="text-white/40">›</span>
                        <span className="text-[#ffc451] font-medium">Yazılar</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                            <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Yazılar</h1>
                            <p className="text-white/60 text-lg mt-1">Dergi sayılarındaki yazılara hızlı erişim.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mx-auto max-w-7xl px-6 pt-8">
                <div className="flex flex-col gap-3">
                    {/* Search */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <label className="relative w-full md:max-w-md">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Başlıkta ara…"
                                className="w-full rounded-xl border border-[#333] bg-[#141414] px-10 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                        </label>

                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-sm text-white/60">
                                {loading ? "Yükleniyor…" : `${total} yazı bulundu`}
                            </span>

                            <div className="h-4 w-px bg-[#333]" />

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/60">Sırala:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortKey)}
                                    className="rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                                >
                                    <option value="recent">En Güncel</option>
                                    <option value="page-asc">Sayfa (Artan)</option>
                                    <option value="page-desc">Sayfa (Azalan)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <Filter className="h-4 w-4" />
                                <span>{activeFiltersCount} filtre</span>
                            </div>
                        </div>
                    </div>

                    {/* Dropdown filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-[#333] bg-[#111] p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <Library className="h-4 w-4 text-[#ffc451]" />
                                <span>Dergi</span>
                            </div>
                            <select
                                value={dergiId}
                                onChange={(e) => setDergiId(e.target.value)}
                                className="w-full rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                                disabled={filtersLoading}
                            >
                                <option value="">Tümü</option>
                                {dergiler.map((d) => (
                                    <option key={d.id} value={String(d.id)}>{d.isim}</option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-2xl border border-[#333] bg-[#111] p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <FileText className="h-4 w-4 text-[#ffc451]" />
                                <span>Sayı</span>
                            </div>
                            <select
                                value={sayiId}
                                onChange={(e) => setSayiId(e.target.value)}
                                className="w-full rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                                disabled={!dergiId || sayilar.length === 0}
                                title={!dergiId ? "Önce dergi seçin" : ""}
                            >
                                <option value="">{!dergiId ? "Önce dergi seç" : "Tümü"}</option>
                                {sayilar.map((s) => (
                                    <option key={s.id} value={String(s.id)}>
                                        {`Sayı ${s.sayi_num ?? "—"} · ${s.ay ?? "—"}/${s.yil ?? "—"}`}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-2 text-xs text-white/40">
                                {dergiId ? "İsteğe bağlı: dergiye göre sayıları listeler." : "Sayı filtresi için dergi seç."}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#333] bg-[#111] p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
                                <User className="h-4 w-4 text-[#ffc451]" />
                                <span>Yazar</span>
                            </div>
                            <select
                                value={yazarId}
                                onChange={(e) => setYazarId(e.target.value)}
                                className="w-full rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                                disabled={filtersLoading}
                            >
                                <option value="">Tümü</option>
                                {yazarlar.map((a) => (
                                    <option key={a.id} value={String(a.id)}>{a.isim}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick clear */}
                    <div className="flex items-center justify-between mt-1">
                        <button
                            onClick={() => {
                                setDergiId("");
                                setSayiId("");
                                setYazarId("");
                                setQ("");
                                setSort("recent");
                            }}
                            className="text-sm text-white/60 hover:text-[#ffc451] transition-colors"
                        >
                            Filtreleri sıfırla
                        </button>

                        <div className="flex items-center gap-2 text-sm text-white/60">
                            <span>Gösterim:</span>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="rounded-lg border border-[#333] bg-[#141414] px-2 py-1 text-sm outline-none focus:border-[#ffc451] focus:ring-2 focus:ring-[#ffc451]/20 cursor-pointer"
                            >
                                {[12, 20, 28, 36, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
                {err ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-8 text-center">
                        <p className="text-red-400">Hata: {err}</p>
                    </div>
                ) : loading && rows.length === 0 ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-8 text-center text-white/60">
                        Yükleniyor…
                    </div>
                ) : rows.length === 0 ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-8 text-center text-white/60">
                        Eşleşen yazı bulunamadı
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rows.map((y) => (
                                <div
                                    key={y.id}
                                    className="group rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 transition-all duration-300 hover:border-[#ffc451] hover:shadow-2xl hover:shadow-[#ffc451]/10"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#ffc451] transition-colors line-clamp-2">
                                            {y.baslik}
                                        </h3>
                                        {typeof y.sayfa === "number" ? (
                                            <div className="shrink-0 rounded-full bg-[#ffc451]/90 px-3 py-1 text-xs font-bold text-[#1a1a1a]">
                                                s. {y.sayfa}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Library className="h-4 w-4 text-[#ffc451]" />
                                            <span className="line-clamp-1">{y.dergi_isim ?? "—"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-white/60">
                                            <FileText className="h-4 w-4 text-[#ffc451]" />
                                            <span>{fmtSayi(y)}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-white/60">
                                            <User className="h-4 w-4 text-[#ffc451]" />
                                            <span className="line-clamp-1">{y.yazar_isim ?? "—"}</span>
                                        </div>
                                    </div>

                                    {/* Detay linki (istersen yazı detay sayfası yaparsın) */}
                                    <a
                                        href={`/sayfalar/yazilar/yazi-detay?id=${y.id}`}
                                        className="mt-5 block w-full rounded-xl bg-[#141414] px-4 py-2.5 text-center text-sm font-medium text-white/90 border border-[#333] transition-all duration-300 hover:bg-[#ffc451] hover:text-[#1a1a1a] hover:border-[#ffc451]"
                                    >
                                        İncele
                                    </a>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-10 flex items-center justify-between">
                            <div className="text-sm text-white/60">
                                Sayfa <strong className="text-white">{page}</strong> / {totalPages}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:border-[#ffc451] hover:text-white"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Geri
                                </button>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:border-[#ffc451] hover:text-white"
                                >
                                    İleri <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
