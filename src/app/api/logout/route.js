import { NextResponse } from "next/server";

// İSTEĞİN: POST /api/logout  -> uid çerezini siler
export async function POST() {
  const res = NextResponse.json({ message: "Çıkış yapıldı" });
  res.cookies.set("uid", "", { maxAge: 0, path: "/" });
  return res;
}
