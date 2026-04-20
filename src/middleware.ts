import { NextResponse, type NextRequest } from "next/server";

/**
 * Credit comment injected as the first child of <html>, mirroring the
 * 2u4u.studio site-source convention. Visible to anyone running
 * "View Source" or DevTools → Elements.
 */
const SITE_CREDIT_COMMENT =
  "<!-- Site design + development — 2u4u.studio | IG — 2u4u.studio | Reach — 2you4youstudio@gmail.com -->";

/**
 * Marker header used to short-circuit the middleware on its own internal
 * fetch so we don't recurse infinitely.
 */
const BYPASS_HEADER = "x-credit-bypass";

export async function middleware(request: NextRequest) {
  if (request.headers.get(BYPASS_HEADER)) {
    return NextResponse.next();
  }

  // Only attempt to transform navigations that ask for HTML. Asset / data /
  // RSC sub-requests use different Accept headers and can pass through.
  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/html")) {
    return NextResponse.next();
  }

  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.set(BYPASS_HEADER, "1");

  let upstream: Response;
  try {
    upstream = await fetch(request.nextUrl, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: "manual",
    });
  } catch {
    return NextResponse.next();
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  }

  const html = await upstream.text();
  const transformed = html.replace(
    /(<html\b[^>]*>)/i,
    `$1${SITE_CREDIT_COMMENT}`,
  );

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");

  return new NextResponse(transformed, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const config = {
  /**
   * Skip routes that should never receive HTML rewriting:
   * - /api  → JSON endpoints
   * - /studio → Sanity Studio (manages its own document shell)
   * - /_next/static and /_next/image → bundles + optimized images
   * - any path that ends in a common asset extension
   */
  matcher: [
    "/((?!api|studio|_next/static|_next/image|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|map|woff2?|ttf|eot|mp4|webm|mov|pdf|txt|xml|json)).*)",
  ],
};
