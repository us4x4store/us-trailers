import Photo from "@/components/Photo";
import { IMAGES } from "@/content/images";
import styles from "./photoband.module.css";

/** Where they go and how they're made: a sheet of photographs after the film. */
export default function PhotoBand() {
  return (
    <section className={styles.band} aria-labelledby="band-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>Out there · In here</p>
        <h2 id="band-title" className={styles.title}>
          Drawn in Cape Town. Proven on the Tankwa.
        </h2>
      </header>
      <div className={styles.grid}>
        <Photo img={IMAGES.heroToyHauler} sizes="(max-width: 760px) 100vw, 66vw" caption="Toy hauler, R355" className={styles.a} />
        <Photo img={IMAGES.weld} sizes="(max-width: 760px) 100vw, 33vw" caption="Every joint welded" className={styles.b} />
        <Photo img={IMAGES.workshop} sizes="(max-width: 760px) 100vw, 33vw" caption="Chassis on the jig" className={styles.c} />
        <Photo img={IMAGES.offroadDusk} sizes="(max-width: 760px) 100vw, 66vw" caption="Off-road camper, Cederberg" className={styles.d} />
      </div>
    </section>
  );
}
