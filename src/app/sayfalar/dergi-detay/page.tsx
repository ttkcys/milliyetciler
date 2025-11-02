// src/app/sayfalar/dergi-detay/page.tsx
"use client";

import { Suspense } from "react";
import Inner from "./_inner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
    return (
        <Suspense fallback={null}>
            <Inner />
        </Suspense>
    );
}
