import React, { useId } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Card } from "./ui.jsx";
import { useProgramCarousel } from "./useProgramCarousel";

// Concise homepage copy; canonical records and detail pages stay unchanged.
const curatedSummaries = {
  "kip-kuliah":
    "Bantuan biaya pendidikan tinggi bagi calon mahasiswa yang memenuhi persyaratan program.",
  pip: "Bantuan pendidikan bagi peserta didik dari keluarga kurang mampu atau rentan miskin.",
  "pelatihan-vokasi":
    "Pelatihan keterampilan untuk membantu peserta meningkatkan kompetensi dan kesiapan kerja.",
  kur: "Akses pembiayaan modal usaha melalui skema kredit bagi pelaku usaha yang memenuhi persyaratan.",
  flpp: "Pembiayaan kepemilikan rumah bersubsidi bagi masyarakat berpenghasilan rendah yang memenuhi persyaratan.",
  atensi:
    "Layanan dan dukungan rehabilitasi sosial bagi kelompok yang membutuhkan sesuai hasil asesmen.",
};

export function ProgramCarousel({
  items = [],
  save,
  plans = {},
  autoplay = true,
}) {
  const seen = new Set();
  const available = items.filter(
    (item) =>
      item?.id &&
      item.name &&
      item.official &&
      item.sources?.length &&
      !seen.has(item.id) &&
      seen.add(item.id),
  );
  const carousel = useProgramCarousel(available.length, autoplay),
    id = useId();
  if (!available.length)
    return (
      <div className="curated-programs-empty">
        <p>
          Program pilihan belum tersedia. Kamu tetap dapat menjelajahi katalog
          lengkap.
        </p>
        <a className="text-link" href="/program">
          Lihat Semua Program <ArrowRight size={18} />
        </a>
      </div>
    );
  return (
    <div
      className="program-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Program pilihan"
      {...carousel.regionEvents}
    >
      <p id={`${id}-hint`} className="sr-only">
        Geser untuk menjelajahi program. Gunakan panah kiri dan kanan, Home,
        atau End saat fokus berada pada carousel. Pergeseran otomatis berhenti
        saat kamu berinteraksi.
      </p>
      <div
        id={`${id}-viewport`}
        ref={carousel.viewport}
        className={`program-carousel-viewport${carousel.dragging ? " is-dragging" : ""}`}
        tabIndex={0}
        aria-label="Daftar program pilihan"
        aria-describedby={`${id}-hint`}
        {...carousel.viewportEvents}
      >
        {available.map((item, index) => (
          <div
            className="program-carousel-slide"
            data-carousel-slide
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} dari ${available.length}`}
          >
            <Card
              item={item}
              save={save}
              plans={plans}
              curated
              summary={curatedSummaries[item.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
