import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

/** GET /api/dergis/:id */
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const num = Number(id);
    if (isNaN(num)) {
      return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT
         id, isim, alt_baslik, slogan, aciklama,
         imtiyaz, yazi_mudur, cikis, bitis, basim_yeri,
         toplam_sayi, eksikler, telif, created_at, updated_at
       FROM dergis
       WHERE id = ? LIMIT 1`,
      [num]
    );

    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ message: "Dergi bulunamadı" }, { status: 404 });

    return NextResponse.json(row);
  } catch (err) {
    console.error("GET /api/dergis/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PUT /api/dergis/:id */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const num = Number(id);
    if (isNaN(num)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
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
      `UPDATE dergis SET
         isim = ?, alt_baslik = ?, slogan = ?, aciklama = ?,
         imtiyaz = ?, yazi_mudur = ?, cikis = ?, bitis = ?, basim_yeri = ?,
         toplam_sayi = ?, eksikler = ?, telif = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        data.isim, data.alt_baslik, data.slogan, data.aciklama,
        data.imtiyaz, data.yazi_mudur, data.cikis, data.bitis, data.basim_yeri,
        data.toplam_sayi, data.eksikler, data.telif, num
      ]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Dergi bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id, message: "Dergi güncellendi" });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PATCH /api/dergis/:id */
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const num = Number(id);
    if (isNaN(num)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = toNullable(await request.json().catch(() => ({})));

    const allowed = [
      "isim", "alt_baslik", "slogan", "aciklama",
      "imtiyaz", "yazi_mudur", "cikis", "bitis", "basim_yeri",
      "toplam_sayi", "eksikler", "telif"
    ] as const;

    const fields = Object.keys(body).filter((k) => allowed.includes(k as any));
    if (fields.length === 0) {
      return NextResponse.json({ message: "Güncellenecek alan yok" }, { status: 400 });
    }

    const sets = fields.map((f) => `${f} = ?`).join(", ") + ", updated_at = NOW()";
    const values = fields.map((f) => (body as any)[f]);
    values.push(num);

    const [result] = await pool.query(
      `UPDATE dergis SET ${sets} WHERE id = ?`,
      values
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Dergi bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id, message: "Dergi güncellendi" });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** DELETE /api/dergis/:id */
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const num = Number(id);
    if (isNaN(num)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const [result] = await pool.query("DELETE FROM dergis WHERE id = ?", [num]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Dergi bulunamadı" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}