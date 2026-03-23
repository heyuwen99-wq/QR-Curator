"use client";

import { useEffect, useRef } from "react";
import type { Options } from "qr-code-styling";

type Props = {
  options: Options;
  className?: string;
};

export function QrStylingCanvas({ options, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    let cancelled = false;

    (async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (cancelled) return;
      el.innerHTML = "";
      const qr = new QRCodeStyling({
        ...options,
        type: "svg",
      });
      qr.append(el);
    })();

    return () => {
      cancelled = true;
    };
  }, [options]);

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label="QR code preview"
    />
  );
}
