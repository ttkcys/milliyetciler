import { Suspense } from "react";
import SearchParamsSignUpWrapper from "./SearchParamsSignUpWrapper";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black opacity-85 text-white flex items-center justify-center">
          Yükleniyor…
        </div>
      }
    >
      <SearchParamsSignUpWrapper />
    </Suspense>
  );
}
