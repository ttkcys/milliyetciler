"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import type { Route } from "next";


export default function SearchParamsSignUpWrapper() {
    const router = useRouter();
    const sp = useSearchParams();
    const nextUrl = useMemo(() => sp.get("next") || "/", [sp]);

    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr(null);
        setOk(false);

        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name") || "").trim();
        const email = String(fd.get("email") || "").trim().toLowerCase();
        const password = String(fd.get("password") || "");
        const password2 = String(fd.get("password2") || "");

        if (!name || !email || !password || !password2) {
            setErr("Lütfen tüm alanları doldurun.");
            return;
        }
        if (password.length < 6) {
            setErr("Şifre en az 6 karakter olmalı.");
            return;
        }
        if (password !== password2) {
            setErr("Şifreler uyuşmuyor.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
                cache: "no-store",
            });

            if (!res.ok) {
                let msg = "Kayıt işlemi başarısız. Lütfen tekrar deneyin.";
                try {
                    const j = await res.json();
                    if (j?.message) msg = j.message;
                } catch { }
                setErr(msg);
                return;
            }

            setOk(true);

            // 1 sn bilgi ver, sonra login sayfasına next ile yönlendir
            setTimeout(() => {
                router.replace(`/giris-yap?next=${encodeURIComponent(nextUrl)}` as Route);


            }, 1000);

            if (e.currentTarget && typeof (e.currentTarget as any).reset === "function") {
                (e.currentTarget as any).reset();
            }
        } catch {
            setErr("Ağ hatası. Lütfen daha sonra tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black opacity-85 text-white">
            <div className="relative overflow-hidden bg-black border-b border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
                    <nav className="mb-8 flex items-center gap-2 text-sm">
                        <a href="/" className="text-white/60 hover:text-[#ffc451] transition-colors">Anasayfa</a>
                        <span className="text-white/40">›</span>
                        <span className="text-[#ffc451] font-medium">Kayıt Ol</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                            <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Kayıt Ol</h1>
                            <p className="text-white/60 text-lg mt-1">Yeni bir hesap oluşturun.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-md px-6 py-10 md:py-14">
                <form
                    onSubmit={onSubmit}
                    className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,196,81,0.05)]"
                >
                    {err && (
                        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {err}
                        </div>
                    )}
                    {ok && (
                        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                            Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz…
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm text-white/70">İsminiz</label>
                            <input
                                id="name"
                                name="name"
                                placeholder="Ad Soyad"
                                required
                                className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                                autoComplete="name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm text-white/70">E-posta adresi</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ornek@eposta.com"
                                required
                                className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm text-white/70">Şifre</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={show1 ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-[#ffc451]"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow1((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-white/60 hover:text-[#ffc451] transition-colors"
                                    aria-label="Şifreyi göster/gizle"
                                >
                                    {show1 ? "Gizle" : "Göster"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password2" className="mb-2 block text-sm text-white/70">Şifrenizi Onaylayın</label>
                            <div className="relative">
                                <input
                                    id="password2"
                                    name="password2"
                                    type={show2 ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-[#ffc451]"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow2((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-white/60 hover:text-[#ffc451] transition-colors"
                                    aria-label="Şifreyi göster/gizle"
                                >
                                    {show2 ? "Gizle" : "Göster"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                                    </svg>
                                    Kayıt oluyor…
                                </>
                            ) : (
                                "Kayıt Ol"
                            )}
                        </button>

                        <p className="text-sm text-white/60">
                            Zaten hesabınız var mı?{" "}
                            <Link
                                href={{ pathname: "/giris-yap", query: { next: nextUrl } }}
                                className="font-semibold text-[#ffc451] hover:underline"
                            >
                                Giriş Yapın.
                            </Link>

                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
