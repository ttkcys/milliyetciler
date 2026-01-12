"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, FileText, Library, Loader2, User } from "lucide-react";

type YaziDetayDTO = {
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
    created_at: string;
    updated_at: string;
};

function fmtSayi(s: Pick<YaziDetayDTO, "sayi_num" | "ay" | "yil">) {
    const n = s.sayi_num ?? "—";
    const ay = s.ay ?? "—";
    const yil = s.yil ?? "—";
    return `Sayı ${n} · ${ay}/${yil}`;
}

export default function YaziDetayClient({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [data, setData] = useState<YaziDetayDTO | null>(null);

    const numericId = useMemo(() => {
        const n = Number(id);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!numericId) {
                setErr("Geçersiz yazı ID");
                setData(null);
                return;
            }

            setLoading(true);
            setErr(null);

            try {
                const res = await fetch(`/api/yazis/${numericId}`, {
                    cache: "no-store",
                    credentials: "include",
                });

                if (res.status === 404) throw new Error("Yazı bulunamadı");
                if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);

                const json: YaziDetayDTO = await res.json();
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

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Header */}
            <div className="relative overflow-hidden bg-black border-b border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_55%)]" />
                <div className="relative mx-auto max-w-5xl px-6 py-10 md:py-14">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/15">
                                <BookOpen className="h-6 w-6 text-[#1a1a1a]" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-sm text-white/60">Yazı Detay</div>
                                <div className="text-lg font-bold text-white">
                                    {loading ? "Yükleniyor…" : data?.baslik ?? "—"}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 hover:border-[#ffc451] hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Geri
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-5xl px-6 py-8 md:py-12">
                {err ? (
                    <div className="rounded-2xl border border-[#333] bg-[#111] p-8 text-center">
                        <p className="text-red-400">{err}</p>
                        <button
                            onClick={() => window.history.back()}
                            className="mt-5 rounded-xl bg-[#ffc451] px-4 py-2 text-sm font-bold text-[#1a1a1a]"
                        >
                            Geri dön
                        </button>
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
                        {/* Title card */}
                        <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 md:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    {data.baslik}
                                </h1>

                                {typeof data.sayfa === "number" ? (
                                    <div className="shrink-0 rounded-full bg-[#ffc451]/90 px-3 py-1 text-xs font-bold text-[#1a1a1a]">
                                        s. {data.sayfa}
                                    </div>
                                ) : null}
                            </div>

                            {data.alt_baslik ? (
                                <p className="mt-2 text-white/70">{data.alt_baslik}</p>
                            ) : null}

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-xl border border-[#333] bg-[#111] p-4">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Library className="h-4 w-4 text-[#ffc451]" />
                                        <span className="font-medium">Dergi</span>
                                    </div>
                                    <div className="mt-1 text-white/90">{data.dergi_isim ?? "—"}</div>
                                </div>

                                <div className="rounded-xl border border-[#333] bg-[#111] p-4">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <FileText className="h-4 w-4 text-[#ffc451]" />
                                        <span className="font-medium">Sayı</span>
                                    </div>
                                    <div className="mt-1 text-white/90">{fmtSayi(data)}</div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 text-sm text-white/50">
                                <div>Oluşturma: {new Date(data.created_at).toLocaleString("tr-TR")}</div>
                                <div className="hidden md:block">•</div>
                                <div>Güncelleme: {new Date(data.updated_at).toLocaleString("tr-TR")}</div>
                            </div>
                        </div>

                        {/* Actions (opsiyonel alanlar) */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a
                                href={`/sayfalar/sayilar/sayi-detay?id=${data.sayi_id}`}
                                className="rounded-2xl border border-[#333] bg-[#111] p-5 hover:border-[#ffc451] transition-colors"
                            >
                                <div className="text-sm text-white/60">Bu yazının sayısını aç</div>
                                <div className="mt-1 font-bold text-white">
                                    Sayı Detay
                                </div>
                            </a>

                            <a
                                href={`/sayfalar/dergi-detay?id=${data.dergi_id}`}
                                className="rounded-2xl border border-[#333] bg-[#111] p-5 hover:border-[#ffc451] transition-colors"
                            >
                                <div className="text-sm text-white/60">Bu yazının dergisini aç</div>
                                <div className="mt-1 font-bold text-white">
                                    Dergi Detay
                                </div>
                            </a>
                        </div>


                    </>
                )}
            </div>
        </div>
    );
}
