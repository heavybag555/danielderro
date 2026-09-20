import { requireShopifyConfig } from "./env";

/** Default Next data-cache window for Storefront reads, in seconds. */
export const STOREFRONT_REVALIDATE_SECONDS = 300;

type GraphQLError = {
  message: string;
  path?: (string | number)[];
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

/** Thrown for transport, HTTP, and GraphQL failures. Never carries the access token. */
export class ShopifyStorefrontError extends Error {
  readonly status?: number;
  readonly errors?: GraphQLError[];

  constructor(
    message: string,
    options?: { status?: number; errors?: GraphQLError[]; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = "ShopifyStorefrontError";
    this.status = options?.status;
    this.errors = options?.errors;
  }
}

/**
 * POST a GraphQL document to the Shopify Storefront API and return its `data`.
 *
 * Throws `ShopifyStorefrontError` instead of returning a partial payload, so
 * callers decide whether a missing shop degrades the page or fails the route.
 */
export async function storefrontFetch<TData, TVariables = Record<string, unknown>>({
  query,
  variables,
  revalidate = STOREFRONT_REVALIDATE_SECONDS,
  tags,
  signal,
}: StorefrontFetchOptions<TVariables>): Promise<TData> {
  const config = requireShopifyConfig();

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Storefront-Access-Token": config.storefrontToken,
      },
      body: JSON.stringify({ query, variables: variables ?? {} }),
      signal,
      ...(revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate, ...(tags ? { tags } : {}) } }),
    });
  } catch (err) {
    throw new ShopifyStorefrontError(
      `Storefront request to ${config.storeDomain} failed`,
      { cause: err },
    );
  }

  if (!response.ok) {
    throw new ShopifyStorefrontError(
      `Storefront request to ${config.storeDomain} returned ${response.status} ${response.statusText}`,
      { status: response.status },
    );
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors?.length) {
    throw new ShopifyStorefrontError(
      `Storefront GraphQL error: ${payload.errors.map((error) => error.message).join("; ")}`,
      { status: response.status, errors: payload.errors },
    );
  }

  if (!payload.data) {
    throw new ShopifyStorefrontError("Storefront response contained no data", {
      status: response.status,
    });
  }

  return payload.data;
}
