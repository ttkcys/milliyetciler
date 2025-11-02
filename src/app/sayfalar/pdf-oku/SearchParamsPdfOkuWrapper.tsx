"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Route } from "next";
import PDFFlipBook from "../../../scripts/PDFFlipBook";

/* ----------------- Helpers ----------------- */
function normalizePublicPath(p?: string | null) {
  if (!p) return null;
  let s = String(p).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, "");
  s = s.replace(/^\/+/, "");
  s = s.replace(/^public\/+/, "");
  s = s.replace(/^pdfs\//i, "pdf/");
  return "/" + s.split("/").map(encodeURIComponent).join("/");
}

function extractIssueNo(sayi_num: string) {
  const m = String(sayi_num || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 1;
}

function pdfFromRule(dergiIsim: string, sayiNo: number) {
  const enc = encodeURIComponent((dergiIsim || "").trim());
  return `/pdf/${enc}/${enc}_${sayiNo}_compressed.pdf`;
}

/* ----------------- Types ----------------- */
type Sayi = {
  id: number;
  dergi_id: number;
  sayi_num: string;
  pdf: string | null;
};
type Dergi = { id: number; isim: string };

/* ----------------- Page (client) ----------------- */
export default function SearchParamsPdfOkuWrapper() {
  const sp = useSearchParams();
  const router = useRouter();
  const id = sp.get("id") || "";

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        if (!id) {
          setErr("Geçersiz istek");
          return;
        }
        const rS = await fetch(`/api/sayis/${id}`, { cache: "no-store" });
        if (!rS.ok) throw new Error("Sayı bulunamadı");
        const sayi = (await rS.json()) as Sayi;

        const rD = await fetch(`/api/dergis/${sayi.dergi_id}`, { cache: "no-store" });
        if (!rD.ok) throw new Error("Dergi bulunamadı");
        const dergi = (await rD.json()) as Dergi;

        const dbPdf = normalizePublicPath(sayi.pdf || undefined);
        const rulePdf = pdfFromRule(dergi.isim, extractIssueNo(sayi.sayi_num));
        const pdfPath = dbPdf || rulePdf;

        const abs = new URL(pdfPath, window.location.origin).href;
        if (!cancel) setPdfUrl(abs);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || "PDF yüklenemedi");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) router.replace("/" as Route);
  }, [id, router]);

  if (err) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {err}
      </div>
    );
  }
  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Yükleniyor…
      </div>
    );
  }

  return <PDFFlipBook pdfUrl={pdfUrl} width={720} height={920} />;
}
