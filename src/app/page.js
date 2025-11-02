import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <style>{`
        /* Tema */
        :root {
          --background: #ffffff;
          --foreground: #171717;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --background: #0a0a0a;
            --foreground: #ededed;
          }
        }

        /* Arka plan */
        body {
          background-color: var(--background);
          color: var(--foreground);
        
        }

        /* Animasyon keyframes */
        @keyframes fadeUpImage {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink {
          0%, 100% {
            border-right-color: transparent;
          }
          50% {
            border-right-color: currentColor;
          }
        }

        @keyframes removeBorder {
          to {
            border-right-color: transparent;
          }
        }

        /* Animasyon sınıfları */
        .animate-fadeUpImage {
          animation: fadeUpImage 1s ease-out forwards;
          opacity: 0;
        }

        .animate-typing {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid;
          width: 0;
          animation: 
            typing 2s steps(19) 1.2s forwards,
            blink 1s step-end 3.2s 2,
            removeBorder 0s 5.2s forwards;
        }
      `}</style>

      <main className="flex flex-col items-center justify-center gap-8 text-center">
        {/* Logo - Aşağıdan yukarı animasyon */}
        <div className="animate-fadeUpImage">
          <img
            src="/logo/logo.png"
            alt="Milliyetçi Dergiler Logosu"
            width="240"
            height="72"
            className="drop-shadow-md"
            style={{ maxWidth: "240px", height: "auto" }}
          />
        </div>

        {/* Başlık - Daktilo efekti */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm leading-tight">
          <span className="animate-typing">Milliyetçi Dergiler</span>
        </h1>
      </main>
    </div>
  );
}
