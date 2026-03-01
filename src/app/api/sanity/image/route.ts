import { NextRequest, NextResponse } from "next/server";
import { buildImageUrl } from "@/lib/sanity/image";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ref = searchParams.get("ref");
  const width = parseInt(searchParams.get("w") || "1200", 10);
  const quality = parseInt(searchParams.get("q") || "80", 10);

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
  const body = upstream.body;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
