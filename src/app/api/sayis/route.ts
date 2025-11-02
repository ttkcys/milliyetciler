import { NextNextRequest, NextResponse } from "next/server";
import pool from "../../../db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** "" veya undefined → NULL */
function toNullable(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === "" || v === undefined ? null : v;
  }
  return out;
}

function normalizePathForDB(v?: string | null) {
  if (!v) return null;
  let s = String(v).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, "");
  s = s.replace(/^\/+/, "");
  return s;
}

/** 
 * GET /api/sayis?dergi_id=&search=&yil=&page=1&limit=20
 * - dergi_id: belirli derginin sayıları
 * - search: sayi_num veya ay (LIKE)
 * - yil: exact match (opsiyonel)
 * - sayfalama
 * - sıralama: yil ASC, sayi_num ASC (aynı ise id ASC)
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page  = Math.max(parseInt(sp.get("page")  || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "20", 10), 1), 200);
    const offset = (page - 1) * limit;

    const dergiId = sp.get("dergi_id");
    const yil     = sp.get("yil");
    const search  = (sp.get("search") || "").trim();

    const whereParts: string[] = [];
    const params: any[] = [];

    if (dergiId) {
      whereParts.push("dergi_id = ?");
      params.push(Number(dergiId));
    }
    if (yil) {
      whereParts.push("yil = ?");
      params.push(Number(yil));
    }
    if (search) {
      whereParts.push("(sayi_num LIKE ? OR ay LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT
         id, dergi_id, sayi_num, ay, yil,
         image, pdf, toplam_sayfa, toplam_yazi,
         created_at, updated_at
       FROM sayis
       ${whereSql}
       ORDER BY
         COALESCE(yil, 0) ASC,
         CAST(REGEXP_REPLACE(sayi_num, '[^0-9]', '') AS UNSIGNED) ASC,
         id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM sayis ${whereSql}`,
      params
    );
    const total = (countRows as any)[0]?.total ?? 0;

    return NextResponse.json({ page, limit, total, data: rows });
  } catch (err) {
    console.error("GET /api/sayis error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * POST /api/sayis
 * body:
 * {
 *   dergi_id (zorunlu, number),
 *   sayi_num (zorunlu, string),
 *   ay?, yil?,
 *   image?, pdf?,           // Örn: "pdfImage/Altın Işık/Altın Işık_1.jpg"  /  "pdf/Altın Işık/Altın Işık_1_compressed.pdf"
 *   toplam_sayfa?, toplam_yazi?
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      dergi_id, sayi_num, ay, yil,
      image, pdf, toplam_sayfa, toplam_yazi
    } = body || {};

    if (!dergi_id || !sayi_num) {
      return NextResponse.json(
        { message: "`dergi_id` ve `sayi_num` zorunludur" },
        { status: 400 }
      );
    }

    const data = toNullable({
      dergi_id: Number(dergi_id),
      sayi_num: String(sayi_num),
      ay: ay ?? null,
      yil: yil ?? null,
      image: normalizePathForDB(image),
      pdf: normalizePathForDB(pdf),
      toplam_sayfa: toplam_sayfa ?? null,
      toplam_yazi: toplam_yazi ?? null,
    });

    const [result] = await pool.query(
      `INSERT INTO sayis
        (dergi_id, sayi_num, ay, yil,
         image, pdf, toplam_sayfa, toplam_yazi,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.dergi_id, data.sayi_num, data.ay, data.yil,
        data.image, data.pdf, data.toplam_sayfa, data.toplam_yazi
      ]
    );

    const insertId = (result as any).insertId;
    return NextResponse.json({ id: insertId, message: "Sayı eklendi" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sayis error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
