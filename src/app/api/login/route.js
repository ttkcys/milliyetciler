import { NextResponse } from "next/server";
import pool from "../../../db/connect";

// İSTEĞİN: POST /api/login  { email, password }
export async function POST(req) {
  try {
    const { email, password } = await req.json().catch(() => ({}));

    if (!email || !password) {
      return NextResponse.json({ message: "E-posta ve şifre zorunlu." }, { status: 400 });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows?.[0];

    if (!user) {
      return NextResponse.json({ message: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    // NOT: Eğer şifreler hash'liyse bcrypt ile karşılaştır:
    // import bcrypt from "bcryptjs";
    // const ok = await bcrypt.compare(password, user.password);
    // if (!ok) return NextResponse.json({ message: "E-posta veya şifre hatalı." }, { status: 401 });

    // Şimdilik DÜZ karşılaştırma (veritabanında düz şifre varsa):
    if (user.password !== password) {
      return NextResponse.json({ message: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    // Oturum için basit cookie (uid). Prod'da imzalı token önerilir.
    const res = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Giriş başarılı",
    });

    res.cookies.set("uid", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return res;
  } catch (err) {
    console.error("POST /api/login error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
