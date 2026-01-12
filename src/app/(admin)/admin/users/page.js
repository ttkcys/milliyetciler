"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,ArrowLeft  } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [isCanFilter, setIsCanFilter] = useState("");
  
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

  const totalPages = Math.ceil(total / limit);

  async function fetchUsers() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (levelFilter) params.append("level", levelFilter);
      if (isCanFilter) params.append("isCan", isCanFilter);

      const res = await fetch(`${API_BASE}/users?${params}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Kullanıcılar yüklenemedi");
      }

      const data = await res.json();
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page, search, levelFilter, isCanFilter]);

  async function handleDelete(id, name) {
    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Kullanıcı silinemedi");
      }

      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  const getLevelBadge = (level) => {
    const levels = {
      1: { label: "Admin", color: "bg-red-500/20 text-red-300 border-red-500/30" },
      2: { label: "Moderatör", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      3: { label: "Kullanıcı", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    };
    const item = levels[level] || { label: "Bilinmiyor", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
    return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${item.color}`}>{item.label}</span>;
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="relative overflow-hidden  border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,196,81,0.1),transparent_50%)]" />
   <div className="relative mx-auto max-w-7xl px-6 py-12">
  {/* ÜST SATIR: Geri Dön */}
  <button
    onClick={() => router.back()}
    className="mb-6 flex items-center gap-2 text-white/60 hover:text-[#ffc451] transition-colors"
  >
    <ArrowLeft className="w-4 h-4" />
    <span>Geri Dön</span>
  </button>

  {/* ALT SATIR: Başlık + Sağ Buton */}
  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/20">
        <Users className="w-8 h-8 text-[#1a1a1a]" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-4xl font-bold">Kullanıcılar</h1>
        <p className="text-white/60 text-lg mt-1">Toplam {total} kullanıcı</p>
      </div>
    </div>

    <button
      onClick={() => router.push("/admin/users/add")}
      className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffc451] to-[#ffb020] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#ffc451]/30"
    >
      <Plus className="w-4 h-4" />
      Yeni Kullanıcı
    </button>
  </div>
</div>

      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="İsim veya e-posta ile ara..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-[#333] bg-[#141414] pl-10 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-[#ffc451]"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#ffc451]"
              >
                <option value="">Tüm Seviyeler</option>
                <option value="1">Admin</option>
                <option value="2">Moderatör</option>
                <option value="3">Kullanıcı</option>
              </select>
            </div>

            {/* isCan Filter */}
            <div>
              <select
                value={isCanFilter}
                onChange={(e) => {
                  setIsCanFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#333] bg-[#141414] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#ffc451]"
              >
                <option value="">Tüm Durumlar</option>
                <option value="1">Aktif</option>
                <option value="0">Pasif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-6 pb-10">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc451] border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-12 text-center">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333] bg-black/30">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">İsim</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">E-posta</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Seviye</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white/80">{user.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/80">{user.email}</td>
                        <td className="px-6 py-4">{getLevelBadge(user.level)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                            user.isCan === 1
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          }`}>
                            {user.isCan === 1 ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/users/edit?id=${user.id}`)}
                              className="p-2 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#ffc451]/10 hover:border-[#ffc451] transition-all"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4 text-white/60 hover:text-[#ffc451]" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              className="p-2 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-red-500/10 hover:border-red-500 transition-all"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-white/60">
                  Sayfa {page} / {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#ffc451]/10 hover:border-[#ffc451] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            page === pageNum
                              ? "bg-[#ffc451] text-[#1a1a1a]"
                              : "border border-[#333] bg-[#1a1a1a] text-white/60 hover:bg-[#ffc451]/10 hover:border-[#ffc451]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#ffc451]/10 hover:border-[#ffc451] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}