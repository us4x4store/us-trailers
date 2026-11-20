"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import styles from "./config.module.css";

type Platform = "ios" | "android" | "desktop";

/** One pixel, so Quick Look's required <img> child adds nothing visible. */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/**
 * "See it in your driveway": the configured trailer at real size through the phone camera.
 * iPhone/iPad: AR Quick Look (.usdz). Android: Google Scene Viewer (.glb). Laptop: a QR code.
 */
export default function ArButton({ code }: { code: string }) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [qr, setQr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setPlatform(ios ? "ios" : /Android/i.test(ua) ? "android" : "desktop");
  }, []);

  const pageUrl = typeof window !== "undefined" ? `${location.origin}/?build=${code}#design` : "";

  useEffect(() => {
    if (!open || platform !== "desktop") return;
    import("qrcode").then((QR) => QR.toString(pageUrl, { type: "svg", margin: 1, color: { dark: "#22262A", light: "#E6EAE5" } }).then(setQr));
  }, [open, platform, pageUrl]);

  if (platform === "ios")
    return (
      <a className={styles.ar} rel="ar" href={`/api/ar/${code}.usdz#allowsContentScaling=0`} onClick={() => track("ar_opened", { platform: "ios", build: code })}>
        <img src={PIXEL} alt="" width={1} height={1} />
        See it in your driveway
      </a>
    );

  if (platform === "android") {
    const file = `${location.origin}/api/ar/${code}.glb`;
    const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(file)}&mode=ar_preferred&resizable=false&title=${encodeURIComponent("Your US Trailers build")}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(pageUrl)};end;`;
    return (
      <a className={styles.ar} href={intent} onClick={() => track("ar_opened", { platform: "android", build: code })}>
        See it in your driveway
      </a>
    );
  }

  return (
    <div className={styles.arWrap}>
      <button type="button" className={styles.ar} aria-expanded={open} onClick={() => {
          if (!open) track("ar_opened", { platform: "desktop-qr", build: code });
          setOpen(!open);
        }}>
        See it in your driveway
      </button>
      {open && (
        <div className={styles.qr}>
          {qr ? <span className={styles.qrImg} dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="QR code that opens this build on your phone" /> : <span className={styles.qrImg} />}
          <p>Scan with your phone camera. Your build opens there, then tap the same button to stand it, full size, in your driveway.</p>
        </div>
      )}
    </div>
  );
}
