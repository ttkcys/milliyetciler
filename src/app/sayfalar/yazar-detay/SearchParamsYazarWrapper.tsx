"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, BookOpen, FileText, LogIn, BadgeInfo } from "lucide-react";

/* ===================== Types ===================== */
type Author = {
  id: number;
  isim: string;
  biyografi: string | null;
  dogum: string | null;
  olum: string | null;
  image: string | null;
  parent?: string | null;
  childs?: any;
};
type AuthorWork = {
  id: number;
  baslik: string;
  alt_baslik: string | null;
  dergi_id: number | null;
  dergi_isim: string | null;
  sayi_id: number | null;
  sayi_num: string | null;
  ay: string | null;
  yil: number | null;
  sayfa: string | null;
  created_at?: string;
  updated_at?: string;
};
type MergedWork = AuthorWork & {
  _sourceAuthorId: number;
  _sourceAuthorName: string;
};
type WorksResponse = { page: number; limit: number; total: number; data: AuthorWork[] };

const MAX_FETCH_LIMIT = 300;
const REDIRECT_DELAY_MS = 1500;

/* ===================== Utils ===================== */
function normalizeAuthorImage(src?: string | null) {
  if (!src) return "/yazarlar/placeholder-author.png";
  if (/^https?:\/\//i.test(src)) return src;
  let clean = src.trim().replace(/^\/+/, "");
  if (!clean.startsWith("yazarlar/")) clean = `yazarlar/${clean}`;
  return `/${clean}`;
}
function yearPart(s?: string | null) {
  if (!s) return null;
  const m = s.match(/\d{4}/);
  return m ? m[0] : null;
}
function formatDonem(dogum?: string | null, olum?: string | null) {
  const d = yearPart(dogum);
  const o = yearPart(olum);
  if (!d && !o) return "—";
  if (d && !o) return `${d} - …`;
  if (!d && o) return `… - ${o}`;
  return `${d} - ${o}`;
}
function isNumericString(s: string) {
  return /^[0-9]+$/.test(s.trim());
}
/** childs alanını (ID / isim / JSON / CSV fark etmeksizin) yakala */
function parseChilds(value: any): { ids: number[]; names: string[] } {
  const ids: number[] = [];
  const names: string[] = [];
  const pushVal = (v: any) => {
    if (v == null) return;
    if (typeof v === "number" && Number.isFinite(v)) { ids.push(v); return; }
    if (typeof v === "string") {
      const s = v.trim(); if (!s) return;
      if (isNumericString(s)) ids.push(Number(s)); else names.push(s); return;
    }
    if (typeof v === "object") {
      const maybeId = (v as any).id;
      const maybeName = (v as any).isim ?? (v as any).name ?? (v as any).title;
      if (Number.isFinite(maybeId)) ids.push(Number(maybeId));
      if (typeof maybeName === "string" && maybeName.trim()) names.push(maybeName.trim());
    }
  };
  try {
    if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) parsed.forEach(pushVal); else pushVal(parsed);
      } catch {
        value.split(",").map((x: string) => x.trim()).filter(Boolean).forEach(pushVal);
      }
      return { ids: Array.from(new Set(ids)), names: Array.from(new Set(names)) };
    }
    if (Array.isArray(value)) { value.forEach(pushVal); return { ids: Array.from(new Set(ids)), names: Array.from(new Set(names)) }; }
    pushVal(value);
    return { ids: Array.from(new Set(ids)), names: Array.from(new Set(names)) };
  } catch {
    return { ids: [], names: [] };
  }
}

/* ===================== Toast ===================== */
type ToastState = {
  show: boolean;
  title?: string;
  message?: string;
  href?: string;
  remainingMs?: number;
};
function Toast({
  state, onClose, onAction,
}: { state: ToastState; onClose?: () => void; onAction?: () => void }) {
  const total = REDIRECT_DELAY_MS;
  const remain = state.remainingMs ?? 0;
  const pct = Math.max(0, Math.min(100, (remain / total) * 100));
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] transition-all duration-300 ${
        state.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      aria-live="assertive"
    >
      <div className="w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-[#353535] bg-[#111] shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5 rounded-xl bg-[#1c1c1c] p-2">
            <LogIn className="h-5 w-5 text-[#ffc451]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{state.title}</div>
            <div className="mt-1 text-sm text-white/80">{state.message}</div>
            <div className="mt-3 flex items-center gap-2">
              {onAction ? (
                <button
                  onClick={onAction}
                  className="rounded-lg border border-[#333] px-3 py-1.5 text-xs hover:border-[#ffc451]"
                >
                  Hemen Giriş Yap
                </button>
              ) : null}
              {state.href ? (
                <div className="text-xs text-white/60">
                  {Math.ceil(remain / 1000)} sn içinde yönlendirileceksiniz
                </div>
              ) : (
                <div className="text-xs text-white/60">Kapanıyor…</div>
              )}
            </div>
          </div>
          {onClose ? (
            <button onClick={onClose} aria-label="Kapat" className="ml-2 rounded-md px-2 py-1 text-white/60 hover:text-white">×</button>
          ) : null}
        </div>
        {state.href ? (
          <div className="h-1 w-full bg-white/10">
            <div className="h-full bg-[#ffc451]" style={{ width: `${pct}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ===================== Client Wrapper (default export) ===================== */
export default function SearchParamsYazarWrapper() {
  const sp = useSearchParams();
  const router = useRouter();

  const idParam = sp.get("id");
  const yazarId = idParam ? Number(idParam) : NaN;

  const [author, setAuthor] = useState<Author | null>(null);
  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const [errAuthor, setErrAuthor] = useState<string | null>(null);

  // Mahlaslar
  const [aliasIds, setAliasIds] = useState<number[]>([]);
  const [aliasNames, setAliasNames] = useState<string[]>([]);
  const [aliasIdToName, setAliasIdToName] = useState<Record<number, string>>({});
  const [includeAliases, setIncludeAliases] = useState(true);

  // Yazılar (birleşik liste)
  const [worksMerged, setWorksMerged] = useState<MergedWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [errWorks, setErrWorks] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [total, setTotal] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [toast, setToast] = useState<ToastState>({ show: false });

  const showLoginRedirect = (authorId: number) => {
    const next = encodeURIComponent(`/yazar-detay?id=${authorId}`);
    const href = `/giris-yap?next=${next}` as any;
    setToast({
      show: true,
      title: "Oturum gerekli",
      message: "Yazarları listenize eklemek için giriş yapmalısınız. Birazdan yönlendirileceksiniz…",
      href,
      remainingMs: REDIRECT_DELAY_MS,
    });
  };

  // toast auto-redirect countdown
  useEffect(() => {
    if (!toast.show) return;
    if (toast.href) {
      setToast((s) => ({ ...s, remainingMs: REDIRECT_DELAY_MS }));
      const startedAt = Date.now();
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remain = Math.max(0, REDIRECT_DELAY_MS - elapsed);
        setToast((s) => ({ ...s, remainingMs: remain }));
      }, 100);
      const target = toast.href;
      timeoutRef.current = window.setTimeout(() => { window.location.assign(target); }, REDIRECT_DELAY_MS);
    } else {
      timeoutRef.current = window.setTimeout(() => { setToast({ show: false }); }, 1500);
    }
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    };
  }, [toast.show, toast.href]);

  /* --------- Yazar detayı + mahlasları yükle --------- */
  useEffect(() => {
    if (!yazarId) return;
    let cancelled = false;
    (async () => {
      setLoadingAuthor(true);
      setErrAuthor(null);
      try {
        const res = await fetch(`/api/yazars/${yazarId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Yazar bulunamadı (${res.status})`);
        const row = (await res.json()) as Author;
        if (cancelled) return;
        setAuthor(row);

        // childs parse
        const { ids, names } = parseChilds(row.childs);
        setAliasIds(ids);
        setAliasNames(names);

        // ID -> isim eşleşmesi
        const idToName: Record<number, string> = {};
        await Promise.all(
          ids.map(async (cid) => {
            try {
              const cr = await fetch(`/api/yazars/${cid}`, { cache: "no-store" });
              if (cr.ok) {
                const cjson = await cr.json();
                idToName[cid] = cjson?.isim || `#${cid}`;
              } else {
                idToName[cid] = `#${cid}`;
              }
            } catch {
              idToName[cid] = `#${cid}`;
            }
          })
        );
        if (!cancelled) setAliasIdToName(idToName);
      } catch (e: any) {
        if (!cancelled) setErrAuthor(e?.message || "Yazar yüklenemedi");
      } finally {
        if (!cancelled) setLoadingAuthor(false);
      }
    })();
    return () => { cancelled = true; };
  }, [yazarId]);

  /* --------- Yazılar (ana + mahlas) birleştir --------- */
  async function fetchWorksForAuthor(aid: number): Promise<AuthorWork[]> {
    const params = new URLSearchParams();
    params.set("yazar_id", String(aid));
    params.set("page", "1");
    params.set("limit", String(MAX_FETCH_LIMIT));
    params.set("sort", "recent");
    const res = await fetch(`/api/yazis?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Yazılar alınamadı (${res.status})`);
    const json: WorksResponse = await res.json();
    return json.data || [];
  }

  useEffect(() => {
    if (!yazarId) return;
    let cancelled = false;
    (async () => {
      setLoadingWorks(true);
      setErrWorks(null);
      try {
        const authorIds = includeAliases ? [yazarId, ...aliasIds] : [yazarId];
        const uniqueIds = Array.from(new Set(authorIds)).filter((n) => Number.isFinite(n));
        const results = await Promise.all(
          uniqueIds.map(async (aid) => {
            const data = await fetchWorksForAuthor(aid);
            const sourceName = aid === yazarId ? (author?.isim || "—") : aliasIdToName[aid] || `#${aid}`;
            const extended: MergedWork[] = data.map((w) => ({ ...w, _sourceAuthorId: aid, _sourceAuthorName: sourceName }));
            return extended;
          })
        );
        let merged = results.flat();

        // updated_at > created_at > id desc
        merged.sort((a, b) => {
          const ax = a.updated_at || a.created_at || "";
          const bx = b.updated_at || b.created_at || "";
          if (ax && bx) return ax < bx ? 1 : ax > bx ? -1 : 0;
          if (ax && !bx) return -1;
          if (!ax && bx) return 1;
          return (b.id || 0) - (a.id || 0);
        });

        if (!cancelled) {
          setWorksMerged(merged);
          setTotal(merged.length);
          setPage(1);
        }
      } catch (e: any) {
        if (!cancelled) setErrWorks(e?.message || "Yazılar yüklenemedi");
      } finally {
        if (!cancelled) setLoadingWorks(false);
      }
    })();
    return () => { cancelled = true; };
  }, [yazarId, includeAliases, aliasIds, aliasIdToName, author?.isim]);

  const donem = useMemo(() => formatDonem(author?.dogum, author?.olum), [author]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedWorks = useMemo(() => {
    const start = (page - 1) * limit;
    return worksMerged.slice(start, start + limit);
  }, [worksMerged, page, limit]);

  // Listeme Ekle
  const handleAddToList = async () => {
    if (!yazarId) return;
    try {
      setAdding(true);
      const meRes = await fetch("/api/me", { cache: "no-store", credentials: "include" });
      if (meRes.status === 401 || meRes.status === 403) { showLoginRedirect(yazarId); return; }
      if (!meRes.ok) {
        setToast({ show: true, title: "Oturum doğrulanamadı", message: "Lütfen tekrar deneyin." });
        setTimeout(() => setToast({ show: false }), 1500);
        return;
      }
      const resp = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind: "author", id: yazarId }),
      });
      if (resp.status === 401 || resp.status === 403) { showLoginRedirect(yazarId); return; }
      if (resp.status === 409) {
        setAdded(true);
        setToast({ show: true, title: "Zaten Listenizde", message: "Bu yazar daha önce eklenmiş." });
        setTimeout(() => setToast({ show: false }), 1500);
        return;
      }
      if (!resp.ok) {
        setToast({ show: true, title: "Hata", message: `Listeye eklenemedi (${resp.status})` });
        setTimeout(() => setToast({ show: false }), 2000);
        return;
      }
      setAdded(true);
      setToast({ show: true, title: "Eklendi", message: "Yazar listenize eklendi." });
      setTimeout(() => setToast({ show: false }), 1500);
    } catch {
      setToast({ show: true, title: "Hata", message: "Beklenmeyen bir hata oluştu." });
      setTimeout(() => setToast({ show: false }), 2000);
    } finally { setAdding(false); }
  };

  if (!idParam || Number.isNaN(yazarId)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/70">
          Geçersiz yazar bağlantısı. Örn: <span className="text-[#ffc451]">/yazar-detay?id=1542</span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white opacity-85">
      {/* Toast */}
      <Toast
        state={toast}
        onClose={() => setToast({ show: false })}
        onAction={toast.href ? () => router.push(toast.href! as any) : undefined}
      />

      {/* Üst Başlık */}
      <div className="border-b border-[#333] py-4">
        <div className="mx-auto max-w-6xl px-4 text-sm">
          <a href="/" className="text-white/60 hover:text-[#ffc451]">Anasayfa</a>
          <span className="text-white/40 mx-1.5">›</span>
          <a href="/yazarlar" className="text-white/60 hover:text-[#ffc451]">Yazarlar</a>
          <span className="text-white/40 mx-1.5">›</span>
          <span className="text-[#ffc451]">{author?.isim || "Yazar"}</span>
        </div>
      </div>

      {/* Yazar Bilgisi */}
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Görsel */}
        <div className="flex-shrink-0 w-full md:w-[300px]">
          <div className="overflow-hidden rounded-xl border border-[#333] bg-[#0f0f0f]">
            {loadingAuthor ? (
              <div className="h-[360px] flex items-center justify-center text-white/50">Yükleniyor…</div>
            ) : errAuthor ? (
              <div className="p-4 text-red-400">{errAuthor}</div>
            ) : (
              <img
                src={normalizeAuthorImage(author?.image)}
                alt={author?.isim || "Yazar"}
                className="w-full h-[450px] object-cover"
              />
            )}
          </div>

          <button
            onClick={handleAddToList}
            disabled={adding || added}
            className="cursor-pointer mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#333] px-3 py-2 text-sm text-white/80 hover:border-[#ffc451] disabled:opacity-50"
          >
            {adding ? "Ekleniyor…" : added ? "Listeye Eklendi" : "Listeme Ekle"}
          </button>
        </div>

        {/* Bilgiler */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{author?.isim || "—"}</h1>
          <div className="flex items-center gap-2 text-white/70 mb-4">
            <Calendar className="w-4 h-4 text-[#ffc451]" />
            <span>{donem}</span>
          </div>

          {/* Mahlaslar (rozetler) */}
          {(aliasIds.length > 0 || aliasNames.length > 0) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <BadgeInfo className="w-4 h-4 text-[#ffc451]" />
                <span>Mahlasları</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aliasIds.map((cid) => (
                  <span
                    key={`alias-id-${cid}`}
                    className="inline-flex items-center rounded-full border border-[#333] bg-[#101010] px-3 py-1 text-xs text-white/85"
                    title={`ID: ${cid}`}
                  >
                    {aliasIdToName[cid] ? aliasIdToName[cid] : `#${cid}`}
                  </span>
                ))}
                {aliasNames.map((nm, i) => (
                  <span
                    key={`alias-name-${i}`}
                    className="inline-flex items-center rounded-full border border-[#333] bg-[#101010] px-3 py-1 text-xs text-white/85"
                  >
                    {nm}
                  </span>
                ))}
              </div>

              <label className="mt-3 inline-flex select-none items-center gap-2 text-xs text-white/80">
                <input
                  type="checkbox"
                  className="accent-[#ffc451]"
                  checked={includeAliases}
                  onChange={(e) => setIncludeAliases(e.target.checked)}
                />
                Mahlaslarla birlikte yazıları göster
              </label>
            </div>
          )}

          <div className="rounded-xl border border-[#333] bg-[#0f0f0f] p-5 leading-7 text-white/85 whitespace-pre-line">
            {loadingAuthor ? "Biyografi yükleniyor…" : (author?.biyografi || "Biyografi eklenmemiş.")}
          </div>
        </div>
      </div>

      {/* Yazılar */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ffc451]" />
          Yazıları ({total})
        </h2>

        {errWorks ? (
          <div className="text-red-400">{errWorks}</div>
        ) : loadingWorks ? (
          <div className="text-white/70">Yükleniyor…</div>
        ) : pagedWorks.length === 0 ? (
          <div className="text-white/60">Bu yazara ait kayıtlı yazı bulunamadı.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagedWorks.map((w) => (
                <a
                  key={`${w._sourceAuthorId}-${w.id}`}
                  href={w.sayi_id ? `/sayi?id=${w.sayi_id}` : "#"}
                  className="rounded-xl border border-[#333] bg-[#0f0f0f] p-4 hover:border-[#ffc451] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#141414] p-2">
                      <FileText className="w-4 h-4 text-[#ffc451]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium line-clamp-1">{w.baslik}</div>
                      {w._sourceAuthorId !== yazarId && (
                        <div className="mt-1 text-[11px] text-white/60">
                          Mahlas: <span className="text-white/80">{w._sourceAuthorName}</span>
                        </div>
                      )}
                      {w.alt_baslik && (
                        <div className="text-xs text-white/60 line-clamp-1">{w.alt_baslik}</div>
                      )}
                      <div className="mt-1 text-xs text-white/70">
                        {w.dergi_isim && <b>{w.dergi_isim}</b>}
                        {w.sayi_num && <> {w.sayi_num}</>}
                        {w.sayfa && <> {w.sayfa}.Sayfa</>}
                        {(w.ay || w.yil) && <> — {w.ay ? `${w.ay} ` : ""}{w.yil ?? ""}</>}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Sayfalama */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-white/70">
                Toplam {total} kayıt — Sayfa {page}/{Math.max(1, totalPages)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-[#333] px-3 py-1.5 text-sm disabled:opacity-40 hover:border-[#ffc451]"
                >
                  Geri
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-[#333] px-3 py-1.5 text-sm disabled:opacity-40 hover:border-[#ffc451]"
                >
                  İleri
                </button>

                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="rounded-lg border border-[#333] bg-[#0f0f0f] px-2 py-1 text-sm"
                >
                  {[12, 24, 36, 48].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
