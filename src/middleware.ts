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

// #region agent log
const DEBUG_ENDPOINT =
  "http://127.0.0.1:7708/ingest/a58c2017-bd17-4c85-aa53-c26482e98838";
const DEPTH_HEADER = "x-credit-depth";
const DIAG_HEADER = "x-mw-diag";
const MAX_DEPTH = 2;

/** Hop-by-hop headers that must never be replayed onto a new response. */
const HOP_BY_HOP = [
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
];

function isLocal(host: string | null): boolean {
  return Boolean(
    host && (host.startsWith("localhost") || host.startsWith("127.0.0.1")),
  );
}

function dlog(
  host: string | null,
  location: string,
  message: string,
  data: unknown,
  hypothesisId: string,
) {
  // Vercel cannot reach the local ingest endpoint; diagnostics there ride on
  // the x-mw-diag response header instead.
  if (!isLocal(host)) return Promise.resolve();
  return fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7a8fef",
    },
    body: JSON.stringify({
      sessionId: "7a8fef",
      runId: "pre-fix",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

/**
 * Vercel reports `TypeError: Invalid URL` from the edge middleware adapter on
 * protected preview deployments. Record what the request URL actually looks
 * like at each stage so the malformed value can be identified.
 */
function logUrlShape(request: NextRequest, depth: number, stage: string) {
  const nextUrlString = String(request.nextUrl);
  let urlParses = true;
  let urlParseError = "";
  try {
    new URL(nextUrlString);
  } catch (e) {
    urlParses = false;
    urlParseError = String((e as Error)?.message ?? "").slice(0, 120);
  }
  console.error(
    "[mw-diag] " +
      JSON.stringify({
        sessionId: "7a8fef",
        hypothesisId: "F",
        stage,
        depth,
        pathname: request.nextUrl.pathname,
        search: request.nextUrl.search.slice(0, 120),
        requestUrl: String(request.url).slice(0, 200),
        nextUrlString: nextUrlString.slice(0, 200),
        origin: request.nextUrl.origin,
        urlParses,
        urlParseError,
        host: request.headers.get("host"),
        xfHost: request.headers.get("x-forwarded-host"),
        xfProto: request.headers.get("x-forwarded-proto"),
        xfPort: request.headers.get("x-forwarded-port"),
        hasBypass: Boolean(request.headers.get(BYPASS_HEADER)),
        hasSsoCookie: (request.headers.get("cookie") ?? "").includes(
          "_vercel_jwt",
        ),
      }),
  );
  return { nextUrlString, urlParses, urlParseError };
}
// #endregion

async function runMiddleware(request: NextRequest, diag: string[]) {
  const host = request.headers.get("host");

  // #region agent log
  const depth = Number(request.headers.get(DEPTH_HEADER) ?? "0");
  diag.push(`depth=${depth}`, `path=${request.nextUrl.pathname}`);
  // Logged before every early return so the inner self-fetch invocation is
  // captured too — that is the one Vercel reports Invalid URL for.
  logUrlShape(request, depth, "entry");
  await dlog(
    host,
    "src/middleware.ts:entry",
    "middleware entry",
    {
      url: request.nextUrl.href,
      origin: request.nextUrl.origin,
      pathname: request.nextUrl.pathname,
      method: request.method,
      accept: (request.headers.get("accept") ?? "").slice(0, 80),
      hasBypass: Boolean(request.headers.get(BYPASS_HEADER)),
      depth,
      host,
    },
    "A,B,C",
  );

  // Hypothesis A probe: if the bypass marker is lost across Vercel's CDN hop
  // the self-fetch recurses. Cap it so recursion shows up as a diagnostic
  // instead of a platform-level invocation failure.
  if (depth >= MAX_DEPTH) {
    diag.push("stop=depth-cap");
    const capped = NextResponse.next();
    capped.headers.set(DIAG_HEADER, diag.join(";"));
    return capped;
  }
  // #endregion

  if (request.headers.get(BYPASS_HEADER)) {
    diag.push("stop=bypass");
    const bypassed = NextResponse.next();
    bypassed.headers.set(DIAG_HEADER, diag.join(";"));
    return bypassed;
  }

  // Only attempt to transform navigations that ask for HTML. Asset / data /
  // RSC sub-requests use different Accept headers and can pass through.
  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/html")) {
    diag.push("stop=not-html-accept");
    const passthrough = NextResponse.next();
    passthrough.headers.set(DIAG_HEADER, diag.join(";"));
    return passthrough;
  }

  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.set(BYPASS_HEADER, "1");

  // #region agent log
  const preFetch = logUrlShape(request, depth, "pre-fetch");
  diag.push(`parses=${preFetch.urlParses}`);
  if (!preFetch.urlParses) {
    diag.push(`badurl=${encodeURIComponent(preFetch.nextUrlString.slice(0, 80))}`);
  }

  upstreamHeaders.set(DEPTH_HEADER, String(depth + 1));
  await dlog(
    host,
    "src/middleware.ts:pre-fetch",
    "about to self-fetch upstream",
    {
      target: request.nextUrl.href,
      forwardedHeaderNames: [...upstreamHeaders.keys()],
      depth: depth + 1,
    },
    "A,B,C",
  );
  // #endregion

  let upstream: Response;
  try {
    upstream = await fetch(request.nextUrl, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: "manual",
    });
  } catch (error) {
    // #region agent log
    diag.push(`fetch-threw=${(error as Error)?.name ?? "unknown"}`);
    await dlog(
      host,
      "src/middleware.ts:fetch-catch",
      "self-fetch threw",
      {
        name: (error as Error)?.name,
        message: (error as Error)?.message?.slice(0, 300),
        target: request.nextUrl.href,
      },
      "B,C",
    );
    const failed = NextResponse.next();
    failed.headers.set(DIAG_HEADER, diag.join(";"));
    return failed;
    // #endregion
  }

  const contentType = upstream.headers.get("content-type") ?? "";

  // #region agent log
  diag.push(`upstream=${upstream.status}`);
  await dlog(
    host,
    "src/middleware.ts:post-fetch",
    "self-fetch resolved",
    {
      status: upstream.status,
      contentType: contentType.slice(0, 80),
      contentEncoding: upstream.headers.get("content-encoding"),
      contentLength: upstream.headers.get("content-length"),
      responseHeaderNames: [...upstream.headers.keys()],
      depth: depth + 1,
    },
    "A,D",
  );
  // #endregion

  if (!contentType.includes("text/html")) {
    // #region agent log
    diag.push("stop=not-html-upstream");
    await dlog(
      host,
      "src/middleware.ts:non-html-branch",
      "replaying upstream body with upstream headers",
      {
        status: upstream.status,
        contentType: contentType.slice(0, 80),
        contentEncoding: upstream.headers.get("content-encoding"),
        hasBody: upstream.body !== null,
      },
      "D",
    );
    // #endregion
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

  // #region agent log
  // Hypothesis D probe: /info strips hop-by-hop headers, every other route
  // keeps the current behaviour. If /info survives while / still fails, the
  // replayed hop-by-hop headers are what Vercel rejects.
  const stripHopByHop = request.nextUrl.pathname.startsWith("/info");
  if (stripHopByHop) {
    for (const name of HOP_BY_HOP) responseHeaders.delete(name);
  }
  diag.push(
    `arm=${stripHopByHop ? "strip" : "keep"}`,
    `bytes=${html.length}`,
    `injected=${transformed.length !== html.length}`,
  );
  responseHeaders.set(DIAG_HEADER, diag.join(";"));
  await dlog(
    host,
    "src/middleware.ts:html-return",
    "returning transformed html",
    {
      htmlLength: html.length,
      injected: transformed.length !== html.length,
      status: upstream.status,
      arm: stripHopByHop ? "strip" : "keep",
      responseHeaderNames: [...responseHeaders.keys()],
    },
    "D,E",
  );
  // #endregion

  return new NextResponse(transformed, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function middleware(request: NextRequest) {
  // #region agent log
  // Wrapper so a thrown exception surfaces as a diagnostic header on a working
  // page instead of a platform-level MIDDLEWARE_INVOCATION_FAILED. If the
  // deployment still 500s with this in place, the failure is not a JS throw.
  const diag: string[] = [];
  try {
    return await runMiddleware(request, diag);
  } catch (error) {
    const fallback = NextResponse.next();
    fallback.headers.set(
      DIAG_HEADER,
      `threw=${(error as Error)?.name ?? "unknown"}:${String(
        (error as Error)?.message ?? "",
      ).slice(0, 120)};${diag.join(";")}`,
    );
    return fallback;
  }
  // #endregion
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
