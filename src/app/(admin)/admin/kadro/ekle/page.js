"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, Upload, X } from "lucide-react";

export default function AdminKadroAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePath, setImagePath] = useState("");

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  const STORAGE_BASE = (process.env.NEXT_PUBLIC_STORAGE_BASE || "").replace(/\/+$/, "");

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return setError("Dosya boyutu 5MB'dan küçük olmalıdır");
    if (!file.type.startsWith("image/")) return setError("Sadece resim dosyaları yüklenebilir");

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "kadro");

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Resim yüklenirken hata oluştu");
        return;
      }

      const data = await res.json();
      setImagePath(data.path);
      setImagePreview(`${STORAGE_BASE}/${data.path}`);
    } catch {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setImagePath("");
    setImagePreview(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name")?.toString().trim() || null,
      position: form.get("position")?.toString().trim() || null,
      biography: form.get("biography")?.toString().trim() || null,
      image: imagePath || null,
    };

    if (!payload.name) {
      setError("İsim zorunludur.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/kadros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Kadro eklenirken hata oluştu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/kadro"), 1200);
    } catch {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-white/60 hover:text-[#ffc451] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
              <UserPlus className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Yeni Kadro Ekle</h1>
              <p className="text-white/60 text-lg mt-1">Kişi bilgilerini doldurun</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {success && <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">Kadro başarıyla eklendi!</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Profil Fotoğrafı</h2>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Önizleme" className="h-32 w-32 rounded-xl object-cover border border-[#333]" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 hover:bg-red-600 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-[#333] bg-[#0f0f0f]">
                    <Upload className="h-8 w-8 text-white/20" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label htmlFor="image-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#333] bg-transparent px-4 py-2 text-sm transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451]/10">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Yükleniyor..." : "Fotoğraf Seç"}
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                <p className="mt-2 text-xs text-white/40">JPG, PNG veya WEBP. Maksimum 5MB.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">Temel Bilgiler</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  İsim <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="Örn: Ali Veli"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Pozisyon</label>
                <input
                  name="position"
                  placeholder="Örn: Genel Yayın Yönetmeni"
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Biyografi</label>
                <textarea
                  name="biography"
                  rows={6}
                  placeholder="Kısa biyografi..."
                  className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Ekleniyor..." : "Kadro Ekle"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-[#333] bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/5"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
