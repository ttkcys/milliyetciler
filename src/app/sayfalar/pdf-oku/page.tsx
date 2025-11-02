import { Suspense } from "react";
import SearchParamsPdfOkuWrapper from "./SearchParamsPdfOkuWrapper";

export default function PdfOkuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Yükleniyor…
        </div>
      }
    >
      <SearchParamsPdfOkuWrapper />
    </Suspense>
  );
}
