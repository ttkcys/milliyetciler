// app/bagis/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen } from 'lucide-react';

export default function DonationPage() {
  const [copied, setCopied] = useState(false);

  const IBAN = "TR69 0006 4000 0014 3730 2383 80";
  const ACCOUNT = "İfade Fikir Derneği";
  const BANK = "İş Bankası – Çayyolu Şubesi";
  const EMAIL = "info@milliyetcidergiler.org";
  const POST_ADDR =
    "Kültür Mahallesi, Dr. Mediha Eldem Sokak. No:81/15, 06420 Çankaya/Ankara (İfade Fikir Derneği)";

  function copyIban() {
    navigator.clipboard.writeText(IBAN.replace(/\s+/g, " "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className=" opacity-85 min-h-screen bg-black text-white">
      {/* Hero */}
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
            <span className="text-[#ffc451] font-medium">Bağış</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Bağış</h1>
              <p className="text-white/60 text-lg mt-1">
                Milliyetçi Dergiler Projesi’ne destek olmak ister misiniz?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 space-y-8">
        {/* Dergi Bağışı */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <span className="text-xl font-bold text-[#1a1a1a]">1</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">Dergi Bağışı</h2>
          </div>
          <p className="text-white/80 leading-relaxed">
            Elinizde bulunan ve Milliyetçi Dergiler Projesi kapsamında okuyucu
            ve araştırmacıların ilgisine sunulabileceğini düşündüğünüz
            dergilerin <span className="text-[#ffc451]">dijital</span> ortama
            aktarılmış ya da <span className="text-[#ffc451]">matbu</span>{" "}
            halini; <strong>imtiyaz sahibi</strong>,
            <strong> derginin çıktığı tarihler</strong> ve{" "}
            <strong>kaç sayı çıkarıldığı</strong> bilgilerini de içerecek
            şekilde{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-[#ffc451] hover:underline"
            >
              {EMAIL}
            </a>{" "}
            adresine ya da aşağıdaki posta adresine gönderebilirsiniz.
          </p>

          <div className="mt-6 rounded-xl border border-[#333] bg-[#171717] p-6">
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
                <h3 className="text-lg font-semibold">Posta Adresi</h3>
                <p className="mt-2 text-white/70">{POST_ADDR}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Maddi Bağış */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <span className="text-xl font-bold text-[#1a1a1a]">2</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">Maddi Bağış</h2>
          </div>

          <p className="text-white/80 leading-relaxed">
            Milliyetçi Dergiler Projesi, herhangi bir resmi ya da özel
            kuruluştan destek alınmaksızın
            <span className="text-[#ffc451]"> Eksen Eğitim Sen</span> ve{" "}
            <span className="text-[#ffc451]">İfade Fikir Derneği</span>’nin öz
            kaynakları ve gönüllüleri tarafından sürdürülmektedir. Proje
            kapsamında yapılan taramalar, Milliyetçi Dergiler Proje Yönetim
            Kurulu ve İfade Fikir Derneği bursiyerleri tarafından
            gerçekleştirilmektedir. Maddi giderlerin karşılanmasına destek olmak
            isterseniz aşağıdaki IBAN numarası aracılığıyla projemize destek
            olabilirsiniz.
          </p>

          {/* Banka Kartı */}
          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-2xl border border-[#3a3a3a] bg-gradient-to-br from-[#1b1b1b] to-[#121212] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Banka Bilgileri</h3>
                <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-white/60">
                  İş Bankası
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-white/80">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/60">Hesap Adı</dt>
                  <dd className="font-medium">{ACCOUNT}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/60">IBAN</dt>
                  <dd className="font-mono text-[15px] tracking-wide">
                    {IBAN}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/60">Banka</dt>
                  <dd className="font-medium">{BANK}</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={copyIban}
                  className="rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc451]/30 hover:scale-105"
                >
                  {copied ? "Kopyalandı ✓" : "IBAN’ı Kopyala"}
                </button>
                <a
                  href={`mailto:${EMAIL}?subject=Ba%C4%9F%C4%B1%C5%9F%20Bilgilendirme&body=Ba%C4%9F%C4%B1%C5%9F%C4%B1m%C4%B1%20ger%C3%A7ekle%C5%9Ftirdim.%20Makbuz%20i%C3%A7in%20ileti%C5%9Fime%20ge%C3%A7ebilir%20misiniz%3F`}
                  className="rounded-full border border-[#ffc451] px-5 py-2.5 text-sm font-semibold text-[#ffc451] transition-all duration-300 hover:bg-[#ffc451] hover:text-[#1a1a1a]"
                >
                  Bağışı Bildir
                </a>
              </div>
            </div>

            {/* Bilgilendirme kutusu */}
            <div className="rounded-2xl border border-[#333] bg-[#171717] p-6">
              <h4 className="text-base font-semibold mb-2">Önemli Not</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                Açıklama kısmına{" "}
                <span className="text-[#ffc451] font-medium">
                  “Milliyetçi Dergiler Bağış”
                </span>{" "}
                yazmanız, muhasebe kaydı ve şeffaflık açısından önemlidir. Bağış
                makbuzu talebiniz için
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-[#ffc451] hover:underline"
                >
                  {" "}
                  {EMAIL}
                </a>{" "}
                adresine yazabilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-[#ffc451]/20 bg-gradient-to-br from-[#ffc451]/10 to-transparent p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffc451]">
                <svg
                  className="w-6 h-6 text-[#1a1a1a]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v8m4-4H8"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  Daha fazla bilgi ister misiniz?
                </h3>
                <p className="text-white/70">
                  Dergi bağışı veya makbuz süreçleri için bize yazın.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/iletisim"
                className="rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc451]/30 hover:scale-105"
              >
                İletişime Geç
              </Link>
              <a
                href={`mailto:${EMAIL}`}
                className="rounded-full border border-[#ffc451] px-6 py-3 text-sm font-semibold text-[#ffc451] transition-all duration-300 hover:bg-[#ffc451] hover:text-[#1a1a1a]"
              >
                E-posta Gönder
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
