// SERVER COMPONENT
import { Suspense } from "react";
import SearchParamsYazarWrapper from "./SearchParamsYazarWrapper";

export default function YazarDetayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Yükleniyor…
        </div>
      }
    >
      <SearchParamsYazarWrapper />
    </Suspense>
  );
}
