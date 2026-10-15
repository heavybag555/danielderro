import { requireShopifyConfig, type ShopifyConfig } from "./env";

/** Default Next data-cache window for Storefront reads, in seconds. */
export const STOREFRONT_REVALIDATE_SECONDS = 300;

type GraphQLError = {
  message: string;
  path?: (string | number)[];
  extensions?: { code?: string };
};

type GraphQLResponse<T> = {
  data?: T | null;
  errors?: GraphQLError[];
};

export type StorefrontFetchOptions<TVariables> = {
  query: string;
  variables?: TVariables;
  /** Seconds to cache the response; `false` opts out of the Next data cache. */
  revalidate?: number | false;
  /** Cache tags so a webhook can call `revalidateTag` later. */
  tags?: string[];
  signal?: AbortSignal;
};

export type ShopifyStorefrontErrorCode =
  | "locked"
  | "unauthorized"
  | "http"
  | "graphql"
  | "empty";

/** Thrown for transport, HTTP, and GraphQL failures. Never carries the access token. */
export class ShopifyStorefrontError extends Error {
  readonly status?: number;
  readonly errors?: GraphQLError[];
  readonly code?: ShopifyStorefrontErrorCode;

  constructor(
    message: string,
    options?: {
      status?: number;
      errors?: GraphQLError[];
      code?: ShopifyStorefrontErrorCode;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options?.cause });
    this.name = "ShopifyStorefrontError";
    this.status = options?.status;
    this.errors = options?.errors;
    this.code = options?.code;
  }
}

function isLockedText(text: string): boolean {
  return /online store channel is locked/i.test(text);
}

function postCacheInit(
  revalidate: number | false,
  tags: string[] | undefined,
): Pick<RequestInit, "cache"> & { next?: { revalidate: number; tags?: string[] } } {
  return revalidate === false
    ? { cache: "no-store" }
    : { next: { revalidate, ...(tags ? { tags } : {}) } };
}

async function postStorefront(
  config: ShopifyConfig,
  body: string,
  includeTokens: boolean,
  init: {
    signal?: AbortSignal;
    revalidate: number | false;
    tags?: string[];
  },
): Promise<Response> {
  return fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(includeTokens && config.storefrontToken
        ? { "X-Shopify-Storefront-Access-Token": config.storefrontToken }
        : {}),
      ...(includeTokens && config.privateToken
        ? { "Shopify-Storefront-Private-Token": config.privateToken }
        : {}),
    },
    body,
    signal: init.signal,
    ...postCacheInit(init.revalidate, init.tags),
  });
}

function errorFromPayload(
  status: number,
  payload: GraphQLResponse<unknown> | null,
  fallback: string,
): ShopifyStorefrontError {
  const errors = payload?.errors ?? [];
  const text = errors.map((error) => error.message).filter(Boolean).join("; ");
  const combined = `${text} ${fallback}`;
  if (isLockedText(combined)) {
    return new ShopifyStorefrontError("Online Store channel is locked.", {
      status,
      errors,
      code: "locked",
    });
  }
  if (status === 401 || status === 403) {
    return new ShopifyStorefrontError(
      `Shopify rejected the Storefront token for this shop (${status}). Use the Headless channel's Storefront API public access token, not an Admin shpat_ key or the custom-app API key.`,
      { status, errors, code: "unauthorized" },
    );
  }
  if (errors.length) {
    return new ShopifyStorefrontError(
      `Storefront GraphQL error: ${text || fallback}`,
      { status, errors, code: "graphql" },
    );
  }
  return new ShopifyStorefrontError(fallback, { status, errors, code: "http" });
}

async function readPayload<T>(response: Response): Promise<GraphQLResponse<T> | null> {
  try {
    return (await response.json()) as GraphQLResponse<T>;
  } catch {
    return null;
  }
}

/**
 * POST a GraphQL document to the Shopify Storefront API and return its `data`.
 *
 * Sends a public/private token when one is configured. On 401/403, retries
 * once without a token — Shopify can serve products tokenless when the
 * Online Store is public. Never returns a partial payload.
 */
export async function storefrontFetch<TData, TVariables = Record<string, unknown>>({
  query,
  variables,
  revalidate = STOREFRONT_REVALIDATE_SECONDS,
  tags,
  signal,
}: StorefrontFetchOptions<TVariables>): Promise<TData> {
  const config = requireShopifyConfig();
  const body = JSON.stringify({ query, variables: variables ?? {} });
  const init = { signal, revalidate, tags };
  const canSendToken = Boolean(config.storefrontToken || config.privateToken);

  let response: Response;
  try {
    response = await postStorefront(config, body, canSendToken, init);
    if ((response.status === 401 || response.status === 403) && canSendToken) {
      response = await postStorefront(config, body, false, init);
    }
  } catch (err) {
    if (err instanceof ShopifyStorefrontError) throw err;
    throw new ShopifyStorefrontError(`Storefront request to ${config.storeDomain} failed`, {
      cause: err,
      code: "http",
    });
  }

  const payload = await readPayload<TData>(response);

  if (!response.ok) {
    throw errorFromPayload(
      response.status,
      payload,
      `Storefront request to ${config.storeDomain} returned ${response.status} ${response.statusText}`,
    );
  }

  if (payload?.errors?.length) {
    throw errorFromPayload(response.status, payload, "Storefront GraphQL error");
  }

  if (!payload?.data) {
    throw new ShopifyStorefrontError("Storefront response contained no data", {
      status: response.status,
      code: "empty",
    });
  }

  return payload.data;
}
