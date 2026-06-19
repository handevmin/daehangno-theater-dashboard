import { useEffect, useState } from "react";
import QR from "qrcode";

// 예매 URL → QR 이미지(data URL). URL이 없으면 렌더하지 않는다.
export function QRCode({ value, size = 48, className }: { value: string; size?: number; className?: string }) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let active = true;
    if (!value) {
      setSrc("");
      return;
    }
    QR.toDataURL(value, { margin: 0, width: size * 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc("");
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) return null;
  return <img src={src} alt="예매 QR" width={size} height={size} className={className} />;
}
