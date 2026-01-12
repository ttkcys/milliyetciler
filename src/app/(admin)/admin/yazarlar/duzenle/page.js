"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCog, ArrowLeft, Upload, X } from "lucide-react";

export default function AdminYazarEditPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const yazarId = sp.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [imageChanged, setImageChanged] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE || "").replace(
    /\/+$/,
    ""
  );

  const storageUrl = (p) => {
    if (!p) return "";
    const clean = String(p).trim().replace(/^\/+/, "");
    return `${ASSET_BASE}/storage/${clean}`;
  };

  const [formData, setFormData] = useState({
    isim: "",
    biyografi: "",
    dogum: "",
    olum: "",
    parent: "",
    childs: "",
  });

  // ✅ TEK fetch yeterli
  useEffect(() => {
    if (!yazarId) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/yazars/${yazarId}`, {
          credentials: "include",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          setError("Yazar bulunamadı");
          return;
        }

        const data = await res.json();

        setFormData({
          isim: data.isim || "",
          biyografi: data.biyografi || "",
          dogum: data.dogum || "",
          olum: data.olum || "",
          parent: data.parent || "",
          childs: data.childs || "",
        });

        if (data.image) {
          setImagePath(data.image);
          setImagePreview(storageUrl(data.image)); // ✅ düzeldi
        } else {
          setImagePath("");
          setImagePreview(null);
        }
      } catch (e) {
        if (e.name !== "AbortError") setError("Yazar yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [yazarId, API_BASE, ASSET_BASE]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Sadece resim dosyaları yüklenebilir");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "yazar");

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
      setImagePreview(storageUrl(data.path)); // ✅ düzeldi
      setImageChanged(true);
    } catch (err) {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setImagePath("");
    setImagePreview(null);
    setImageChanged(true);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    setSaving(true);

    const data = {
      isim: formData.isim.trim() || null,
      biyografi: formData.biyografi.trim() || null,
      dogum: formData.dogum.trim() || null,
      olum: formData.olum.trim() || null,
      parent: formData.parent.trim() || null,
      childs: formData.childs.trim() || null,
      image: imagePath || null,
    };

    if (!data.isim) {
      setError("Yazar ismi zorunludur.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/yazars/${yazarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Yazar güncellenirken hata oluştu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/yazarlar"), 1500);
    } catch (err) {
      setError("Ağ hatası. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-[#333] border-t-[#ffc451]" />
          <p className="text-white/60">Yazar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
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
              <UserCog className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Yazar Düzenle</h1>
              <p className="text-white/60 text-lg mt-1">
                {formData.isim || "Yazar bilgilerini güncelleyin"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            Yazar başarıyla güncellendi! Yönlendiriliyorsunuz...
          </div>
        )}

        <div className="space-y-6">
          {/* Profil Fotoğrafı */}
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6">
            <h2 className="text-xl font-bold mb-4 text-[#ffc451]">
              Profil Fotoğrafı
            </h2>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Önizleme"
                      className="h-32 w-32 rounded-xl object-cover border border-[#333]"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 hover:bg-red-600 transition-colors"
                    >
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
                <label
                  htmlFor="image-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#333] bg-transparent px-4 py-2 text-sm transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451]/10"
                >
                  <Upload className="h-4 w-4" />
                  {uploading
                    ? "Yükleniyor..."
                    : imagePreview
                    ? "Fotoğrafı Değiştir"
                    : "Fotoğraf Seç"}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-white/40">
                  JPG, PNG veya WEBP. Maksimum 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Temel Bilgiler vs... (senin mevcut JSX aynen kalsın) */}

          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
            </button>

            <button
              onClick={() => router.back()}
              className="rounded-full border border-[#333] bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/5"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
