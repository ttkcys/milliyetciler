// src/app/api/yazars/[id]/route.ts
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

function normalizeImagePathForDB(v?: string | null) {
  if (!v) return null;
  let s = String(v).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, ""); // domain sil
  s = s.replace(/^\/+/, "");                 // baştaki / sil
  if (!s.startsWith("yazarlar/")) s = `yazarlar/${s}`;
  return s;
}

/** ctx.params.id → number güvenli çözüm */
function getIdFromCtx(ctx: RouteCtx): number | null {
  const raw = ctx.params?.id;
  const idStr = Array.isArray(raw) ? raw[0] : raw;
  const num = Number(idStr);
  return Number.isFinite(num) ? num : null;
}

/** GET /api/yazars/:id */
export async function GET(_request: Request, context: RouteCtx) {
  try {
    const num = getIdFromCtx(context);
    if (num === null) {
      return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT id, isim, biyografi, dogum, olum, parent, childs, image, created_at, updated_at
       FROM yazars WHERE id = ? LIMIT 1`,
      [num]
    );

    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ message: "Yazar bulunamadı" }, { status: 404 });

    return NextResponse.json(row);
  } catch (err) {
    console.error("GET /api/yazars/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PUT /api/yazars/:id */
export async function PUT(request: Request, context: RouteCtx) {
  try {
    const num = getIdFromCtx(context);
    if (num === null) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    let { image } = body || {};
    const { isim, biyografi, dogum, olum, parent, childs } = body || {};

    if (!isim || typeof isim !== "string") {
      return NextResponse.json({ message: "`isim` zorunludur" }, { status: 400 });
    }

    image = normalizeImagePathForDB(image);
    const data = toNullable({ isim, biyografi, dogum, olum, parent, childs, image });

    const [result] = await pool.query(
      `UPDATE yazars SET
         isim = ?, biyografi = ?, dogum = ?, olum = ?, parent = ?, childs = ?, image = ?, updated_at = NOW()
       WHERE id = ?`,
      [data.isim, data.biyografi, data.dogum, data.olum, data.parent, data.childs, data.image, num]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Yazar bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id: num, message: "Yazar güncellendi" });
  } catch (err) {
    console.error("PUT /api/yazars/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PATCH /api/yazars/:id */
export async function PATCH(request: Request, context: RouteCtx) {
  try {
    const num = getIdFromCtx(context);
    if (num === null) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = toNullable(await request.json().catch(() => ({})));

    const allowed = ["isim", "biyografi", "dogum", "olum", "parent", "childs", "image"] as const;
    const fields = Object.keys(body).filter((k) => allowed.includes(k as any));
    if (fields.length === 0) {
      return NextResponse.json({ message: "Güncellenecek alan yok" }, { status: 400 });
    }

    if (fields.includes("image")) {
      (body as any).image = normalizeImagePathForDB((body as any).image);
    }

    const sets = fields.map((f) => `${f} = ?`).join(", ") + ", updated_at = NOW()";
    const values = fields.map((f) => (body as any)[f]);
    values.push(num);

    const [result] = await pool.query(`UPDATE yazars SET ${sets} WHERE id = ?`, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Yazar bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id: num, message: "Yazar güncellendi" });
  } catch (err) {
    console.error("PATCH /api/yazars/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** DELETE /api/yazars/:id */
export async function DELETE(_request: Request, context: RouteCtx) {
  try {
    const num = getIdFromCtx(context);
    if (num === null) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const [result] = await pool.query("DELETE FROM yazars WHERE id = ?", [num]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Yazar bulunamadı" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/yazars/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
