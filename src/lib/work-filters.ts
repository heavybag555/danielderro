"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const WORK_FILTERS = [
  { id: "all", label: "All" },
  { id: "a-z", label: "A-Z" },
  { id: "stills", label: "Stills" },
  { id: "motion", label: "Motion" },
  { id: "no-school", label: "No School" },
] as const;

export type WorkFilterId = (typeof WORK_FILTERS)[number]["id"];

export const DEFAULT_WORK_FILTER: WorkFilterId = "all";

/** Query param carrying the active filter, e.g. `/work?filter=stills`. */
export const WORK_FILTER_PARAM = "filter";

function isWorkFilterId(value: string | null): value is WorkFilterId {
  return WORK_FILTERS.some((item) => item.id === value);
}

export function parseWorkFilter(value: string | null | undefined): WorkFilterId {
  return isWorkFilterId(value ?? null) ? (value as WorkFilterId) : DEFAULT_WORK_FILTER;
}

/**
 * Active work filter, read from and written to the URL so a filtered index can
 * be linked, bookmarked, and walked with the back button. The default filter is
 * left out of the query string to keep `/work` clean.
 */
export function useWorkFilter(): [WorkFilterId, (id: WorkFilterId) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = parseWorkFilter(searchParams.get(WORK_FILTER_PARAM));

  const setValue = useCallback(
    (id: WorkFilterId) => {
      const next = new URLSearchParams(searchParams.toString());
      if (id === DEFAULT_WORK_FILTER) {
        next.delete(WORK_FILTER_PARAM);
      } else {
        next.set(WORK_FILTER_PARAM, id);
      }
      const query = next.toString();
      // `replace` keeps filter changes out of history so Back leaves the index
      // rather than stepping through every filter the visitor tried.
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return [value, setValue];
}
