// src/app/api/yazis/route.ts
import { NextRequest, NextResponse } from "next/server";
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

/**
 * GET /api/yazis
 * Query:
 *  - page, limit
 *  - search    (baslik LIKE)
 *  - yazar_id  (=)
 *  - sayi_id   (=)
 *  - dergi_id  (JOIN sayis.dergi_id =)
 *  - sort: recent (default) | page-asc | page-desc
 *
 * Dönen kolonlar:
 *  id, baslik, alt_baslik, dergi_id, dergi_isim, sayi_id, sayi_num, ay, yil, sayfa,
 *  yazar_id, yazar_isim
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "20", 10), 1), 200);
    const offset = (page - 1) * limit;

    const search = (sp.get("search") || "").trim();
    const yazarId = sp.get("yazar_id");
    const sayiId  = sp.get("sayi_id");
    const dergiId = sp.get("dergi_id");
    const sort    = (sp.get("sort") || "recent") as "recent" | "page-asc" | "page-desc";

    const where: string[] = [];
    const params: any[] = [];

    if (search) { where.push("y.baslik LIKE ?"); params.push(`%${search}%`); }
    if (yazarId) { where.push("y.yazar_id = ?"); params.push(Number(yazarId)); }
    if (sayiId)  { where.push("y.sayi_id = ?");  params.push(Number(sayiId));  }
    if (dergiId) { where.push("s.dergi_id = ?"); params.push(Number(dergiId)); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    let orderSql = "ORDER BY y.updated_at DESC, y.id DESC";
    if (sort === "page-asc")  orderSql = "ORDER BY y.sayfa_num ASC, y.id ASC";
    if (sort === "page-desc") orderSql = "ORDER BY y.sayfa_num DESC, y.id DESC";

    const [rows] = await pool.query(
      `
      SELECT
        y.id,
        y.baslik,
        NULL          AS alt_baslik,
        y.sayi_id,
        s.dergi_id,
        d.isim        AS dergi_isim,
        s.sayi_num,
        s.ay,
        s.yil,
        y.sayfa_num   AS sayfa,
        y.yazar_id,
        a.isim        AS yazar_isim,
        y.created_at,
        y.updated_at
      FROM yazis y
      LEFT JOIN sayis  s ON s.id = y.sayi_id
      LEFT JOIN dergis d ON d.id = s.dergi_id
      LEFT JOIN yazars a ON a.id = y.yazar_id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM yazis y
      LEFT JOIN sayis s ON s.id = y.sayi_id
      ${whereSql}
      `,
      params
    );

    const total = (countRows as any)[0]?.total ?? 0;
    return NextResponse.json({ page, limit, total, data: rows });
  } catch (err) {
    console.error("GET /api/yazis error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * POST /api/yazis
 * Body: { sayi_id (req), yazar_id (req), baslik (req), sayfa_num? }
 */
export async function POST(req: NextRequest) {
  try {
    const bodyRaw = await req.json().catch(() => ({}));
    const body = toNullable(bodyRaw);

    const sayi_id   = Number(body.sayi_id);
    const yazar_id  = Number(body.yazar_id);
    const baslik    = body.baslik ? String(body.baslik) : null;
    const sayfa_num = body.sayfa_num != null ? Number(body.sayfa_num) : null;

    if (!sayi_id || !yazar_id || !baslik) {
      return NextResponse.json(
        { message: "`sayi_id`, `yazar_id` ve `baslik` zorunludur" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO yazis (sayi_id, yazar_id, baslik, sayfa_num, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [sayi_id, yazar_id, baslik, sayfa_num]
    );

    return NextResponse.json({ id: (result as any).insertId, message: "Yazı eklendi" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/yazis error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
