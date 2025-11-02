import { NextRequest, NextResponse } from "next/server";
import pool from "../../../db/connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// İstek: POST /api/list  { kind: "author"|"dergi"|"sayi", id: number }
export async function POST(req: NextRequest) {
    try {
        const uid = req.cookies.get("uid")?.value;
        if (!uid) {
            return NextResponse.json({ message: "Oturum yok" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({} as any));
        const kind = String(body?.kind || "").toLowerCase(); // "author" | "dergi" | "sayi"
        const itemId = Number(body?.id);

        const COL_MAP: Record<string, "lYazar" | "lDergi" | "lSayi"> = {
            author: "lYazar",
            dergi: "lDergi",
            sayi: "lSayi",
        };
        const col = COL_MAP[kind];
        if (!col || !itemId) {
            return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
        }

        // Mevcut listeyi al
        const [rows] = await pool.query(
            `SELECT \`${col}\` AS list FROM \`users\` WHERE \`id\` = ? LIMIT 1`,
            [Number(uid)]
        );
        const row: any = (rows as any[])[0];
        if (!row) {
            return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        let list: number[] = [];
        try {
            const parsed = JSON.parse(row.list || "[]");
            if (Array.isArray(parsed)) list = parsed.map((x: any) => Number(x)).filter((n: any) => Number.isFinite(n));
        } catch {
            // bozuksa sıfırdan başla
            list = [];
        }

        // Zaten var mı?
        if (list.includes(itemId)) {
            return NextResponse.json({ message: "Zaten listede" }, { status: 409 });
        }

        // Ekle ve kaydet
        list.push(itemId);
        const jsonText = JSON.stringify(list);

        const [result] = await pool.query(
            `UPDATE \`users\` SET \`${col}\` = ?, \`updated_at\` = NOW() WHERE \`id\` = ?`,
            [jsonText, Number(uid)]
        );
        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ message: "Eklendi", kind, id: itemId }, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/list error:", err?.code || err?.message || err);
        return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const uid = req.cookies.get("uid")?.value;
        if (!uid) return NextResponse.json({ message: "Oturum yok" }, { status: 401 });

        const { kind, id } = await req.json().catch(() => ({}));
        const itemId = Number(id);
        const COL_MAP: Record<string, "lYazar" | "lDergi" | "lSayi"> = {
            author: "lYazar",
            dergi: "lDergi",
            sayi: "lSayi",
        };
        const col = COL_MAP[String(kind).toLowerCase()];
        if (!col || !itemId) {
            return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
        }

        const [rows] = await pool.query(
            `SELECT \`${col}\` AS list FROM \`users\` WHERE \`id\` = ? LIMIT 1`,
            [Number(uid)]
        );
        const row: any = (rows as any[])[0];
        if (!row) return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });

        let list: number[] = [];
        try {
            const parsed = JSON.parse(row.list || "[]");
            if (Array.isArray(parsed)) list = parsed.map((x: any) => Number(x)).filter(Number.isFinite);
        } catch {
            list = [];
        }

        const next = list.filter((x) => x !== itemId);
        if (next.length === list.length) {
            // zaten yok
            return NextResponse.json({ message: "Listede yok" }, { status: 404 });
        }

        await pool.query(
            `UPDATE \`users\` SET \`${col}\` = ?, \`updated_at\` = NOW() WHERE \`id\` = ?`,
            [JSON.stringify(next), Number(uid)]
        );

        return NextResponse.json({ message: "Kaldırıldı", kind, id: itemId });
    } catch (err) {
        console.error("DELETE /api/list error:", err);
        return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
    }
}