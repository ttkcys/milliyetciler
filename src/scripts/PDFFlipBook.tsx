"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "../styles/flipbook.min.css";

declare global {
  interface Window {
    THREE?: any; // three.js global
    FlipBook?: new (container: HTMLElement, options: FlipBookOptions) => FlipBookInstance;
  }
}

interface FlipBookOptions {
  pdfUrl: string;
  viewMode?: "webgl" | "3d" | "2d" | "swipe";
  responsiveView?: boolean;
  singlePageMode?: boolean;
  zoomMin?: number;
  zoomStep?: number;
  rightToLeft?: boolean;
  sound?: boolean;
  pageTextureSize?: number;
  assets?: {
    preloader?: string;
    overlay?: string;
    flipMp3?: string;
    spinner?: string;
  };
}

interface FlipBookInstance {
  on(event: "ready" | "error", callback: (e?: any) => void): void;
}

type Props = { pdfUrl: string; width?: number; height?: number };

export default function PDFFlipBook({ pdfUrl, width = 600, height = 800 }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  // 7 script yüklüyoruz (three + 6 flipbook dosyası)
  const totalScripts = 7;

  useEffect(() => {
    if (!hostRef.current) return;
    if (scriptsLoaded < totalScripts) return;
    if (ready) return;

    if (!window.THREE) {
      setErr("Three.js yüklenemedi (window.THREE yok)");
      return;
    }
    if (!window.FlipBook || typeof window.FlipBook !== "function") {
      setErr("Flipbook kütüphanesi yüklenemedi (window.FlipBook yok)");
      return;
    }

    try {
      const flipbook = new window.FlipBook(hostRef.current, {
        pdfUrl,
        viewMode: "webgl",         // "3d" / "2d" / "swipe"
        responsiveView: true,
        singlePageMode: false,
        zoomMin: 0.95,
        zoomStep: 2,
        rightToLeft: false,
        sound: true,
        pageTextureSize: 2048,
        assets: {
          preloader: "/assets/images/preloader.jpg",
          overlay: "/assets/images/shadow.png",
          flipMp3: "/assets/mp3/turnPage.mp3",
          spinner: "/assets/images/spinner.gif",
        },
      });

      flipbook.on("ready", () => setReady(true));
      flipbook.on("error", (e: any) => {
        const msg =
          e?.message ??
          (typeof e === "string" ? e : JSON.stringify(e, null, 2) || "Bilinmeyen hata");
        setErr(msg);
      });
    } catch (e: any) {
      setErr(e?.message || "Flipbook başlatılamadı");
    }
  }, [pdfUrl, scriptsLoaded, ready]);

  const onScriptLoad = () => setScriptsLoaded((n) => n + 1);

  return (
    <div className="fixed inset-0 bg-[#111] flex items-center justify-center">
      <div
        ref={hostRef}
        className="relative flex items-center justify-center"
        style={{ width: `${width}px`, height: `${height}px` }}
      />

      {!ready && !err && (
        <div className="absolute inset-0 flex items-center justify-center text-white">Yükleniyor…</div>
      )}
      {err && (
        <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm whitespace-pre-wrap px-4 text-center">
          {err}
        </div>
      )}

      {/* SIRA ÖNEMLİ — three.js en önce */}
      <Script src="/js/three.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />


      <Script src="/js/flipbook.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />
      <Script src="/js/flipbook.pdfservice.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />
      <Script src="/js/flipbook.webgl.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />
      <Script src="/js/flipbook.book3.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />
      <Script src="/js/flipbook.swipe.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />
      <Script src="/js/flipbook.scroll.min.js" strategy="afterInteractive" onLoad={onScriptLoad} />

    </div>
  );
}
