// src/app/api/yazis/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "../../../../db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Record<string, string | string[]> };

function toNullable(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === "" || v === undefined ? null : v;
  }
  return out;
}

/** ctx.params.id → number güvenli çözüm */
function getIdFromCtx(ctx: RouteCtx): number | null {
  const raw = ctx.params?.id;
  const idStr = Array.isArray(raw) ? raw[0] : raw;
  const num = Number(idStr);
  return Number.isFinite(num) ? num : null;
}

/** GET /api/yazis/:id — AuthorWork ile hizalı kolonlar */
export async function GET(_request: Request, context: RouteCtx) {
  try {
    const id = getIdFromCtx(context);
    if (id === null) {
      return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });
    }

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
export async function PUT(request: Request, context: RouteCtx) {
  try {
    const id = getIdFromCtx(context);
    if (id === null) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = toNullable(await request.json().catch(() => ({})));

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
      `UPDATE yazis SET
         sayi_id = ?, yazar_id = ?, baslik = ?, sayfa_num = ?, updated_at = NOW()
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
export async function PATCH(request: Request, context: RouteCtx) {
  try {
    const id = getIdFromCtx(context);
    if (id === null) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = toNullable(await request.json().catch(() => ({})));

    const allowed = ["sayi_id", "yazar_id", "baslik", "sayfa_num"] as const;
    const fields = Object.keys(body).filter((k) => allowed.includes(k as any));
    if (fields.length === 0) {
      return NextResponse.json({ message: "Güncellenecek alan yok" }, { status: 400 });
    }

    // Tür düzeltmeleri (opsiyonel ama güvenli)
    if (fields.includes("sayi_id" as any))  (body as any).sayi_id   = Number((body as any).sayi_id);
    if (fields.includes("yazar_id" as any)) (body as any).yazar_id  = Number((body as any).yazar_id);
    if (fields.includes("sayfa_num" as any)) (body as any).sayfa_num = Number((body as any).sayfa_num);
    if (fields.includes("baslik" as any) && (body as any).baslik != null)
      (body as any).baslik = String((body as any).baslik);

    const sets = fields.map((f) => `${f} = ?`).join(", ") + ", updated_at = NOW()";
    const values = fields.map((f) => (body as any)[f]);
    values.push(id);

    const [result] = await pool.query(`UPDATE yazis SET ${sets} WHERE id = ?`, values);
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
export async function DELETE(_request: Request, context: RouteCtx) {
  try {
    const id = getIdFromCtx(context);
    if (id === null) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

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
