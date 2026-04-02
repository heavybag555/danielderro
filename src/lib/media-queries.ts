/**
 * Wide desktop layout with a mouse/trackpad. Excludes phones/tablets that report a
 * ≥1024px width (e.g. Safari “Request Desktop Website”) while still using touch
 * (`pointer: coarse`).
 */
export const MEDIA_DESKTOP_FINE_POINTER =
  "(min-width: 1024px) and (pointer: fine)";
