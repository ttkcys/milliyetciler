import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

async function getMe() {
  if (!API_BASE) return null;

  // ✅ cookies() artık async: önce await al
  const cookieStore = await cookies();

  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      // ✅ PHP'ye cookie forward
      cookie: cookieStore.toString(),
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function AdminLayout({ children }) {
  const me = await getMe();

  if (!me) redirect("/giris-yap");
  if (Number(me.level) !== 1) redirect("/");

  return <div className="min-h-screen bg-black/85 text-white">{children}</div>;
}
