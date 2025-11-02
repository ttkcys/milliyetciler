import { NextNextRequest, NextResponse } from "next/server";
import pool from "../../../db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNullable(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === "" || v === undefined ? null : v;
  }
  return out;
}

function normalizeImagePathForDB(v?: string | null) {
  if (!v) return null;
  let s = String(v).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, ""); // domain varsa at
  s = s.replace(/^\/+/, "");                 // baştaki /'ları at
  if (!s.startsWith("yazarlar/")) s = `yazarlar/${s}`;
  return s;
}

/** GET /api/yazars?search=&page=1&limit=20 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(parseInt(sp.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "20", 10), 1), 200);
    const offset = (page - 1) * limit;
    const search = (sp.get("search") || "").trim();

    let where = "";
    const params: any[] = [];
    if (search) {
      where = "WHERE isim LIKE ? OR biyografi LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
      `SELECT
         id, isim, biyografi, dogum, olum, parent, childs, image, created_at, updated_at
       FROM yazars
       ${where}
       ORDER BY
         (
           (CASE WHEN NULLIF(TRIM(image), '') IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN NULLIF(TRIM(dogum), '') IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN NULLIF(TRIM(olum),  '') IS NOT NULL THEN 1 ELSE 0 END)
         ) DESC,
         id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM yazars ${where}`, params);
    const total = (countRows as any)[0]?.total ?? 0;

    return NextResponse.json({ page, limit, total, data: rows });
  } catch (err) {
    console.error("GET /api/yazars error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** POST /api/yazars */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { isim, biyografi, dogum, olum, parent, childs } = body || {};
    let { image } = body || {};

    if (!isim || typeof isim !== "string") {
      return NextResponse.json({ message: "`isim` zorunludur" }, { status: 400 });
    }

    image = normalizeImagePathForDB(image);

    const data = toNullable({ isim, biyografi, dogum, olum, parent, childs, image });

    const [result] = await pool.query(
      `INSERT INTO yazars
        (isim, biyografi, dogum, olum, parent, childs, image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [data.isim, data.biyografi, data.dogum, data.olum, data.parent, data.childs, data.image]
    );

    const insertId = (result as any).insertId;
    return NextResponse.json({ id: insertId, message: "Yazar eklendi" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/yazars error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
