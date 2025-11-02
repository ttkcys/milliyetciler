"use client";

import Link from "next/link";
import { BookOpen, Calendar, FileText } from 'lucide-react';


export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white opacity-85">
      <div className="relative overflow-hidden bg-black border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative  px-6 py-16 md:py-24">
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <a
              href="/"
              className="text-white/60 hover:text-[#ffc451] transition-colors"
            >
              Anasayfa
            </a>
            <span className="text-white/40">›</span>
            <span className="text-[#ffc451] font-medium">
              {" "}
              Gizlilik Politikası
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {" "}
                Gizlilik Politikası
              </h1>
              <p className="text-white/60 text-lg">
                Son güncelleme:{" "}
                {new Date().toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        {/* Giriş */}
        <div className="mb-12 rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#ffc451]/10">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white/90 leading-relaxed">
                Güvenliğiniz bizim için önemli. Bu sebeple bizimle
                paylaşacağınız kişisel verileriniz hassasiyetle korunmaktadır.
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                Biz,{" "}
                <span className="text-[#ffc451] font-medium">
                  İfade Fikir Derneği
                </span>{" "}
                ve{" "}
                <span className="text-[#ffc451] font-medium">
                  EKSEN Eğitim-Sen
                </span>
                , veri sorumlusu olarak, bu gizlilik ve kişisel verilerin
                korunması politikası ile, hangi kişisel verilerinizin hangi
                amaçla işleneceği, işlenen verilerin kimlerle ve neden
                paylaşılabileceği, veri işleme yöntemimiz ve hukuki sebeplerimiz
                ile; işlenen verilerinize ilişkin haklarınızın neler olduğu
                hususunda sizleri aydınlatmayı amaçlıyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Bölümler */}
        <div className="space-y-8">
          {/* Bölüm 1 */}
          <section className="group">
            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8 transition-all duration-300 hover:border-[#ffc451]/30 hover:shadow-lg hover:shadow-[#ffc451]/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                  <span className="text-xl font-bold text-[#1a1a1a]">1</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Toplanan Kişisel Verileriniz, Toplanma Yöntemi ve Hukuki
                  Sebebi
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-white/80 leading-relaxed">
                  IP adresiniz ve kullanıcı aracısı bilgileriniz, sadece analiz
                  yapmak amacıyla ve çerezler (cookies) vb. teknolojiler
                  vasıtasıyla, otomatik veya otomatik olmayan yöntemlerle ve
                  bazen de analitik sağlayıcılar, reklam ağları, arama bilgi
                  sağlayıcıları, teknoloji sağlayıcıları gibi üçüncü taraflardan
                  elde edilerek, kaydedilerek, depolanarak ve güncellenerek,
                  aramızdaki hizmet ve sözleşme ilişkisi çerçevesinde ve
                  süresince, meşru menfaat işleme şartına dayanılarak
                  işlenecektir.
                </p>
              </div>
            </div>
          </section>

          {/* Bölüm 2 */}
          <section className="group">
            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8 transition-all duration-300 hover:border-[#ffc451]/30 hover:shadow-lg hover:shadow-[#ffc451]/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                  <span className="text-xl font-bold text-[#1a1a1a]">2</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Kişisel Verilerinizin İşlenme Amacı
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-white/80 leading-relaxed">
                  Bizimle paylaştığınız kişisel verileriniz sadece analiz yapmak
                  suretiyle; sunduğumuz hizmetlerin gerekliliklerini en iyi
                  şekilde yerine getirebilmek, bu hizmetlere sizin tarafınızdan
                  ulaşılabilmesini ve maksimum düzeyde faydalanılabilmesini
                  sağlamak, hizmetlerimizi, ihtiyaçlarınız doğrultusunda
                  geliştirebilmek ve sizleri daha geniş kapsamlı hizmet
                  sağlayıcıları ile yasal çerçeveler içerisinde buluşturabilmek
                  ve kanundan doğan zorunlulukların (kişisel verilerin talep
                  halinde adli ve idari makamlarla paylaşılması) yerine
                  getirilebilmesi amacıyla, sözleşme ve hizmet süresince,
                  amacına uygun ve ölçülü bir şekilde işlenecek ve
                  güncellenecektir.
                </p>
              </div>
            </div>
          </section>

          {/* Bölüm 3 */}
          <section className="group">
            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8 transition-all duration-300 hover:border-[#ffc451]/30 hover:shadow-lg hover:shadow-[#ffc451]/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                  <span className="text-xl font-bold text-[#1a1a1a]">3</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Toplanan Kişisel Verilerin Kimlere ve Hangi Amaçlarla
                  Aktarılabileceği
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-white/80 leading-relaxed">
                  Bizimle paylaştığınız kişisel verileriniz; faaliyetlerimizi
                  yürütmek üzere hizmet aldığımız ve/veya verdiğimiz,
                  sözleşmesel ilişki içerisinde bulunduğumuz, iş birliği
                  yaptığımız, yurt içi ve yurt dışındaki 3. şahıslar ile kurum
                  ve kuruluşlara ve talep halinde adli ve idari makamlara,
                  gerekli teknik ve idari önlemler alınması koşulu ile
                  aktarılabilecektir.
                </p>
              </div>
            </div>
          </section>

          {/* Bölüm 4 - Haklarınız */}
          <section className="group">
            <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8 transition-all duration-300 hover:border-[#ffc451]/30 hover:shadow-lg hover:shadow-[#ffc451]/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                  <span className="text-xl font-bold text-[#1a1a1a]">4</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Kişisel Verileri İşlenen Kişi Olarak Haklarınız
                </h2>
              </div>
              <div className="pl-16 space-y-6">
                <p className="text-white/80 leading-relaxed">
                  KVKK madde 11 uyarınca herkes, veri sorumlusuna başvurarak
                  aşağıdaki haklarını kullanabilir:
                </p>

                <div className="space-y-3">
                  {[
                    "Kişisel veri işlenip işlenmediğini öğrenme",
                    "Kişisel verileri işlenmişse buna ilişkin bilgi talep etme",
                    "Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
                    "Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme",
                    "Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme",
                    "Kişisel verilerin silinmesini veya yok edilmesini isteme",
                    "Yukarıda belirtilen işlemlerin yapılması halinde, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
                    "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme",
                    "Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme",
                  ].map((right, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#ffc451]/10 group-hover/item:bg-[#ffc451]/20 transition-colors duration-300 mt-0.5">
                        <svg
                          className="w-3.5 h-3.5 text-[#ffc451]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-white/80 leading-relaxed">{right}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* İletişim CTA */}
        <div className="mt-12 rounded-2xl border border-[#ffc451]/20 bg-gradient-to-br from-[#ffc451]/10 to-transparent p-8">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Sorularınız mı var?
                </h3>
                <p className="text-white/70">
                  Gizlilik politikamız hakkında detaylı bilgi almak için bizimle
                  iletişime geçebilirsiniz.
                </p>
              </div>
            </div>
            <Link
              href="/iletisim"
              className="flex-shrink-0 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-8 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc451]/30 hover:scale-105"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
