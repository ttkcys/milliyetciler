import { NextResponse } from "next/server";
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

function toJsonTextOrNull(v: any) {
  if (v === "" || v === undefined || v === null) return null;
  if (Array.isArray(v)) return JSON.stringify(v);
  const s = String(v).trim();
  if (!s) return null;
  try {
    const parsed = JSON.parse(s);
    return JSON.stringify(parsed);
  } catch {
    return s;
  }
}

function toJsonTextOrEmptyArray(v: any) {
  const t = toJsonTextOrNull(v);
  return t ?? "[]";
}

function sanitizeUserRow(row: any) {
  if (!row) return row;
  delete row.password;
  delete row.remember_token;
  delete row.email_verified_at;
  return row;
}

/** GET /api/users/:id */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT
         \`id\`, \`name\`, \`email\`,
         \`level\`, \`isCan\`,
         \`lDergi\` AS Dergi, \`lSayi\` AS Sayi, \`lYazar\` AS Yazar,
         \`tel\`, \`adres\`, \`meslek\`, \`kurum\`, \`kullanim\`,
         \`biyografi\`, \`created_at\`, \`updated_at\`
       FROM \`users\`
       WHERE \`id\` = ? LIMIT 1`,
      [id]
    );

    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });

    return NextResponse.json(sanitizeUserRow(row));
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** PUT /api/users/:id */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const bodyRaw = await request.json().catch(() => ({}));
    const body = toNullable(bodyRaw);

    const {
      name, email, password, level, isCan,
      Dergi, Sayi, Yazar,
      tel, adres, meslek, kurum, kullanim, biyografi,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "`name` ve `email` zorunludur" }, { status: 400 });
    }

    const [result] = await pool.query(
      `UPDATE \`users\`
          SET \`name\` = ?,
              \`email\` = ?,
              \`password\` = ?,
              \`level\` = ?,
              \`isCan\` = ?,
              \`lDergi\` = ?,
              \`lSayi\` = ?,
              \`lYazar\` = ?,
              \`tel\` = ?,
              \`adres\` = ?,
              \`meslek\` = ?,
              \`kurum\` = ?,
              \`kullanim\` = ?,
              \`biyografi\` = ?,
              \`updated_at\` = NOW()
        WHERE \`id\` = ?`,
      [
        name, email, password ?? null,
        level ?? null, isCan ?? 0,
        toJsonTextOrEmptyArray(Dergi),
        toJsonTextOrEmptyArray(Sayi),
        toJsonTextOrEmptyArray(Yazar),
        tel ?? null, adres ?? null, meslek ?? null, kurum ?? null, kullanim ?? null,
        biyografi ?? null,
        id
      ]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id, message: "Kullanıcı güncellendi" });
  } catch (err: any) {
    console.error("PUT /api/users/:id error:", err?.code, err?.sqlMessage || err?.message);
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ message: err?.sqlMessage || "Sunucu hatası" }, { status: 500 });
  }
}

/** PATCH /api/users/:id */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const body = toNullable(await request.json().catch(() => ({})));

    const allowed = [
      "name","email","password","level","isCan",
      "lDergi","lSayi","lYazar",
      "tel","adres","meslek","kurum","kullanim","biyografi",
      "email_verified_at","remember_token"
    ] as const;

    const fields = Object.keys(body).filter((k) => allowed.includes(k as any));
    if (fields.length === 0) {
      return NextResponse.json({ message: "Güncellenecek alan yok" }, { status: 400 });
    }

    ["lDergi","lSayi","lYazar"].forEach((k) => {
      if (fields.includes(k as any)) (body as any)[k] = toJsonTextOrEmptyArray((body as any)[k]);
    });

    const sets = fields.map((f) => `\`${f}\` = ?`).join(", ") + ", \`updated_at\` = NOW()";
    const values = fields.map((f) => (body as any)[f]);
    values.push(id);

    const [result] = await pool.query(`UPDATE \`users\` SET ${sets} WHERE \`id\` = ?`, values);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ id, message: "Kullanıcı güncellendi" });
  } catch (err: any) {
    console.error("PATCH /api/users/:id error:", err?.code, err?.sqlMessage || err?.message);
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ message: err?.sqlMessage || "Sunucu hatası" }, { status: 500 });
  }
}

/** DELETE /api/users/:id */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ message: "Geçersiz ID" }, { status: 400 });

    const [result] = await pool.query("DELETE FROM `users` WHERE `id` = ?", [id]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/users/:id error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}