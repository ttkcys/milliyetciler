import { NextResponse } from "next/server";
import pool from "../../../../db/connect";

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

/** URL yolunu DB için temizle */
function normalizePathForDB(v?: string | null) {
  if (!v) return null;
  let s = String(v).trim();
  s = s.replace(/^https?:\/\/[^/]+\/+/, ""); // domain sil
  s = s.replace(/^\/+/, "");                 // baştaki / sil
  return s;
}

/** GET /api/sayis/:id */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const num = Number(id);
    if (isNaN(num)) {
      return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT
         id, dergi_id, sayi_num, ay, yil,
         image, pdf, toplam_sayfa, toplam_yazi,
         created_at, updated_at
       FROM sayis
       WHERE id = ? LIMIT 1`,
      [num]
    );

    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ message: "Sayı bulunamadı" }, { status: 404 });

    return NextResponse.json(row);
  } catch (err) {
    console.error("GET /api/sayis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PUT /api/sayis/:id */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const num = Number(id);
    if (isNaN(num)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const { dergi_id, sayi_num, ay, yil, image, pdf, toplam_sayfa, toplam_yazi } = body || {};

    if (!dergi_id || !sayi_num) {
      return NextResponse.json({ message: "`dergi_id` ve `sayi_num` zorunludur" }, { status: 400 });
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
      `UPDATE sayis SET
         dergi_id = ?, sayi_num = ?, ay = ?, yil = ?,
         image = ?, pdf = ?, toplam_sayfa = ?, toplam_yazi = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        data.dergi_id, data.sayi_num, data.ay, data.yil,
        data.image, data.pdf, data.toplam_sayfa, data.toplam_yazi, num
      ]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Sayı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id: num, message: "Sayı güncellendi" });
  } catch (err) {
    console.error("PUT /api/sayis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PATCH /api/sayis/:id */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const num = Number(id);
    if (isNaN(num)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const raw = await request.json().catch(() => ({}));
    const body = toNullable({
      ...raw,
      image: normalizePathForDB(raw?.image),
      pdf: normalizePathForDB(raw?.pdf),
    });

    const allowed = [
      "dergi_id", "sayi_num", "ay", "yil",
      "image", "pdf", "toplam_sayfa", "toplam_yazi"
    ] as const;

    const fields = Object.keys(body).filter((k) => allowed.includes(k as any));
    if (fields.length === 0) {
      return NextResponse.json({ message: "Güncellenecek alan yok" }, { status: 400 });
    }

    const sets = fields.map((f) => `${f} = ?`).join(", ") + ", updated_at = NOW()";
    const values = fields.map((f) => (body as any)[f]);
    values.push(num);

    const [result] = await pool.query(
      `UPDATE sayis SET ${sets} WHERE id = ?`,
      values
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Sayı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id: num, message: "Sayı güncellendi" });
  } catch (err) {
    console.error("PATCH /api/sayis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** DELETE /api/sayis/:id */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const num = Number(id);
    if (isNaN(num)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const [result] = await pool.query("DELETE FROM sayis WHERE id = ?", [num]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Sayı bulunamadı" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/sayis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}