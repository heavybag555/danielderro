import { NextRequest, NextResponse } from "next/server";
import { buildImageUrl } from "@/lib/sanity/image";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ref = searchParams.get("ref");
  const filename = searchParams.get("name") || "photo.jpg";
  const width = parseInt(searchParams.get("w") || "2400", 10);
  const quality = parseInt(searchParams.get("q") || "85", 10);

  if (!ref || !/^image-/.test(ref)) {
    return NextResponse.json({ error: "Invalid ref" }, { status: 400 });
  }

  const url = buildImageUrl(ref, { width, quality });

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Upstream fetch failed" },
      { status: upstream.status },
    );
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const body = upstream.body;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitizedName}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
