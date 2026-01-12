// src/app/sayfalar/kadro/page.tsx
import React from "react";
import { Users } from "lucide-react";

const BRAND = "#ffc451";

type TeamMember = {
    name: string;
    role: string;        // ÜSTTE
    org?: string | null; // İsim altı
    img: string;         // /kadro/<slug>.png
};

/** Role sırası (üstten alta) */
const ROLE_ORDER = [
    "Proje Yönetim Kurulu Üyesi",
    "Proje Koordinasyon Kurulu Üyesi",
    "Literatür Taraması ve Tasnif Sorumlusu",
    "Dijital Dönüşüm Sorumlusu",
    "Araştırmacı",
] as const;

const TEAM: TeamMember[] = [
    // Proje Yönetim Kurulu
    {
        role: "Proje Yönetim Kurulu Üyesi",
        name: "Dr. İsmail Yıldız",
        org: "EKSEN Eğitim-Sen Genel Sekreteri",
        img: "/kadro/ismail.jpg",
    },
    {
        role: "Proje Yönetim Kurulu Üyesi",
        name: "Vasıf İnanç Duygulu",
        org: null,
        img: "/kadro/vasif.jpg",
    },
    {
        role: "Proje Yönetim Kurulu Üyesi",
        name: "Burak Serhat Ermiş",
        org: "İfade Fikir Derneği Genel Sekreteri",
        img: "/kadro/burak.jpg",
    },

    // Proje Koordinasyon Kurulu
    {
        role: "Proje Koordinasyon Kurulu Üyesi",
        name: "Alperen Arslan",
        org: "İfade Fikir Derneği Yönetim Kurulu Üyesi",
        img: "/kadro/alperen.jpg",
    },
    {
        role: "Proje Koordinasyon Kurulu Üyesi",
        name: "Ezgi Su Çolak",
        org: "İfade Fikir Derneği Yönetim Kurulu Üyesi",
        img: "/kadro/ezgi.jpg",
    },
    {
        role: "Proje Koordinasyon Kurulu Üyesi",
        name: "Fatih Dönmez",
        org: "İfade Fikir Derneği Yönetim Kurulu Üyesi",
        img: "/kadro/fatih.jpg",
    },
    {
        role: "Proje Koordinasyon Kurulu Üyesi",
        name: "Hilal Süyümbike Maraş",
        org: "İfade Fikir Derneği Yönetim Kurulu Üyesi",
        img: "/kadro/hilal.jpeg",
    },
    {
        role: "Proje Koordinasyon Kurulu Üyesi",
        name: "Kağan Özkan",
        org: "İfade Fikir Derneği Yönetim Kurulu Üyesi",
        img: "/kadro/kagan.jpg",
    },
    {
        role: "Proje Koordinasyon Kurulu Üyesi",
        name: "Orhan Önçırak",
        org: "İfade Fikir Derneği Yönetim Kurulu Üyesi",
        img: "/kadro/orhan.jpg",
    },

    // Literatür
    {
        role: "Literatür Taraması ve Tasnif Sorumlusu",
        name: "Abdurrahman Kahraman",
        org: "Öğrenci / Gazi Üniversitesi Mühendislik Fakültesi",
        img: "/kadro/abdurrahman.jpeg",
    },
    {
        role: "Literatür Taraması ve Tasnif Sorumlusu",
        name: "Elif Zülal Biçer",
        org: "Öğrenci / Hacettepe Üniversitesi Tıp Fakültesi",
        img: "/kadro/elif.jpeg",
    },
    {
        role: "Literatür Taraması ve Tasnif Sorumlusu",
        name: "Emre Dönmez",
        org: "Öğrenci / TOBB ETÜ Mühendislik Fakültesi",
        img: "/kadro/emre.jpeg",
    },
    {
        role: "Literatür Taraması ve Tasnif Sorumlusu",
        name: "Enes Faruk Ertan",
        org: "Öğrenci / Bilkent Üniversitesi Hukuk Fakültesi",
        img: "/kadro/enes.jpeg",
    },
    {
        role: "Literatür Taraması ve Tasnif Sorumlusu",
        name: "Osman Uyar",
        org: "Öğrenci / Hacettepe Üniversitesi Tıp Fakültesi",
        img: "/kadro/osman.jpeg",
    },
    {
        role: "Literatür Taraması ve Tasnif Sorumlusu",
        name: "Sıla Demirhan",
        org: "Öğrenci / Ankara Üniversitesi Hukuk Fakültesi",
        img: "/kadro/sila.jpeg",
    },

    // Dijital dönüşüm
    {
        role: "Dijital Dönüşüm Sorumlusu",
        name: "Ali Osman Uzunay",
        org: null,
        img: "/kadro/ali.jpeg",
    },
    {
        role: "Dijital Dönüşüm Sorumlusu",
        name: "Efe Bahri Güler",
        org: "Öğrenci / Hacettepe Üniversitesi Mühendislik Fakültesi",
        img: "/kadro/efe.jpeg",
    },

    // Araştırmacı
    {
        role: "Araştırmacı",
        name: "Ahmet Kerim Akel",
        org: "Öğrenci / Hacettepe Üniversitesi Tıp Fakültesi",
        img: "/kadro/ahmet.jpeg",
    },
    {
        role: "Araştırmacı",
        name: "Ayşe Yaren Bektaş",
        org: "Öğrenci / Başkent Üniversitesi Tıp Fakültesi",
        img: "/kadro/ayse.jpeg",
    },
    {
        role: "Araştırmacı",
        name: "Zülal Yiğit",
        org: null,
        img: "/kadro/zulal.jpeg",
    },
    {
        role: "Araştırmacı",
        name: "İsmail Sefa Urhan",
        org: "Öğrenci / Bilkent Üniversitesi İktisadi, İdari ve Sosyal Bilimler Fakültesi",
        img: "/kadro/sefa.jpg",
    },
    {
        role: "Araştırmacı",
        name: "Nurullah Duman",
        org: "Öğrenci / Ankara Sosyal Bilimler Üniversitesi Hukuk Fakültesi",
        img: "/kadro/nurullah.jpeg",
    },
    {
        role: "Araştırmacı",
        name: "Kazım Cihat Kalkan",
        org: "Öğrenci / İstanbul Üniversitesi Edebiyat Fakültesi, Tarih Bölümü",
        img: "/kadro/kazim.jpg",
    },
    {
        role: "Araştırmacı",
        name: "Mehmet Oğuz Turan",
        org: "Öğrenci / İstanbul Üniversitesi Siyasal Bilgiler Fakültesi Siyaset Bilimi ve Kamu Yönetimi",
        img: "/kadro/mehmet.jpg",
    },
];

function groupByRole(list: TeamMember[]) {
    const map = new Map<string, TeamMember[]>();
    for (const m of list) {
        const arr = map.get(m.role) ?? [];
        arr.push(m);
        map.set(m.role, arr);
    }
    return map;
}

function MemberCard({ m }: { m: TeamMember }) {
    return (
        <div className="group rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-5 transition-all duration-300 hover:border-[#ffc451] hover:shadow-2xl hover:shadow-[#ffc451]/10">
            {/* Role */}
            <div className="text-xs font-semibold tracking-wide uppercase text-white/50">
                {m.role}
            </div>

            <div className="mt-4 flex items-center gap-4">
                {/* Image */}
                <div className="h-20 w-20 overflow-hidden rounded-xl border border-[#333] bg-[#141414] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={m.img}
                        alt={m.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Name + org */}
                <div className="min-w-0">
                    <div className="text-[15px] font-bold leading-snug" style={{ color: BRAND }}>
                        {m.name}
                    </div>
                    {m.org ? (
                        <div className="mt-1 text-sm text-white/70 line-clamp-2">{m.org}</div>
                    ) : (
                        <div className="mt-1 text-sm text-white/40">—</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function KadroPage() {
    const grouped = groupByRole(TEAM);

    return (
        <div className="min-h-screen bg-black text-white opacity-85">
            {/* Hero */}
            <div className="relative overflow-hidden bg-black border-b border-[#333]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
                    <nav className="mb-8 flex items-center gap-2 text-sm">
                        <a href="/" className="text-white/60 hover:text-[#ffc451] transition-colors">
                            Anasayfa
                        </a>
                        <span className="text-white/40">›</span>
                        <span className="text-[#ffc451] font-medium">Kadro</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                            <Users className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">Kadro</h1>
                            <p className="text-white/60 text-lg mt-1">
                                Projenin yürütülmesinde görev alan ekip.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* İçerik */}
            <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
                <div className="mb-10 rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8">
                    <p className="text-white/80 leading-relaxed">
                        Milliyetçi Dergiler Projesi, kâr amacı gütmeyen ve gönüllülük usulü ile ilerleyen bir projedir.
                        Bu kapsamda projenin başlangıcından bugüne ve bugünden yarınlara milliyetçi düşünce birikiminin
                        gelecek nesillere aktarılması adına gayret gösteren proje kurullarımıza ve gönüllülerimize
                        emekleri için teşekkür ederiz.
                    </p>
                </div>

                {/* Role bazlı bölümler */}
                <div className="space-y-10">
                    {ROLE_ORDER.map((role) => {
                        const list = grouped.get(role) ?? [];
                        if (list.length === 0) return null;

                        // İstersen aynı role içinde isme göre alfabetik
                        list.sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));

                        return (
                            <section key={role}>
                                <div className="mb-5 flex items-end justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold" style={{ color: BRAND }}>
                                            {role}
                                        </h2>
                                    </div>
                                    <div className="h-px flex-1 bg-[#333] mb-2 hidden md:block" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {list.map((m) => (
                                        <MemberCard key={`${m.role}-${m.name}`} m={m} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
