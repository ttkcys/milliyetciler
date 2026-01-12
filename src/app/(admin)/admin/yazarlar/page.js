"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminYazarlarPage() {
  const router = useRouter();
  const [yazarlar, setYazarlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE || "").replace(
    /\/+$/,
    ""
  );
  const limit = 20;

  const storageUrl = (p) => {
    if (!p) return "";
    const clean = String(p).trim().replace(/^\/+/, "");
    return `${ASSET_BASE}/storage/${clean}`;
  };

  useEffect(() => {
    fetchYazarlar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  async function fetchYazarlar() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
      });

      const res = await fetch(`${API_BASE}/yazars?${params.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setYazarlar(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Yazarlar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bu yazarı silmek istediğinizden emin misiniz?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`${API_BASE}/yazars/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchYazarlar();
      } else {
        alert("Yazar silinirken hata oluştu");
      }
    } catch (err) {
      alert("Ağ hatası");
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
                <Users className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Yazarlar</h1>
                <p className="text-white/60 text-lg mt-1">
                  Toplam {total} yazar
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/admin/yazarlar/ekle")}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ffc451]/30"
            >
              <Plus className="w-4 h-4" />
              Yeni Yazar Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Yazar ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[#333] bg-[#141414] pl-12 pr-4 py-3 text-sm outline-none transition-colors focus:border-[#ffc451]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#333] border-t-[#ffc451]" />
          </div>
        ) : yazarlar.length === 0 ? (
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <p className="text-white/60">
              {searchTerm
                ? "Arama sonucu bulunamadı"
                : "Henüz yazar eklenmemiş"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {yazarlar.map((yazar) => (
              <div
                key={yazar.id}
                className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 transition-all duration-300 hover:border-[#ffc451]/30"
              >
                <div className="flex items-start gap-6">
                  {/* Yazar Fotoğrafı */}
                  <div className="flex-shrink-0">
                    {yazar.image ? (
                      <img
                        src={storageUrl(yazar.image)}
                        alt={yazar.isim}
                        className="h-20 w-20 rounded-xl object-cover border border-[#333]"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#333] bg-[#0f0f0f]">
                        <ImageIcon className="h-8 w-8 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Yazar Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[#ffc451] mb-2">
                      {yazar.isim}
                    </h3>

                    {(yazar.dogum || yazar.olum) && (
                      <p className="text-sm text-white/60 mb-2">
                        {yazar.dogum && `d. ${yazar.dogum}`}
                        {yazar.dogum && yazar.olum && " — "}
                        {yazar.olum && `ö. ${yazar.olum}`}
                      </p>
                    )}

                    {yazar.biyografi && (
                      <p className="text-sm text-white/80 line-clamp-2">
                        {yazar.biyografi}
                      </p>
                    )}

                    {yazar.parent && (
                      <p className="text-xs text-white/40 mt-2">
                        Parent: {yazar.parent}
                      </p>
                    )}
                    {yazar.childs && (
                      <p className="text-xs text-white/40">
                        Childs: {yazar.childs}
                      </p>
                    )}
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/yazarlar/duzenle?id=${yazar.id}`)
                      }
                      className="rounded-lg border border-[#333] bg-transparent p-2 transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451]/10"
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(yazar.id)}
                      disabled={deleting === yazar.id}
                      className="rounded-lg border border-[#333] bg-transparent p-2 transition-all duration-300 hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      title="Sil"
                    >
                      {deleting === yazar.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#333] border-t-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-[#333] bg-transparent px-4 py-2 text-sm transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451]/10 disabled:opacity-30"
            >
              Önceki
            </button>

            <span className="px-4 py-2 text-sm text-white/60">
              Sayfa {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-[#333] bg-transparent px-4 py-2 text-sm transition-all duration-300 hover:border-[#ffc451] hover:bg-[#ffc451]/10 disabled:opacity-30"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
