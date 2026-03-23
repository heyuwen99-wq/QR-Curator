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

      const tryAppend = (opts: Options) => {
        const qr = new QRCodeStyling({
          ...opts,
          type: "svg",
        });
        qr.append(el);
      };

      try {
        tryAppend(options);
      } catch {
        // When the QR payload is too long for the selected version/error-correction,
        // the library throws "code length overflow". Falling back to Auto keeps the UI alive.
        const prevQrOptions = options.qrOptions ?? ({} as Options["qrOptions"]);
        const fallback: Options = {
          ...options,
          qrOptions: {
            ...prevQrOptions,
            typeNumber: 0,
          },
        };

        el.innerHTML = "";
        try {
          tryAppend(fallback);
        } catch {
          const msg = "二维码内容过长，当前版本无法编码。请切回 Auto 或选择更高版本。";
          el.textContent = msg;
        }
      }
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
