"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Hash,
    Loader2,
    FileText,
    Image as ImageIcon,
    ExternalLink,
    BookOpen,
    User,
} from "lucide-react";

const BRAND = "#ffc451";

type SayiDetayDTO = {
    id: number;
    dergi_id: number;
    sayi_num: string | number | null;
    ay: string | number | null;
    yil: string | number | null;

    image: string | null;
    pdf: string | null;
    toplam_sayfa: number | null;
    toplam_yazi: number | null;

    created_at: string;
    updated_at: string;
};

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

type ListResponse<T> = { page: number; limit: number; total: number; data: T[] };

function fmtSayiLine(s: Pick<SayiDetayDTO, "sayi_num" | "ay" | "yil">) {
    const n = s.sayi_num ?? "—";
    const ay = s.ay ?? "—";
    const yil = s.yil ?? "—";
    return `Sayı ${n} · ${ay}/${yil}`;
}

function toPublicUrl(p?: string | null) {
    if (!p) return null;
    if (p.startsWith("/storage/")) return p;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `/storage/${p.replace(/^\/+/, "")}`;
}

export default function SayiDetayClient({ id }: { id: string }) {
    const numericId = useMemo(() => {
        const n = Number(id);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [id]);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [data, setData] = useState<SayiDetayDTO | null>(null);

    const [yazilarLoading, setYazilarLoading] = useState(false);
    const [yazilar, setYazilar] = useState<YaziDTO[]>([]);
    const [yazilarTotal, setYazilarTotal] = useState(0);

    // sayıyı çek
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!numericId) {
                setErr("Geçersiz sayı ID");
                setData(null);
                return;
            }

            setLoading(true);
            setErr(null);

            try {
                const res = await fetch(`/api/sayis/${numericId}`, {
                    cache: "no-store",
                    credentials: "include",
                });

                if (res.status === 404) throw new Error("Sayı bulunamadı");
                if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);

                const json: SayiDetayDTO = await res.json();
                if (cancelled) return;

                setData(json);
            } catch (e: any) {
                if (!cancelled) setErr(e?.message || "Bir hata oluştu");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [numericId]);

    // bu sayının yazılarını çek (backend destekliyor: /api/yazis?sayi_id=)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!numericId) return;

            setYazilarLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("page", "1");
                params.set("limit", "200");
                params.set("sort", "page-asc");
                params.set("sayi_id", String(numericId));

                const res = await fetch(`/api/yazis?${params.toString()}`, {
                    cache: "no-store",
                    credentials: "include",
                });

                if (!res.ok) throw new Error(`Yazılar alınamadı (${res.status})`);
                const json: ListResponse<YaziDTO> = await res.json();

                if (cancelled) return;
                setYazilar(json.data || []);
                setYazilarTotal(json.total || 0);
            } catch {
                if (!cancelled) {
                    setYazilar([]);
                    setYazilarTotal(0);
                }
            } finally {
                if (!cancelled) setYazilarLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [numericId]);

    const coverUrl = toPublicUrl(data?.image);
    const pdfUrl = toPublicUrl(data?.pdf);

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Header */}
            <div className="relative overflow-hidden bg-black border-b border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_55%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/15">
                                <Hash className="h-6 w-6 text-[#1a1a1a]" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-sm text-white/60">Sayı Detay</div>
                                <div className="text-lg font-bold text-white">
                                    {loading ? "Yükleniyor…" : data ? fmtSayiLine(data) : "—"}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 hover:border-[#ffc451] hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Geri
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
                {err ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-8 text-center">
                        <p className="text-red-400">{err}</p>
                    </div>
                ) : loading && !data ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-10 text-center text-white/60">
                        <div className="inline-flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Yükleniyor…
                        </div>
                    </div>
                ) : !data ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-8 text-center text-white/60">
                        Veri yok
                    </div>
                ) : (
                    <>
                        {/* Top card */}
                        <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Cover */}
                                <div className="w-full md:w-56">
                                    <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-[#333] bg-[#141414]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {coverUrl ? (
                                            <img src={coverUrl} alt="Kapak" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full grid place-items-center text-white/40">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon className="h-6 w-6" />
                                                    <div className="text-sm">Kapak yok</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {pdfUrl ? (
                                        <a
                                            href={pdfUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc451] px-4 py-2.5 text-sm font-bold text-[#1a1a1a]"
                                        >
                                            PDF'i Aç 
                                        </a>
                                    ) : (
                                        <div className="mt-4 w-full rounded-xl border border-[#333] bg-[#111] px-4 py-2.5 text-center text-sm text-white/60">
                                            PDF yok
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        {fmtSayiLine(data)}
                                    </h1>

                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-[#333] bg-[#111] p-4">
                                            <div className="text-sm text-white/60">Toplam Yazı</div>
                                            <div className="mt-1 text-xl font-bold text-white">
                                                {typeof data.toplam_yazi === "number" ? data.toplam_yazi : "—"}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[#333] bg-[#111] p-4">
                                            <div className="text-sm text-white/60">Toplam Sayfa</div>
                                            <div className="mt-1 text-xl font-bold text-white">
                                                {typeof data.toplam_sayfa === "number" ? data.toplam_sayfa : "—"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-white/50">
                                        <div>Oluşturma: {new Date(data.created_at).toLocaleString("tr-TR")}</div>
                                        <div className="hidden sm:block">•</div>
                                        <div>Güncelleme: {new Date(data.updated_at).toLocaleString("tr-TR")}</div>
                                    </div>

                                    <a
                                        href={`/sayfalar/dergiler/dergi-detay?id=${data.dergi_id}`}
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-4 py-2 text-sm text-white/80 hover:border-[#ffc451] hover:text-white transition-colors"
                                    >
                                        <FileText className="h-4 w-4 text-[#ffc451]" />
                                        Dergiyi Aç 
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Yazılar */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-white">Bu Sayıdaki Yazılar</h2>
                      
                            </div>

                            {yazilarLoading ? (
                                <div className="mt-4 rounded-2xl border border-[#333] bg-[#111] p-8 text-center text-white/60">
                                    <Loader2 className="inline-block h-5 w-5 animate-spin mr-2" />
                                    Yazılar yükleniyor…
                                </div>
                            ) : yazilar.length === 0 ? (
                                <div className="mt-4 rounded-2xl border border-[#333] bg-[#111] p-8 text-center text-white/60">
                                    Bu sayıya ait yazı bulunamadı
                                </div>
                            ) : (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {yazilar.map((y) => (
                                        <a
                                            key={y.id}
                                            href={`/sayfalar/yazilar/yazi-detay?id=${y.id}`}
                                            className="group rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 hover:border-[#ffc451] hover:shadow-2xl hover:shadow-[#ffc451]/10 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-xs text-white/50 uppercase tracking-wide">Yazı</div>
                                                    <div className="mt-1 font-bold text-white group-hover:text-[#ffc451] transition-colors line-clamp-2">
                                                        {y.baslik}
                                                    </div>
                                                </div>
                                                {typeof y.sayfa === "number" ? (
                                                    <div className="shrink-0 rounded-full bg-[#ffc451]/90 px-3 py-1 text-xs font-bold text-[#1a1a1a]">
                                                        s. {y.sayfa}
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/60">
                                                <span className="inline-flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-[#ffc451]" />
                                                    {fmtSayiLine(y)}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                    <User className="h-4 w-4 text-[#ffc451]" />
                                                    {y.yazar_isim ?? "—"}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
