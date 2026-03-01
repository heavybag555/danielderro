import { getClient } from "./client";

type FetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: FetchOptions = {},
): Promise<T> {
  const { revalidate = 60, tags } = options;

  return getClient().fetch<T>(query, params, {
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
  });
}
