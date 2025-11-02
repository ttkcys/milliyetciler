"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User2, BookOpen, LibraryBig, Trash2, Loader2 } from "lucide-react";

/* ------- Tipler ------- */
type Me = {
    id: number;
    name: string;
    email: string;
    lYazar: string | null; // JSON string: number[]
    lDergi: string | null; // JSON string: number[]
};

type Author = {
    id: number;
    isim: string;
    image: string | null;
    biyografi?: string | null;
};

type Magazine = {
    id: number;
    isim: string;
    image?: string | null;
    aciklama?: string | null;
};

/* ------- Yardımcılar ------- */
function parseIdList(s: string | null | undefined): number[] {
    try {
        const arr = JSON.parse(s || "[]");
        return Array.isArray(arr) ? arr.map((x: any) => Number(x)).filter(Number.isFinite) : [];
    } catch {
        return [];
    }
}

function normImg(src?: string | null, folder = "") {
    if (!src) return "/placeholders/card.png";
    if (/^https?:\/\//i.test(src)) return src;
    let clean = src.trim().replace(/^\/+/, "");
    if (folder && !clean.startsWith(folder + "/")) clean = `${folder}/${clean}`;
    return `/${clean}`;
}

/* ===================================================== */

export default function ListsPage() {
    const router = useRouter();

    const [me, setMe] = useState<Me | null>(null);
    const [loadingMe, setLoadingMe] = useState(true);
    const [tab, setTab] = useState<"yazar" | "dergi">("yazar");

    const [authors, setAuthors] = useState<Author[]>([]);
    const [mags, setMags] = useState<Magazine[]>([]);
    const [loadingAuthors, setLoadingAuthors] = useState(false);
    const [loadingMags, setLoadingMags] = useState(false);

    // me’yi çek
    useEffect(() => {
        (async () => {
            try {
                setLoadingMe(true);
                const res = await fetch("/api/me", { cache: "no-store", credentials: "include" });
                if (res.status === 401) {
                    const nextPath = "/giris-yap?next=/listelerim" as const;
                    // @ts-expect-error: Type mismatch for dynamic route
                    router.replace(nextPath);
                    return;
                }
                if (!res.ok) throw new Error("Kullanıcı getirilemedi");
                const u = (await res.json()) as Me;
                setMe(u);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingMe(false);
            }
        })();
    }, [router]);

    const authorIds = useMemo(() => parseIdList(me?.lYazar), [me]);
    const magIds = useMemo(() => parseIdList(me?.lDergi), [me]);

    // Yazar detaylarını çek
    useEffect(() => {
        if (!authorIds.length) {
            setAuthors([]);
            return;
        }
        let cancel = false;
        (async () => {
            try {
                setLoadingAuthors(true);
                const rows = await Promise.all(
                    authorIds.map(async (id) => {
                        const r = await fetch(`/api/yazars/${id}`, { cache: "no-store" });
                        if (!r.ok) return null;
                        return (await r.json()) as Author;
                    })
                );
                if (!cancel) setAuthors(rows.filter(Boolean) as Author[]);
            } finally {
                if (!cancel) setLoadingAuthors(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [authorIds]);

    // Dergi detaylarını çek
    useEffect(() => {
        if (!magIds.length) {
            setMags([]);
            return;
        }
        let cancel = false;
        (async () => {
            try {
                setLoadingMags(true);
                const rows = await Promise.all(
                    magIds.map(async (id) => {
                        const r = await fetch(`/api/dergis/${id}`, { cache: "no-store" });
                        if (!r.ok) return null;
                        return (await r.json()) as Magazine;
                    })
                );
                if (!cancel) setMags(rows.filter(Boolean) as Magazine[]);
            } finally {
                if (!cancel) setLoadingMags(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [magIds]);

    async function removeFromList(kind: "author" | "dergi", id: number) {
        // optimistik güncelle
        if (kind === "author") setAuthors((s) => s.filter((a) => a.id !== id));
        else setMags((s) => s.filter((m) => m.id !== id));

        const res = await fetch("/api/list", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ kind, id }),
        });

        if (!res.ok) {
            // geri al
            if (kind === "author") {
                const r = await fetch(`/api/yazars/${id}`, { cache: "no-store" });
                if (r.ok) {
                    const data = (await r.json()) as Author;
                    setAuthors((s) => [...s, data]);
                }
            } else {
                const r = await fetch(`/api/dergis/${id}`, { cache: "no-store" });
                if (r.ok) {
                    const data = (await r.json()) as Magazine;
                    setMags((s) => [...s, data]);
                }
            }
            alert("Kaldırma işlemi başarısız oldu.");
        }
    }

    function placeholderCover() {
        return "/logo/logo_color.svg";
    }

    function normalizePublicPath(p?: string | null) {
        if (!p) return null;
        let s = String(p).trim();
        s = s.replace(/^https?:\/\/[^/]+\/+/, ""); // domain at
        s = s.replace(/^\/+/, ""); // baştaki /'ları at
        s = s.replace(/^public\/+/, ""); // public/ önekini at
        return "/" + s.split("/").map(encodeURIComponent).join("/");
    }

    // API image varsa onu kullan; yoksa isimden pdfImage yolu üret
    function magazineCover(m: Magazine) {
        const fromApi = normalizePublicPath(m.image);
        if (fromApi) return fromApi;
        const enc = encodeURIComponent((m.isim || "").trim());
        return `/pdfImage/${enc}/${enc}_1.jpg`;
    }

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Üst şerit */}
            <div className="border-b border-[#333]">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                            <User2 className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Listelerim</h1>
                            <p className="text-white/60 mt-1">Kaydettiğiniz yazarlar ve dergiler burada.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sekmeler */}
            <div className="mx-auto max-w-7xl px-6 pt-8">
                <div className="inline-flex rounded-xl border border-[#333] p-1 bg-[#141414]">
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${tab === "yazar" ? "bg-[#1b1b1b] text-white" : "text-white/70 hover:text-white"
                            }`}
                        onClick={() => setTab("yazar")}
                    >
                        <BookOpen className="w-4 h-4 text-[#ffc451]" />
                        Yazarlar
                        <span className="ml-1 text-white/50">({authorIds.length})</span>
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${tab === "dergi" ? "bg-[#1b1b1b] text-white" : "text-white/70 hover:text-white"
                            }`}
                        onClick={() => setTab("dergi")}
                    >
                        <LibraryBig className="w-4 h-4 text-[#ffc451]" />
                        Dergiler
                        <span className="ml-1 text-white/50">({magIds.length})</span>
                    </button>
                </div>
            </div>

            {/* İçerik */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                {loadingMe ? (
                    <div className="text-white/70">Yükleniyor…</div>
                ) : tab === "yazar" ? (
                    <>
                        {loadingAuthors ? (
                            <div className="flex items-center gap-2 text-white/70">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Yazarlar yükleniyor…
                            </div>
                        ) : authors.length === 0 ? (
                            <div className="text-white/60">Listenizde yazar bulunmuyor.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {authors
                                    .sort((a, b) => authorIds.indexOf(a.id) - authorIds.indexOf(b.id))
                                    .map((a) => (
                                        <div
                                            key={a.id}
                                            className="rounded-xl border border-[#333] bg-[#0f0f0f] overflow-hidden group"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={normImg(a.image, "yazarlar")}
                                                alt={a.isim}
                                                className="h-100 md:h-120  w-full object-cover"
                                            />
                                            <div className="p-5">
                                                <div className="font-semibold line-clamp-1">{a.isim}</div>
                                                <div className="text-sm text-white/60 line-clamp-2 mt-1">
                                                    {a.biyografi || "—"}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <a
                                                        href={`/sayfalar/yazar-detay?id=${a.id}`}
                                                        className="text-sm text-[#ffc451] hover:underline"
                                                    >
                                                        Detay
                                                    </a>
                                                    <button
                                                        onClick={() => removeFromList("author", a.id)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-[#333] px-2.5 py-1.5 text-xs hover:border-[#ffc451]"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Kaldır
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {loadingMags ? (
                            <div className="flex items-center gap-2 text-white/70">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Dergiler yükleniyor…
                            </div>
                        ) : mags.length === 0 ? (
                            <div className="text-white/60">Listenizde dergi bulunmuyor.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {mags
                                    .sort((a, b) => magIds.indexOf(a.id) - magIds.indexOf(b.id))
                                    .map((m) => (
                                        <div
                                            key={m.id}
                                            className="rounded-xl border border-[#333] bg-[#0f0f0f] overflow-hidden"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={magazineCover(m)}
                                                alt={m.isim}
                                                className="h-100 md:h-120 w-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = placeholderCover();
                                                }}
                                            />

                                            <div className="p-5">
                                                <div className="font-semibold line-clamp-1">{m.isim}</div>
                                                <div className="text-sm text-white/60 line-clamp-2 mt-1">
                                                    {m.aciklama || "—"}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <a
                                                        href={`/sayfalar/dergi-detay?id=${m.id}`}
                                                        className="text-sm text-[#ffc451] hover:underline"
                                                    >
                                                        Detay
                                                    </a>
                                                    <button
                                                        onClick={() => removeFromList("dergi", m.id)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-[#333] px-2.5 py-1.5 text-xs hover:border-[#ffc451]"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Kaldır
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}