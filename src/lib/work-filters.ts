"use client";

import { useEffect, useState } from "react";

export const WORK_FILTERS = [
  { id: "all", label: "All" },
  { id: "a-z", label: "A-Z" },
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
  { id: "no-school", label: "No School" },
] as const;

export type WorkFilterId = (typeof WORK_FILTERS)[number]["id"];

type Listener = (id: WorkFilterId) => void;

let filter: WorkFilterId = "all";
const listeners = new Set<Listener>();

export function getWorkFilter(): WorkFilterId {
  return filter;
}

export function setWorkFilter(id: WorkFilterId) {
  if (filter === id) return;
  filter = id;
  for (const listener of listeners) listener(filter);
}

export function resetWorkFilter() {
  setWorkFilter("all");
}

export function subscribeWorkFilter(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWorkFilter(): [WorkFilterId, (id: WorkFilterId) => void] {
  const [value, setValue] = useState(getWorkFilter);
  useEffect(() => subscribeWorkFilter(setValue), []);
  return [value, setWorkFilter];
}
