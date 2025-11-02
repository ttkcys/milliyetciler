// app/iletisim/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    // Burada form verilerini API route’una gönderebilirsin.
    // await fetch("/api/contact", { method: "POST", body: new FormData(e.currentTarget) });
    setTimeout(() => setSending(false), 1200);
  }

  return (
    <div className="opacity-85 min-h-screen bg-black text-white">
      {/* Hero / Breadcrumb */}
      <div className="relative overflow-hidden bg-black border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <a
              href="/"
              className="text-white/60 hover:text-[#ffc451] transition-colors"
            >
              Anasayfa
            </a>
            <span className="text-white/40">›</span>
            <span className="text-[#ffc451] font-medium">İletişim</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">İletişim</h1>
              <p className="text-white/60 text-lg mt-1">
                Sorularınız ve önerileriniz için bize ulaşın.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Harita */}
        <div className="rounded-2xl overflow-hidden border border-[#333] bg-[#111]">
          <iframe
            title="İfade Fikir Derneği - Harita"
            className="w-full h-[360px] md:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            // Google Maps embed (merkeze sabit pin). Gerekirse kendi Maps linkinle değiştir.
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3069.198028645137!2d32.8397!3d39.8879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSMO8cml0YSBLYXls!5e0!3m2!1str!2str!4v1710000000000"
          />
        </div>

        {/* Bilgi & Form */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Adres & Email kutuları */}
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc451]/10">
                  <svg
                    className="w-6 h-6 text-[#ffc451]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Adres</h3>
                  <p className="mt-2 text-white/70 leading-relaxed">
                    Aşağı Öveçler Mahallesi, 1319. Sokak
                    <br />
                    Beyaz Ev Apartmanı No:9/9
                    <br />
                    Çankaya/Ankara
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc451]/10">
                  <svg
                    className="w-6 h-6 text-[#ffc451]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <a
                    href="mailto:info@milliyetcidergiler.org"
                    className="mt-2 block text-white/70 hover:text-[#ffc451] transition-colors"
                  >
                    info@milliyetcidergiler.org
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6">
              <p className="text-sm text-white/70">
                Kişisel veriler,{" "}
                <Link
                  href="/sayfalar/gizlilik-politikasi"
                  className="text-[#ffc451] hover:underline"
                >
                  Gizlilik Politikası
                </Link>{" "}
                kapsamında KVKK’ya uygun şekilde işlenir.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-6 md:p-8"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-white/70 mb-2"
                  >
                    İsminiz
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    placeholder="İsminiz"
                    className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-white/70 mb-2"
                  >
                    Mail Adresiniz
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="ornek@eposta.com"
                    className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451] transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm text-white/70 mb-2"
                  >
                    Konu Seçiniz
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    defaultValue=""
                    required
                    className="w-full appearance-none rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451] transition-colors"
                  >
                    <option value="" disabled>
                      Bir konu seçin
                    </option>
                    <option>Genel Bilgi Talebi</option>
                    <option>Teknik Destek</option>
                    <option>İş Birliği / Proje</option>
                    <option>Diğer</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm text-white/70 mb-2"
                  >
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={8}
                    required
                    placeholder="Mesajınızı buraya yazın..."
                    className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451] transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="cursor-pointer flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-8 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc451]/30 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"
                        ></path>
                      </svg>
                      Gönderiliyor…
                    </>
                  ) : (
                    <>Mesaj Gönder</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
