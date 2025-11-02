// SERVER COMPONENT
import { Suspense } from "react";
import SearchParamsSayiWrapper from "./SearchParamsSayiWrapper";

export default function DergiSayiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Yükleniyor…
      </div>
    }>
      <SearchParamsSayiWrapper />
    </Suspense>
  );
}
