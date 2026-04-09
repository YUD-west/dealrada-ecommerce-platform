import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File required." }, { status: 400 });
  }

  try {
    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf("."))
      : ".png";
    const filename = `upload-${Date.now()}-${Math.round(
      Math.random() * 1e6
    )}${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Configure Vercel Blob token.",
      },
      { status: 500 }
    );
  }
}
