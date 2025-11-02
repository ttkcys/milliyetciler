import { NextRequest, NextResponse } from "next/server";
import pool from "../../../db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** --- Helpers --- */
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
  try { return JSON.stringify(JSON.parse(s)); } catch { return s; }
}

// NOT NULL sütunlar için boşsa '[]'
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

/** GET /api/users?search=&level=&isCan=&page=1&limit=20 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const page = Math.max(parseInt(sp.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "20", 10), 1), 200);
    const offset = (page - 1) * limit;

    const search = (sp.get("search") || "").trim();
    const level  = sp.get("level");
    const isCan  = sp.get("isCan"); // "0" | "1"

    const where: string[] = [];
    const params: any[] = [];

    if (search) { where.push("(`name` LIKE ? OR `email` LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
    if (level !== null && level !== undefined && level !== "") { where.push("`level` = ?"); params.push(Number(level)); }
    if (isCan !== null && isCan !== undefined && isCan !== "") { where.push("`isCan` = ?"); params.push(Number(isCan)); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT
         \`id\`, \`name\`, \`email\`,
         \`level\`, \`isCan\`,
         \`lDergi\` AS Dergi, \`lSayi\` AS Sayi, \`lYazar\` AS Yazar,
         \`tel\`, \`adres\`, \`meslek\`, \`kurum\`, \`kullanim\`,
         \`biyografi\`, \`created_at\`, \`updated_at\`
       FROM \`users\`
       ${whereSql}
       ORDER BY \`id\` DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM \`users\` ${whereSql}`,
      params
    );
    const total = (countRows as any)[0]?.total ?? 0;

    const data = (rows as any[]).map(sanitizeUserRow);

    return NextResponse.json({ page, limit, total, data });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

/** POST /api/users */
export async function POST(req: NextRequest) {
  try {
    const body = toNullable(await req.json().catch(() => ({})));
    const {
      name, email, password, level, isCan,
      Dergi, Sayi, Yazar,
      tel, adres, meslek, kurum, kullanim, biyografi,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "`name` ve `email` zorunludur" }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO \`users\`
        (\`name\`, \`email\`, \`password\`, \`level\`, \`isCan\`,
         \`lDergi\`, \`lSayi\`, \`lYazar\`,
         \`tel\`, \`adres\`, \`meslek\`, \`kurum\`, \`kullanim\`, \`biyografi\`,
         \`created_at\`, \`updated_at\`)
       VALUES (?, ?, ?, ?, ?,
               ?, ?, ?,
               ?, ?, ?, ?, ?, ?,
               NOW(), NOW())`,
      [
        name, email, password ?? null, level ?? null, isCan ?? 0,
        toJsonTextOrEmptyArray(Dergi),  // NOT NULL => '[]' fallback
        toJsonTextOrEmptyArray(Sayi),   // NOT NULL => '[]' fallback
        toJsonTextOrEmptyArray(Yazar),  // NOT NULL => '[]' fallback
        tel ?? null, adres ?? null, meslek ?? null, kurum ?? null, kullanim ?? null, biyografi ?? null
      ]
    );

    return NextResponse.json({ id: (result as any).insertId, message: "Kullanıcı eklendi" }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/users error:", err?.code, err?.sqlMessage || err?.message);
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ message: err?.sqlMessage || "Sunucu hatası" }, { status: 500 });
  }
}
