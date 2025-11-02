import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNullable(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === "" || v === undefined ? null : v;
  }
  return out;
}

/** GET /api/yazis/:id — AuthorWork ile hizalı kolonlar */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const [rows] = await pool.query(
      `
      SELECT
        y.id,
        y.baslik,
        NULL        AS alt_baslik,
        y.sayi_id,
        s.dergi_id,
        d.isim      AS dergi_isim,
        s.sayi_num,
        s.ay,
        s.yil,
        y.sayfa_num AS sayfa,
        y.created_at,
        y.updated_at
      FROM yazis y
      LEFT JOIN sayis  s ON s.id = y.sayi_id
      LEFT JOIN dergis d ON d.id = s.dergi_id
      WHERE y.id = ?
      LIMIT 1
      `,
      [id]
    );
    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ message: "Yazı bulunamadı" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("GET /api/yazis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PUT /api/yazis/:id — tam güncelle */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = toNullable(await req.json().catch(() => ({})));

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
      `UPDATE yazis
          SET sayi_id = ?,
              yazar_id = ?,
              baslik = ?,
              sayfa_num = ?,
              updated_at = NOW()
        WHERE id = ?`,
      [sayi_id, yazar_id, baslik, sayfa_num, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Yazı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id, message: "Yazı güncellendi" });
  } catch (err) {
    console.error("PUT /api/yazis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PATCH /api/yazis/:id — kısmi güncelle */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = toNullable(await req.json().catch(() => ({})));

    const allowed = ["sayi_id", "yazar_id", "baslik", "sayfa_num"] as const;
    const fields = Object.keys(body).filter((k) => allowed.includes(k as any));
    if (fields.length === 0) {
      return NextResponse.json({ message: "Güncellenecek alan yok" }, { status: 400 });
    }

    const sets = fields.map((f) => `${f} = ?`).join(", ") + ", updated_at = NOW()";
    const paramsArr = fields.map((f) => (body as any)[f]);
    paramsArr.push(id);

    const [result] = await pool.query(`UPDATE yazis SET ${sets} WHERE id = ?`, paramsArr);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Yazı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id, message: "Yazı güncellendi" });
  } catch (err) {
    console.error("PATCH /api/yazis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** DELETE /api/yazis/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const [result] = await pool.query("DELETE FROM yazis WHERE id = ?", [id]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Yazı bulunamadı" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/yazis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
