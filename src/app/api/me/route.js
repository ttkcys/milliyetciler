import { NextResponse } from "next/server";
import pool from "../../../db/connect";

function sanitize(row) {
  if (!row) return row;
  delete row.password;
  delete row.remember_token;
  delete row.email_verified_at;
  return row;
}

// İSTEĞİN: GET /api/me  -> cookie'deki uid ile aktif kullanıcıyı döner
export async function GET(req) {
  try {
    const uid = req.cookies.get("uid")?.value;
    if (!uid) {
      return NextResponse.json({ message: "Oturum yok" }, { status: 401 });
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, level, isCan,
              lDergi, lSayi, lYazar,
              tel, adres, meslek, kurum, kullanim, biyografi,
              created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [Number(uid)]
    );

    const user = rows?.[0];
    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(sanitize(user));
  } catch (err) {
    console.error("GET /api/me error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
