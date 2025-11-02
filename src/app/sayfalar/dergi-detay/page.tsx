// SERVER COMPONENT (default)
import { Suspense } from "react";
import SearchParamsWrapper from "./SearchParamsWrapper";

export default function DergiDetayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor…</div>}>
      <SearchParamsWrapper />
    </Suspense>
  );
}
