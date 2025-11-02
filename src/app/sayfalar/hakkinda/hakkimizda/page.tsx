import React from 'react';
import { BookOpen, Calendar, Globe, Archive } from 'lucide-react';

export default function AboutPage() {
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
                        <span className="text-[#ffc451] font-medium">Hakkımızda</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                            <BookOpen className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Hakkımızda</h1>
                            <p className="text-white/60 text-lg mt-1">
                                Milliyetçiliğin Dijital Hafızası
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* İçerik */}
            <div className="mx-auto max-w-4xl px-4 py-12 space-y-12">
                {/* Ana Başlık ve Açıklama */}
                <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8">
                    <h2 className="text-3xl font-bold text-[#ffc451] mb-6">Milliyetçi Dergiler Projesi</h2>
                    
                    <div className="space-y-4 text-white/80 leading-relaxed text-lg">
                        <p>
                            Türk milliyetçiliği, Türk düşünce hayatında yer almaya başladığı günden bu yana bilim insanlarının ve düşünce adamlarının emekleriyle inşa edilmiş bir düşünce hareketidir. Bu düşünce hareketinin önemli bir ürünü olarak Türk yayıncılık tarihinin hemen her döneminde birçok farklı alanda milliyetçi düşünürler tarafından çıkarılan süreli yayınlar dönemin tartışmalarına ve bu tartışmalara yönelik milliyetçi bakış açılarına ışık tutmuştur.
                        </p>
                        
                        <p>
                            Türk milliyetçisi kurum ve kuruluşlar milliyetçiliğin çeşitli birikimlerinin bir kısmına varislik ederken, süreli yayınlar yoluyla aktarılan milliyetçi düşünce birikimi unutulmaya yüz tutmuş vaziyettedir. Bu kıymetli mirası yaşatmak konusundaki çalışmaların yetersizliği günümüzde erişilmesi mümkün olmayan birçok dergide serdedilen düşünceleri ulaşılabilir olmaktan uzaklaştırmaktadır.
                        </p>
                        
                        <p>
                            Milliyetçi Dergiler, Türk düşünce hayatında milliyetçi müktesebatın gelecek nesillere aktarılması gayesiyle 2019 yılında kâr amacı gütmeyen bir proje olarak Eksen Eğitim Sen ve İfade Fikir Derneği tarafından hayata geçirilmiştir.
                        </p>
                    </div>
                </div>

                {/* Zaman Çizelgesi */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffc451]/10">
                            <Calendar className="h-6 w-6 text-[#ffc451]" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Proje Tarihi</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="group relative flex gap-6 rounded-xl border border-[#333] bg-[#141414] p-6 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#1a1a1a]">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffc451]/10 text-[#ffc451] font-bold text-xl group-hover:bg-[#ffc451] group-hover:text-[#1a1a1a] transition-all duration-300">
                                2019
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Projenin Başlangıcı</h3>
                                <p className="text-white/70">
                                    Eksen Eğitim Sen ve İfade Fikir Derneği iş birliğinde Milliyetçi Dergiler Projesi hayata geçirildi. Literatür taraması çalışmalarına başlandı.
                                </p>
                            </div>
                        </div>

                        <div className="group relative flex gap-6 rounded-xl border border-[#333] bg-[#141414] p-6 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#1a1a1a]">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffc451]/10 text-[#ffc451] font-bold text-xl group-hover:bg-[#ffc451] group-hover:text-[#1a1a1a] transition-all duration-300">
                                2022
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Dijital Platformun Açılışı</h3>
                                <p className="text-white/70">
                                    3 Aralık 2022 tarihinde www.milliyetcidergiler.org adresi erişime açıldı. Dergilerin dijital ortama aktarılması aşamasına geçildi.
                                </p>
                            </div>
                        </div>

                        <div className="group relative flex gap-6 rounded-xl border border-[#333] bg-[#141414] p-6 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#1a1a1a]">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#ffc451]/10 text-[#ffc451] font-bold text-xl group-hover:bg-[#ffc451] group-hover:text-[#1a1a1a] transition-all duration-300">
                                <Archive className="h-8 w-8" strokeWidth={2} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Bugün</h3>
                                <p className="text-white/70">
                                    Projenin başlangıcından itibaren 101 farklı derginin bütün sayıları dijital ortama aktarılmıştır. Tarama ve tasnif çalışmalarına devam edilmektedir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Misyon */}
                <div className="rounded-2xl border border-[#ffc451]/20 bg-gradient-to-br from-[#ffc451]/5 to-transparent p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffc451]/10">
                            <Globe className="h-6 w-6 text-[#ffc451]" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Misyonumuz</h2>
                    </div>
                    <p className="text-white/80 leading-relaxed text-lg">
                        Milliyetçi Dergiler Projesi kapsamında literatür taraması ve dijital ortama aktarma çalışmaları eş zamanlı olarak sürdürülmektedir. Amacımız, Türk milliyetçi düşünce birikimini dijital ortamda muhafaza ederek gelecek nesillere aktarmak ve araştırmacıların hizmetine sunmaktır.
                    </p>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 text-center">
                        <div className="text-4xl font-bold text-[#ffc451] mb-2">101+</div>
                        <div className="text-white/60 text-sm">Dijitalleştirilen Dergi</div>
                    </div>
                    <div className="rounded-xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 text-center">
                        <div className="text-4xl font-bold text-[#ffc451] mb-2">2019</div>
                        <div className="text-white/60 text-sm">Kuruluş Yılı</div>
                    </div>
                    <div className="rounded-xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 text-center">
                        <div className="text-4xl font-bold text-[#ffc451] mb-2">2022</div>
                        <div className="text-white/60 text-sm">Platform Açılışı</div>
                    </div>
                </div>
            </div>
        </div>
    );
}