import Link from "next/link";
import Photo from "@/components/Photo";
import { IMAGES } from "@/content/images";
import styles from "./photoband.module.css";

/** Where they go and how they're made: a sheet of photographs after the film. */
export default function PhotoBand() {
  return (
    <section className={styles.band} aria-labelledby="band-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>At the track · In the workshop</p>
        <h2 id="band-title" className={styles.title}>
          Gloss, chrome and light. Built in Cape Town.
        </h2>
        <Link className={styles.more} href="/builds">
          Read the build stories →
        </Link>
      </header>
      <div className={styles.grid}>
        <Photo img={IMAGES.heroToyHauler} sizes="(max-width: 760px) 100vw, 66vw" caption="V-nose toy hauler, track night" className={styles.a} />
        <Photo img={IMAGES.weld} sizes="(max-width: 760px) 100vw, 33vw" caption="Every joint welded" className={styles.b} />
        <Photo img={IMAGES.workshop} sizes="(max-width: 760px) 100vw, 33vw" caption="Chassis on the jig" className={styles.c} />
        <Photo img={IMAGES.ramp} sizes="(max-width: 760px) 100vw, 66vw" caption="Ramp down, garage lit" className={styles.d} />
      </div>
    </section>
  );
}
