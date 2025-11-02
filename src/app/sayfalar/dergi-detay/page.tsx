"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    BookOpen,
    Calendar,
    FileText,
    LibraryBig,
    MapPin,
    Quote,
    User,
    LogIn,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

/* ------------ Tipler ------------ */
type Dergi = {
    id: number;
    isim: string;
    alt_baslik: string | null;
    slogan: string | null;
    aciklama: string | null;
    imtiyaz: string | null;
    yazi_mudur: string | null;
    cikis: string | null;
    bitis: string | null;
    basim_yeri: string | null;
    toplam_sayi: number | null;
    eksikler: string | null;
    telif: string | null;
    created_at: string;
    updated_at: string;
};

type Sayi = {
    id: number;
    dergi_id: number;
    sayi_num: string;
    ay: string | null;
    yil: number | null;
    image: string | null;       // relative path (ör: pdfImage/Altın Işık/Altın Işık_1.jpg)
    pdf: string | null;         // relative path (ör: pdf/Altın Işık/Altın Işık_1.pdf)
    toplam_sayfa: number | null;
    toplam_yazi: number | null;
    created_at: string;
    updated_at: string;
};

type SayiListResponse = { page: number; limit: number; total: number; data: Sayi[] };

const REDIRECT_DELAY_MS = 1500;

/* ------------ Yardımcılar ------------ */
function yearPart(s?: string | null) {
    if (!s) return null;
    const m = s.match(/\d{4}/);
    return m ? m[0] : null;
}
function formatDonem(c?: string | null, b?: string | null) {
    const cy = yearPart(c);
    const by = yearPart(b);
    if (!cy && !by) return "—";
    if (cy && !by) return `${cy} - …`;
    if (!cy && by) return `… - ${by}`;
    return `${cy} - ${by}`;
}
function coverFromPdfImage(isim: string, index = 1) {
    return `/pdfImage/${isim}/${isim}_${index}.jpg`;
}
function placeholderCover() {
    return `/logo/logo_color.svg`;
}
function normalizePublicPath(p?: string | null) {
    if (!p) return null;
    let s = String(p).trim();
    s = s.replace(/^https?:\/\/[^/]+\/+/, ""); // domain'i at
    s = s.replace(/^\/+/, ""); // baştaki /'ları at
    s = s.replace(/^public\/+/, ""); // "public/" ön ekini at
    return "/" + s.split("/").map(encodeURIComponent).join("/");
}

function pdfPathToImage(pdf?: string | null) {
    if (!pdf) return null;
    let s = String(pdf).trim();
    s = s.replace(/^https?:\/\/[^/]+\/+/, ""); // domain'i at
    s = s.replace(/^\/+/, "");                 // baştaki /'ları at
    s = s.replace(/^public\/+/, "");           // "public/" ön ekini at
    // "pdf/" VEYA "pdfs/" → "pdfImage/"
    s = s.replace(/^(pdfs?|PDFS?)\//, "pdfImage/");
    // "..._2.pdf" veya "..._2_compressed.pdf" → "..._2.jpg"
    s = s.replace(/(_compressed)?\.(pdf|PDF)$/, ".jpg");
    return "/" + s.split("/").map(encodeURIComponent).join("/");
}

// Dergi adından ve sayı numarasından kapak üret (URL encode'lu)
function coverFromPdfImageRaw(isim: string, no: number) {
    const name = (isim || "").trim();
    const enc = encodeURIComponent(name);
    const encNo = Number(no) || 1;
    return `/pdfImage/${enc}/${enc}_${encNo}.jpg`;
}

// Segmentleri encode etmek için yardımcı (istenirse tek başına da kullanılır)
function encodePathSegments(p?: string | null) {
    if (!p) return null;
    const trimmed = p.replace(/^https?:\/\/[^/]+\/+/, "").replace(/^\/+/, "");
    return "/" + trimmed.split("/").map(encodeURIComponent).join("/");
}

function issueCover(dergiIsim: string | undefined, sayi: Sayi) {
    // 1) DB'de image varsa ama "public/pdfs" gibi yanlış yerdeyse görmezden gel
    const rawImg = (sayi.image || "").replace(/^https?:\/\/[^/]+\/+/, "");
    const looksWrong = /^\/?public\/pdfs?/i.test(rawImg);

    const fromImage = looksWrong ? null : normalizePublicPath(sayi.image);
    if (fromImage) return fromImage;

    // 2) PDF yolundan (public/pdfs/...pdf) → /pdfImage/...jpg üret
    const fromPdf = pdfPathToImage(sayi.pdf);
    if (fromPdf) return fromPdf;

    // 3) Dergi adı + sayı numarasından üret
    if (dergiIsim) {
        const no = extractIssueNo(sayi.sayi_num);
        return coverFromPdfImageRaw(dergiIsim, no);
    }

    // 4) Fallback
    return placeholderCover();
}


// "Sayı 10", "10. sayı", "10-11", "No: 7" gibi metinlerden ilk sayıyı al
function extractIssueNo(sayi_num: string): number {
    const m = String(sayi_num || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 1;
}


/* ------------ Toast ------------ */
type ToastState = {
    show: boolean;
    title?: string;
    message?: string;
    href?: string;
    remainingMs?: number;
};
function Toast({
    state,
    onClose,
    onAction,
}: {
    state: ToastState;
    onClose?: () => void;
    onAction?: () => void;
}) {
    const total = REDIRECT_DELAY_MS;
    const remain = state.remainingMs ?? 0;
    const pct = Math.max(0, Math.min(100, (remain / total) * 100));
    return (
        <div
            className={`fixed bottom-6 right-6 z-[60] transition-all duration-300 ${state.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                }`}
            aria-live="assertive"
        >
            <div className="w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-[#353535] bg-[#111] shadow-2xl">
                <div className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 rounded-xl bg-[#1c1c1c] p-2">
                        <LogIn className="h-5 w-5 text-[#ffc451]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{state.title}</div>
                        <div className="mt-1 text-sm text-white/80">{state.message}</div>
                        <div className="mt-3 flex items-center gap-2">
                            {onAction ? (
                                <button
                                    onClick={onAction}
                                    className="rounded-lg border border-[#333] px-3 py-1.5 text-xs hover:border-[#ffc451]"
                                >
                                    Hemen Giriş Yap
                                </button>
                            ) : null}
                            {state.href ? (
                                <div className="text-xs text-white/60">
                                    {Math.ceil(remain / 1000)} sn içinde yönlendirileceksiniz
                                </div>
                            ) : (
                                <div className="text-xs text-white/60">Kapanıyor…</div>
                            )}
                        </div>
                    </div>
                    {onClose ? (
                        <button
                            onClick={onClose}
                            aria-label="Kapat"
                            className="ml-2 rounded-md px-2 py-1 text-white/60 hover:text-white"
                        >
                            ×
                        </button>
                    ) : null}
                </div>
                {state.href ? (
                    <div className="h-1 w-full bg-white/10">
                        <div className="h-full bg-[#ffc451]" style={{ width: `${pct}%` }} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/* ------------ Sayfa ------------ */
export default function DergiDetayPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const idParam = sp.get("id");
    const dergiId = idParam ? Number(idParam) : NaN;

    const [row, setRow] = useState<Dergi | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    // SAYILAR STATE
    const [sayilar, setSayilar] = useState<Sayi[]>([]);
    const [loadingSayilar, setLoadingSayilar] = useState(false);
    const [errSayilar, setErrSayilar] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [total, setTotal] = useState(0);

    const [toast, setToast] = useState<ToastState>({ show: false });
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    // toast auto-redirect
    useEffect(() => {
        if (!toast.show) return;
        if (toast.href) {
            setToast((s) => ({ ...s, remainingMs: REDIRECT_DELAY_MS }));
            const startedAt = Date.now();
            intervalRef.current = window.setInterval(() => {
                const elapsed = Date.now() - startedAt;
                const remain = Math.max(0, REDIRECT_DELAY_MS - elapsed);
                setToast((s) => ({ ...s, remainingMs: remain }));
            }, 100);
            const target = toast.href;
            timeoutRef.current = window.setTimeout(() => {
                window.location.assign(target);
            }, REDIRECT_DELAY_MS);
        } else {
            timeoutRef.current = window.setTimeout(() => setToast({ show: false }), 1500);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            intervalRef.current = null;
            timeoutRef.current = null;
        };
    }, [toast.show, toast.href]);

    const showLoginRedirect = (id: number) => {
        const next = encodeURIComponent(`/dergi?id=${id}`);
        const href = `/giris-yap?next=${next}` as any;
        setToast({
            show: true,
            title: "Oturum gerekli",
            message: "Dergileri listenize eklemek için giriş yapmalısınız. Birazdan yönlendirileceksiniz…",
            href,
            remainingMs: REDIRECT_DELAY_MS,
        });
    };

    // Dergi verisi
    useEffect(() => {
        if (!dergiId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const res = await fetch(`/api/dergis/${dergiId}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`Dergi bulunamadı (${res.status})`);
                const json = (await res.json()) as Dergi;
                if (!cancelled) setRow(json);
            } catch (e: any) {
                if (!cancelled) setErr(e?.message || "Dergi yüklenemedi");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dergiId]);

    const donem = useMemo(() => formatDonem(row?.cikis, row?.bitis), [row]);

    // SAYILARI ÇEK
    useEffect(() => {
        if (!dergiId) return;
        let cancel = false;
        (async () => {
            setLoadingSayilar(true);
            setErrSayilar(null);
            try {
                const params = new URLSearchParams();
                params.set("dergi_id", String(dergiId));
                params.set("page", String(page));
                params.set("limit", String(limit));
                const res = await fetch(`/api/sayis?${params.toString()}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`Sayılar alınamadı (${res.status})`);
                const json: SayiListResponse = await res.json();
                if (!cancel) {
                    setSayilar(json.data || []);
                    setTotal(json.total || 0);
                }
            } catch (e: any) {
                if (!cancel) setErrSayilar(e?.message || "Sayılar yüklenemedi");
            } finally {
                if (!cancel) setLoadingSayilar(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [dergiId, page, limit]);

    // Listeme ekle (dergi)
    const handleAdd = async () => {
        if (!dergiId) return;
        try {
            setAdding(true);
            const meRes = await fetch("/api/me", { cache: "no-store", credentials: "include" });
            if (meRes.status === 401 || meRes.status === 403) {
                showLoginRedirect(dergiId);
                return;
            }
            if (!meRes.ok) {
                setToast({ show: true, title: "Oturum doğrulanamadı", message: "Lütfen tekrar deneyin." });
                return;
            }
            const resp = await fetch("/api/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ kind: "dergi", id: dergiId }),
            });
            if (resp.status === 401 || resp.status === 403) {
                showLoginRedirect(dergiId);
                return;
            }
            if (resp.status === 409) {
                setAdded(true);
                setToast({ show: true, title: "Zaten Listenizde", message: "Bu dergi daha önce eklenmiş." });
                return;
            }
            if (!resp.ok) {
                setToast({ show: true, title: "Hata", message: `Eklenemedi (${resp.status})` });
                return;
            }
            setAdded(true);
            setToast({ show: true, title: "Eklendi", message: "Dergi listenize eklendi." });
        } finally {
            setAdding(false);
        }
    };

    if (!idParam || Number.isNaN(dergiId)) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-white/70">
                    Geçersiz dergi bağlantısı. Örn: <span className="text-[#ffc451]">/dergi?id=1527</span>
                </p>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            <Toast
                state={toast}
                onClose={() => setToast({ show: false })}
                onAction={toast.href ? () => router.push(toast.href! as any) : undefined}
            />

            {/* Üst Başlık */}
            <div className="border-b border-[#333] py-4">
                <div className="mx-auto max-w-6xl px-4 text-sm">
                    <a href="/" className="text-white/60 hover:text-[#ffc451]">Anasayfa</a>
                    <span className="text-white/40 mx-1.5">›</span>
                    <a href="/sayfalar/dergiler" className="text-white/60 hover:text-[#ffc451]">Dergiler</a>
                    <span className="text-white/40 mx-1.5">›</span>
                    <span className="text-[#ffc451]">{row?.isim || "Dergi"}</span>
                </div>
            </div>

            {/* İçerik */}
            <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Kapak ve Ekle */}
                <div className="flex-shrink-0 w-full md:w-[320px]">
                    <div className="overflow-hidden rounded-xl border border-[#333] bg-[#0f0f0f] aspect-[3/4] flex items-center justify-center">
                        {loading ? (
                            <div className="text-white/60">Yükleniyor…</div>
                        ) : err ? (
                            <div className="p-4 text-red-400">{err}</div>
                        ) : row ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={coverFromPdfImage(row.isim)}
                                alt={row.isim}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = placeholderCover();
                                }}
                            />
                        ) : null}
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={adding || added}
                        className="cursor-pointer mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-sm text-white/80 hover:border-[#ffc451] disabled:opacity-50"
                    >

                        {adding ? "Ekleniyor…" : added ? "Listeye Eklendi" : "Listeme Ekle"}
                    </button>
                </div>

                {/* Bilgiler */}
                <div className="flex-1 space-y-5">
                    <h1 className="text-3xl font-bold">{row?.isim || "—"}</h1>
                    {row?.alt_baslik ? <div className="text-white/70">{row.alt_baslik}</div> : null}
                    <div className="flex flex-wrap items-center gap-4 text-white/80">
                        <span className="inline-flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#ffc451]" />
                            {donem}
                        </span>
                        {row?.basim_yeri ? (
                            <span className="inline-flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#ffc451]" />
                                {row.basim_yeri}
                            </span>
                        ) : null}
                        {row?.toplam_sayi != null ? (
                            <span className="inline-flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#ffc451]" />
                                {row.toplam_sayi} sayı
                            </span>
                        ) : null}
                        {row?.telif ? (
                            <span className="inline-flex items-center gap-2">
                                <User className="w-4 h-4 text-[#ffc451]" />
                                Telif: {row.telif}
                            </span>
                        ) : null}
                    </div>

                    {row?.slogan ? (
                        <div className="rounded-xl border border-[#333] bg-[#0f0f0f] p-4 flex items-start gap-3">
                            <Quote className="w-4 h-4 text-[#ffc451] mt-1" />
                            <div className="italic text-white/90">{row.slogan}</div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-[#333] bg-[#0f0f0f] p-4">
                            <div className="text-sm text-white/60 mb-1">İmtiyaz Sahibi</div>
                            <div className="text-white/90">{row?.imtiyaz || "—"}</div>
                        </div>
                        <div className="rounded-xl border border-[#333] bg-[#0f0f0f] p-4">
                            <div className="text-sm text-white/60 mb-1">Yazı İşleri Müdürü</div>
                            <div className="text-white/90">{row?.yazi_mudur || "—"}</div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#333] bg-[#0f0f0f] p-5 leading-7 text-white/85 whitespace-pre-line">
                        {loading ? "Açıklama yükleniyor…" : row?.aciklama || "Açıklama eklenmemiş."}
                    </div>

                    {row?.eksikler ? (
                        <div className="rounded-xl border border-[#333] bg-[#0f0f0f] p-4">
                            <div className="text-sm text-white/60 mb-1">Eksikler</div>
                            <div className="text-white/85">{row.eksikler}</div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* === SAYILAR === */}
            <div className="mx-auto max-w-6xl px-4 pb-12">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#ffc451]" />
                    Sayılar ({total})
                </h2>

                {errSayilar ? (
                    <div className="text-red-400">{errSayilar}</div>
                ) : loadingSayilar && sayilar.length === 0 ? (
                    <div className="text-white/70">Yükleniyor…</div>
                ) : sayilar.length === 0 ? (
                    <div className="text-white/60">Bu dergiye ait kayıtlı sayı bulunamadı.</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {sayilar.map((s) => {
                                const img = issueCover(row?.isim, s);
                                const pdf = normalizePublicPath(s.pdf) || pdfPathToImage(s.pdf) || undefined;

                                return (
                                    <div
                                        key={s.id}
                                        className="group overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] hover:border-[#ffc451] transition-all"
                                    >
                                        <a href={`/sayi?id=${s.id}`} className="block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={img}
                                                alt={`${row?.isim} ${s.sayi_num}`}
                                                className="aspect-[3/4] w-full object-cover bg-[#141414] transition-transform duration-500 group-hover:scale-[1.02]"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = placeholderCover();
                                                }}
                                            />
                                        </a>
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold line-clamp-1">{s.sayi_num}</div>
                                                {s.yil ? (
                                                    <div className="text-xs text-white/60">{s.ay ? `${s.ay} ` : ""}{s.yil}</div>
                                                ) : null}
                                            </div>
                                            <div className="text-xs text-white/60">
                                                {s.toplam_yazi != null && <span>{s.toplam_yazi} yazı</span>}
                                                {s.toplam_yazi != null && s.toplam_sayfa != null && <span> • </span>}
                                                {s.toplam_sayfa != null && <span>{s.toplam_sayfa} sayfa</span>}
                                            </div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <a
                                                    href={`/sayfalar/dergi-sayi?id=${s.id}`}
                                                    className="flex-1 text-center rounded-lg border border-[#333] px-3 py-2 text-sm hover:border-[#ffc451]"
                                                >
                                                    İncele
                                                </a>

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sayfalama */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-white/70">
                                Toplam {total} sayı — Sayfa {page}/{totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:border-[#ffc451]"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Geri
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#141414] px-3 py-2 text-sm text-white/80 disabled:opacity-40 hover:border-[#ffc451]"
                                >
                                    İleri
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="rounded-lg border border-[#333] bg-[#141414] px-2 py-1 text-sm"
                                >
                                    {[8, 12, 16, 20, 28, 36].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}