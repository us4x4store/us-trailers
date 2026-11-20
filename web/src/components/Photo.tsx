import Image from "next/image";
import type { SiteImage } from "@/content/images";
import styles from "./photo.module.css";

/** A photo with an honest caption. Concept renders say so until real build photos replace them. */
export default function Photo({ img, sizes, priority = false, eager = false, caption, className }: { img: SiteImage; sizes: string; priority?: boolean; eager?: boolean; caption?: string; className?: string }) {
  return (
    <figure className={`${styles.fig} ${className ?? ""}`}>
      <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes={sizes} priority={priority} loading={priority ? undefined : eager ? "eager" : "lazy"} className={styles.img} />
      {(caption || img.concept) && (
        <figcaption className={styles.cap}>
          {caption}
          {caption && img.concept ? " · " : ""}
          {img.concept && <span>Concept render</span>}
        </figcaption>
      )}
    </figure>
  );
}
