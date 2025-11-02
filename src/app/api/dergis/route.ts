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

/** GET /api/dergis?search=&page=1&limit=20 */
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
      where = `
        WHERE
          isim        LIKE ? OR
          alt_baslik  LIKE ? OR
          slogan      LIKE ? OR
          aciklama    LIKE ? OR
          imtiyaz     LIKE ? OR
          yazi_mudur  LIKE ? OR
          basim_yeri  LIKE ?
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like, like);
    }

    const [rows] = await pool.query(
      `SELECT
         id, isim, alt_baslik, slogan, aciklama,
         imtiyaz, yazi_mudur, cikis, bitis, basim_yeri,
         toplam_sayi, eksikler, telif, created_at, updated_at
       FROM dergis
       ${where}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM dergis ${where}`,
      params
    );
    const total = (countRows as any)[0]?.total ?? 0;

    return NextResponse.json({ page, limit, total, data: rows });
  } catch (err) {
    console.error("GET /api/dergis error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** POST /api/dergis */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      isim, alt_baslik, slogan, aciklama,
      imtiyaz, yazi_mudur, cikis, bitis, basim_yeri,
      toplam_sayi, eksikler, telif
    } = body || {};

    if (!isim || typeof isim !== "string") {
      return NextResponse.json({ message: "`isim` zorunludur" }, { status: 400 });
    }

    const data = toNullable({
      isim, alt_baslik, slogan, aciklama,
      imtiyaz, yazi_mudur, cikis, bitis, basim_yeri,
      toplam_sayi, eksikler, telif
    });

    const [result] = await pool.query(
      `INSERT INTO dergis
        (isim, alt_baslik, slogan, aciklama,
         imtiyaz, yazi_mudur, cikis, bitis, basim_yeri,
         toplam_sayi, eksikler, telif, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.isim, data.alt_baslik, data.slogan, data.aciklama,
        data.imtiyaz, data.yazi_mudur, data.cikis, data.bitis, data.basim_yeri,
        data.toplam_sayi, data.eksikler, data.telif
      ]
    );

    const insertId = (result as any).insertId;
    return NextResponse.json({ id: insertId, message: "Dergi eklendi" }, { status: 201 });
  } catch (err) {
    console.error("POST /api/dergis error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
