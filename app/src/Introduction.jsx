import React from "react";
import { ArrowRight } from "@phosphor-icons/react";

export function Introduction() {
  return (
    <section
      className="home-introduction home-section"
      aria-labelledby="home-introduction-title"
    >
      <div className="container">
        <div className="intro-overview">
          <p className="introduction-eyebrow">MENGENAL HAKKITA</p>
          <h2 id="home-introduction-title">
            Lebih Mudah Menemukan Informasi,{" "}
            <span>Lebih Jelas Menentukan Langkah.</span>
          </h2>
          <p>
            HAKKITA membantumu mencari program dan layanan publik, memahami
            persyaratan, serta mengetahui langkah yang perlu dilakukan.
          </p>
        </div>
        <div className="intro-feature-grid">
          <article className="intro-feature intro-feature-program">
            <div className="intro-feature-content">
              <span className="intro-feature-label">
                PROGRAM &amp; KESEMPATAN
              </span>
              <h3>Kenali Hakmu</h3>
              <p>
                Temukan informasi bantuan, beasiswa, peluang karier, dan
                berbagai program yang sesuai dengan kebutuhanmu.
              </p>
              <a className="text-link" href="/program">
                Jelajahi Program <ArrowRight size={17} />
              </a>
            </div>
          </article>
          <article className="intro-feature intro-feature-service">
            <div className="intro-feature-content">
              <span className="intro-feature-label">
                PANDUAN PENGURUSAN
              </span>
              <h3>Layanan Publik</h3>
              <p>
                Ketahui persyaratan, prosedur, dan cara mengurus KTP, SIM, NPWP,
                paspor, serta layanan lainnya.
              </p>
              <a className="text-link" href="/layanan">
                Lihat Layanan <ArrowRight size={17} />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
