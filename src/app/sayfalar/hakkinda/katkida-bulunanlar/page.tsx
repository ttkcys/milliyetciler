import React from 'react';
import { Heart, Gift, Scan } from 'lucide-react';
import { BookOpen } from 'lucide-react';

const MAGAZINE_DONORS = [
    "Ahmet B. Karabacak",
    "Hakkı Öznur",
    "Mahir Durakoğlu",
    "Metin Turhan",
    "Recep Kanalga",
    "Yusuf Özkan",
    "Mehmet Raşit Küçükkürtül"
];

const SCANNING_CONTRIBUTORS = [
    "Beyza Zeynep Pehlivanoğlu",
    "Fatih İsa Bekis",
    "Göktürk Gökalp",
    "Mutlu Çelik",
    "Melis İrem Bayrak",
    "Muhammed Akbulut",
    "Yasemin Karaman",
    "Zeynep Rana Korkmaz",
    "Mehmet Çağrı Şenel",
    "Talha Dovan"
];

export default function ContributorsPage() {
    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Hero + Breadcrumb */}
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
                        <span className="text-[#ffc451] font-medium">Katkıda Bulunanlar</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                            <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Katkıda Bulunanlar</h1>
                            <p className="text-white/60 text-lg mt-1">
                                Projeye destek veren değerli isimler...
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* İçerik */}
            <div className="mx-auto max-w-4xl px-4 py-12 space-y-12">
                {/* Açıklama */}
                <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8">
                    <p className="text-white/80 leading-relaxed text-lg">
                        Milliyetçi Dergiler Projesi, İfade Fikir Derneği ve Eksen Eğitim Sen iş birliğinde gerçekleştirilen dört yıllık çalışmalar neticesinde ürünlerini vermeye başlayan bir elektronik arşiv çalışmasıdır. Projenin dört yıllık safahatında birçok kurum, kuruluş ve bağımsız milliyetçi bireyler projeye katkı sağlamıştır. Destekleriyle Milliyetçi Dergiler Projesi'nin bu noktaya gelmesine katkı sunan her bir ferde ayrı ayrı teşekkür ederiz.
                    </p>
                </div>

                {/* Dergi Bağışı Yapanlar */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffc451]/10">
                            <Gift className="h-6 w-6 text-[#ffc451]" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Dergi Bağışlarıyla Katkıda Bulunanlar</h2>
                            <p className="text-sm text-white/50">Değerli dergi koleksiyonlarını projeye kazandıranlar</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MAGAZINE_DONORS.map((name, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-3 rounded-xl border border-[#333] bg-[#141414] p-4 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#1a1a1a]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc451]/10 text-[#ffc451] font-bold group-hover:bg-[#ffc451] group-hover:text-[#1a1a1a] transition-all duration-300">
                                    {index + 1}
                                </div>
                                <span className="text-white/90 font-medium">{name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tarama Aşamasında Katkıda Bulunanlar */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffc451]/10">
                            <Scan className="h-6 w-6 text-[#ffc451]" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Dergi Tarama Aşamasında Katkıda Bulunanlar</h2>
                            <p className="text-sm text-white/50">Dergilerin dijitalleştirilmesinde emeği geçenler</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SCANNING_CONTRIBUTORS.map((name, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-3 rounded-xl border border-[#333] bg-[#141414] p-4 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#1a1a1a]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc451]/10 text-[#ffc451] font-bold group-hover:bg-[#ffc451] group-hover:text-[#1a1a1a] transition-all duration-300">
                                    {index + 1}
                                </div>
                                <span className="text-white/90 font-medium">{name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Teşekkür mesajı */}
                <div className="rounded-2xl border border-[#ffc451]/20 bg-gradient-to-br from-[#ffc451]/5 to-transparent p-8 text-center">
                    <Heart className="mx-auto mb-4 h-12 w-12 text-[#ffc451]" strokeWidth={2} />
                    <p className="text-xl font-semibold text-white mb-2">
                        Tüm katkıda bulunanlara teşekkür ederiz!
                    </p>
                    <p className="text-white/60">
                        Milliyetçi Dergiler Projesi, sizlerin destekleriyle ayakta duruyor.
                    </p>
                </div>
            </div>
        </div>
    );
}