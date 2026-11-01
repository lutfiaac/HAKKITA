import React from "react";
import { ArrowRight, CaretRight } from "@phosphor-icons/react";
import { findItem } from "./data.js";
import { Icon, detailUrl } from "./ui.jsx";

const featuredServices = [
  ["ktp-el", "KTP Elektronik", "Panduan pembuatan dan pengurusan KTP-el."],
  ["npwp", "Daftar NPWP", "Ketahui syarat dan langkah pendaftaran NPWP."],
  [
    "perpanjangan-sim",
    "Perpanjang SIM",
    "Informasi persyaratan dan prosedur perpanjangan SIM.",
  ],
  [
    "paspor",
    "Buat Paspor",
    "Panduan pengajuan paspor dan dokumen yang diperlukan.",
  ],
  ["skck", "Buat SKCK", "Ketahui persyaratan dan cara mengurus SKCK."],
  [
    "mobile-jkn",
    "Layanan BPJS Kesehatan",
    "Panduan pendaftaran peserta JKN melalui Mobile JKN.",
  ],
];

export function HomepageServices() {
  return (
    <section
      className="home-section homepage-services"
      aria-labelledby="homepage-services-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <h2 id="homepage-services-title">
              Ada Keperluan yang Ingin Diurus?
            </h2>
            <p>
              Temukan panduan persyaratan dan langkah pengurusan berbagai
              layanan publik.
            </p>
          </div>
        </div>
        <p className="service-selection-label">LAYANAN PILIHAN</p>
        <div className="homepage-service-grid">
          {featuredServices.map(([id, name, description]) => {
            const item = findItem(id);
            return (
              <a
                className="homepage-service-card"
                key={id}
                href={detailUrl(item)}
                aria-labelledby={`home-service-${id}`}
                aria-describedby={`home-service-${id}-description`}
              >
                <span className="homepage-service-icon" aria-hidden="true">
                  <Icon name={item.icon} size={22} />
                </span>
                <div className="homepage-service-copy">
                  <h3 id={`home-service-${id}`}>{name}</h3>
                  <p id={`home-service-${id}-description`}>{description}</p>
                </div>
                <CaretRight
                  className="homepage-service-chevron"
                  size={18}
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </div>
        <div className="service-category-discovery">
          <div>
            <h3>Belum menemukan layanan yang kamu cari?</h3>
            <p>Jelajahi layanan lainnya berdasarkan kategori.</p>
          </div>
          <a className="button secondary" href="/layanan#kategori-layanan">
            Lihat kategori layanan <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
