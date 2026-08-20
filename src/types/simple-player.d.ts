import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "simple-player": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        "aspect-ratio"?: string;
        "preload-margin"?: string;
        controls?: boolean | string;
        "disable-autoplay"?: boolean | string;
        "pause-on-overlay-click"?: boolean | string;
        "show-time"?: boolean | string;
      };
    }
  }
}

export {};
