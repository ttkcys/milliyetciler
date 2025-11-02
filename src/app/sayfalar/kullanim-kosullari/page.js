// app/kullanim-kosullari/page.tsx
"use client";

import Link from "next/link";
import { BookOpen, Calendar, FileText } from 'lucide-react';

export default function TermsOfUsePage() {
  const today = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black opacity-85 text-white">
      {/* Hero */}

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
              Kullanım Koşulları
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {" "}
                Kullanım Koşulları
              </h1>
              <p className="text-white/60 text-lg">Son güncelleme: {today}</p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 space-y-8">
        {/* Giriş */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <h2 className="text-2xl font-bold mb-4">Kullanım Koşulları</h2>
          <p className="text-white/80 leading-relaxed">
            Sevgili ziyaretçimiz, lütfen{" "}
            <span className="text-[#ffc451]">
              https://www.milliyetcidergiler.org
            </span>{" "}
            web sitemizi ziyaret etmeden önce işbu kullanım koşulları
            sözleşmesini dikkatlice okuyunuz. Siteye erişiminiz tamamen bu
            sözleşmeyi kabulünüze ve bu sözleşme ile belirlenen şartlara
            uymanıza bağlıdır. Şayet bu sözleşmede yazan herhangi bir koşulu
            kabul etmiyorsanız, lütfen siteye erişiminizi sonlandırınız. Siteye
            erişiminizi sürdürdüğünüz takdirde, koşulsuz ve kısıtlamasız olarak,
            işbu sözleşme metninin tamamını kabul ettiğinizin, tarafımızca
            varsayılacağını lütfen unutmayınız.
          </p>
          <p className="mt-4 text-white/80 leading-relaxed">
            <span className="text-[#ffc451]">
              https://www.milliyetcidergiler.org
            </span>{" "}
            web sitesi İfade Fikir Derneği tarafından yönetilmekte olup, bundan
            sonra <span className="text-[#ffc451]">milliyetcidergiler.org</span>{" "}
            olarak anılacaktır. İşbu siteye ilişkin Kullanım Koşulları,
            yayınlanmakla yürürlüğe girer. Değişiklik yapma hakkı, tek taraflı
            olarak{" "}
            <span className="text-[#ffc451]">milliyetcidergiler.org</span>'a
            aittir ve{" "}
            <span className="text-[#ffc451]">milliyetcidergiler.org</span>{" "}
            üzerinden güncel olarak paylaşılacak olan bu değişiklikleri, tüm
            kullanıcılarımız baştan kabul etmiş sayılır.
          </p>
        </section>

        {/* Gizlilik */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <h3 className="text-xl font-semibold mb-3">Gizlilik</h3>
          <p className="text-white/80 leading-relaxed">
            Gizlilik, ayrı bir sayfada, kişisel verilerinizin tarafımızca
            işlenmesinin esaslarını düzenlemek üzere mevcuttur.{" "}
            <span className="text-[#ffc451]">milliyetcidergiler.org</span>'u
            kullandığınız takdirde, bu verilerin işlenmesinin gizlilik
            politikasına uygun olarak gerçekleştiğini kabul edersiniz.{" "}
            <Link
              href="/sayfalar/gizlilik-politikasi"
              className="text-[#ffc451] hover:underline"
            >
              Gizlilik Politikası
            </Link>
          </p>
        </section>

        {/* Hizmet Kapsamı */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <h3 className="text-xl font-semibold mb-3">Hizmet Kapsamı</h3>
          <p className="text-white/80 leading-relaxed">
            İfade Fikir Derneği ve EKSEN Eğitim-Sen olarak, sunacağımız
            hizmetlerin kapsamını ve niteliğini, yasalar çerçevesinde
            belirlemekte tamamen serbest olup; hizmetlere ilişkin yapacağımız
            değişiklikler,{" "}
            <span className="text-[#ffc451]">milliyetcidergiler.org</span>'da
            yayımlanmakla yürürlüğe girmiş sayılacaktır.
          </p>
        </section>

        {/* Telif Hakları */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <h3 className="text-xl font-semibold mb-3">Telif Hakları</h3>
          <p className="text-white/80 leading-relaxed">
            <span className="text-[#ffc451]">milliyetcidergiler.org</span>'da
            yayımlanan tüm metin, kod, grafikler, logolar, resimler, ses
            dosyaları ve kullanılan yazılımın sahibi (bundan böyle ve daha sonra
            “içerik” olarak anılacaktır) İfade Fikir Derneği ve EKSEN Eğitim-Sen
            olup, tüm hakları saklıdır. Yazılı izin olmaksızın site içeriğinin
            çoğaltılması veya kopyalanması kesinlikle yasaktır.
          </p>
        </section>

        {/* Genel Hükümler */}
        <section className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#222] to-[#1a1a1a] p-8">
          <h3 className="text-xl font-semibold mb-3">Genel Hükümler</h3>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p>
              Kullanıcıların tamamı,{" "}
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'u
              yalnızca hukuka uygun ve şahsi amaçlarla kullanacaklarını ve
              üçüncü kişinin haklarına tecavüz teşkil edecek nitelikteki
              herhangi bir faaliyette bulunmayacağını taahhüt eder.{" "}
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>{" "}
              dâhilinde yaptıkları işlem ve eylemlerindeki, hukuki ve cezai
              sorumlulukları kendilerine aittir. İşbu iş ve eylemler sebebiyle,
              üçüncü kişilerin uğradıkları veya uğrayabilecekleri zararlardan
              dolayı{" "}
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'un
              doğrudan ve/veya dolaylı hiçbir sorumluluğu yoktur.
            </p>
            <p>
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'da
              mevcut bilgilerin doğruluk ve güncelliğini sağlamak için elimizden
              geleni yapmaktayız. Lakin gösterdiğimiz çabaya rağmen, bu
              bilgiler, fiili değişikliklerin gerisinde kalabilir, birtakım
              farklılıklar olabilir. Bu sebeple, site içerisinde yer alan
              bilgilerin doğruluğu ve güncelliği ile ilgili tarafımızca, açık
              veya zımni, herhangi bir garanti verilmemekte, hiçbir taahhütte
              bulunulmamaktadır.
            </p>
            <p>
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'da
              üçüncü şahıslar tarafından işletilen ve içerikleri tarafımızca
              bilinmeyen diğer web sitelerine, uygulamalara ve platformlara
              köprüler (hyperlink) bulunabilir.{" "}
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>,
              işlevsel olarak yalnızca bu sitelere ulaşımı sağlamakta olup,
              içerikleri ile ilgili hiçbir sorumluluk kabul etmemekteyiz.
            </p>
            <p>
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'u
              virüslerden temizlenmiş tutmak konusunda elimizden geleni yapsak
              da, virüslerin tamamen bulunmadığı garantisini vermemekteyiz. Bu
              nedenle veri indirirken, virüslere karşı gerekli önlemi almak,
              kullanıcıların sorumluluğundadır. Virüs vb. kötü amaçlı
              programlar, kodlar veya materyallerin sebep olabileceği
              zararlardan dolayı sorumluluk kabul etmemekteyiz.
            </p>
            <p>
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'da
              sunulan hizmetlerde, kusur veya hata olmayacağına ya da kesintisiz
              hizmet verileceğine dair garanti vermemekteyiz.{" "}
              <span className="text-[#ffc451]">milliyetcidergiler.org</span>'a
              ve sitenin hizmetlerine veya herhangi bir bölümüne olan
              erişiminizi önceden bildirmeksizin herhangi bir zamanda
              sonlandırabiliriz.
            </p>
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
                    d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Soruların mı var?
                </h3>
                <p className="text-white/70">
                  Detay için gizlilik politikamıza göz atabilir veya bizimle
                  iletişime geçebilirsin.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sayfalar/gizlilik-politikasi"
                className="rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc451]/30 hover:scale-105"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/iletisim"
                className="rounded-full border border-[#ffc451] px-6 py-3 text-sm font-semibold text-[#ffc451] transition-all duration-300 hover:bg-[#ffc451] hover:text-[#1a1a1a]"
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
