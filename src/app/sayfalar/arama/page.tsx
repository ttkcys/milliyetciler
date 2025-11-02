import { Suspense } from "react";
import SearchParamsAramaWrapper from "./SearchParamsAramaWrapper";

export default function AramaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Yükleniyor…
        </div>
      }
    >
      <SearchParamsAramaWrapper />
    </Suspense>
  );
}
