// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ message: "file is required" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;

    const dir = path.join(process.cwd(), "public", "yazarlar");
    await mkdir(dir, { recursive: true });

    await writeFile(path.join(dir, filename), buffer);

    const rel = `yazarlar/${filename}`;  // DB'ye bunu yaz
    return NextResponse.json({ path: rel, url: `/${rel}` }, { status: 201 });
  } catch (e) {
    console.error("upload error", e);
    return NextResponse.json({ message: "Upload hatası" }, { status: 500 });
  }
}
