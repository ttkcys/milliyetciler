"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Save, Loader2 } from "lucide-react";

/** Yardımcılar */
function clsx(...a) {
  return a.filter(Boolean).join(" ");
}
function normalizeNullable(v) {
  if (v === undefined) return null;
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export default function AccountPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  const [tel, setTel] = useState("");
  const [adres, setAdres] = useState("");
  const [meslek, setMeslek] = useState("");
  const [kurum, setKurum] = useState("");
  const [kullanim, setKullanim] = useState("");
  const [biyografi, setBiyografi] = useState("");

  const MESLEKLER = useMemo(
    () => ["Öğrenci", "Akademisyen", "Araştırmacı", "Yazar", "Diğer"],
    []
  );
  const KULLANIM_AMACLARI = useMemo(
    () => ["Ödev", "Tez", "Makale", "Proje", "Araştırma", "Diğer"],
    []
  );

  // Me’yi yükle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          setErr("Oturum bulunamadı. Lütfen giriş yapın.");
          setMe(null);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setMe(data);
        // formu doldur
        setName(data?.name ?? "");
        setEmail(data?.email ?? "");
        setTel(data?.tel ?? "");
        setAdres(data?.adres ?? "");
        setMeslek(data?.meslek ?? "");
        setKurum(data?.kurum ?? "");
        setKullanim(data?.kullanim ?? "");
        setBiyografi(data?.biyografi ?? "");
      } catch {
        if (!cancelled) setErr("Bilgiler alınamadı.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setOk(false);

    if (!name || !email) {
      setErr("İsim ve e-posta zorunludur.");
      return;
    }
    if (newPass || newPass2) {
      if (!oldPass) {
        setErr("Şifre değiştirmek için eski şifrenizi girin.");
        return;
      }
      if (newPass.length < 6) {
        setErr("Yeni şifre en az 6 karakter olmalı.");
        return;
      }
      if (newPass !== newPass2) {
        setErr("Yeni şifre ve onayı uyuşmuyor.");
        return;
      }
    }

    try {
      setSaving(true);

      // PATCH /api/users/:id — backend’in kolon adlarına göre gönderiyoruz
      const body = {
        name,
        email,
        // şifre değişecekse gönder
        ...(newPass ? { password: newPass, old_password: oldPass } : {}),
        tel: normalizeNullable(tel),
        adres: normalizeNullable(adres),
        meslek: normalizeNullable(meslek),
        kurum: normalizeNullable(kurum),
        kullanim: normalizeNullable(kullanim),
        biyografi: normalizeNullable(biyografi),
      };

      const res = await fetch(`/api/users/${me?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "Güncelleme başarısız.";
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        setErr(msg);
        return;
      }

      setOk(true);
      setOldPass("");
      setNewPass("");
      setNewPass2("");
      // güncel me’yi tekrar çek
      try {
        const meRes = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (meRes.ok) setMe(await meRes.json());
      } catch {}
    } catch {
      setErr("Ağ hatası. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white opacity-85">
      {/* Üst şerit */}
      <div className="relative border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <User className="w-7 h-7 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Hesabım</h1>
              <p className="text-white/60 mt-1">
                Bilgilerinizi görüntüleyin ve güncelleyin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-12">
        {/* uyarılar */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {err}
          </div>
        )}
        {ok && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Bilgileriniz güncellendi.
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-[#333] bg-[#121212] p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,196,81,0.05)]"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              Yükleniyor…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* İsim */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  İsminiz
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="Ad Soyad"
                  required
                />
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  E-posta adresi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="ornek@eposta.com"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Eski şifre */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Eski Şifre
                </label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {/* Yeni şifre */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              {/* Yeni şifre onay */}
              <div className="col-span-1 md:col-span-2">
                <label className="mb-2 block text-sm text-white/70">
                  Şifrenizi Onaylayın
                </label>
                <input
                  type="password"
                  value={newPass2}
                  onChange={(e) => setNewPass2(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <p className="mt-2 text-xs text-white/50">
                  Şifre değiştirmek istemiyorsanız bu alanları boş bırakın.
                </p>
              </div>

              {/* Telefon */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Telefon Numarası
                </label>
                <div className="flex">
                  <span className="select-none inline-flex items-center rounded-l-lg border border-r-0 border-[#333] bg-[#1a1a1a] px-3 text-sm text-white/70">
                    +90
                  </span>
                  <input
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    className="w-full rounded-r-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                    placeholder="555 555 5555"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Meslek */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Meslek
                </label>
                <select
                  value={meslek}
                  onChange={(e) => setMeslek(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-3 py-3 text-sm outline-none focus:border-[#ffc451]"
                >
                  <option value="">Meslek Seçiniz</option>
                  {MESLEKLER.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kullanım amacı */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Kullanım Amacı
                </label>
                <select
                  value={kullanim}
                  onChange={(e) => setKullanim(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-3 py-3 text-sm outline-none focus:border-[#ffc451]"
                >
                  <option value="">Kullanım Amacı Seçiniz</option>
                  {KULLANIM_AMACLARI.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kurum */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Kurumunuz
                </label>
                <input
                  value={kurum}
                  onChange={(e) => setKurum(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="(Varsa) kurum/okul"
                />
              </div>

              {/* Adres */}
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/70">
                  Adres
                </label>
                <input
                  value={adres}
                  onChange={(e) => setAdres(e.target.value)}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="Adres"
                />
              </div>

              {/* Biyografi */}
              <div className="col-span-1 md:col-span-2">
                <label className="mb-2 block text-sm text-white/70">
                  Biyografi
                </label>
                <textarea
                  value={biyografi}
                  onChange={(e) => setBiyografi(e.target.value)}
                  className="min-h-[110px] w-full resize-y rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none focus:border-[#ffc451]"
                  placeholder="Kendinizi kısaca tanıtın…"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || loading || !me}
                  className={clsx(
                    "cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kaydediliyor…
                    </>
                  ) : (
                    <>
                      
                      Bilgilerimi Güncelle
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Alt ipucu */}
        <p className="mt-4 text-center text-xs text-white/40">
          Bir sorun mu yaşıyorsunuz?{" "}
          <a href="/sayfalar/iletisim" className="text-[#ffc451] hover:underline">
            İletişim
          </a>
          .
        </p>
      </div>
    </div>
  );
}
