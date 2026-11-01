import React from "react";
import { ArrowRight, ArrowUpRight, CaretRight } from "@phosphor-icons/react";
import { programs, programCategories, findItem } from "./data.js";
import { InlinePersonalization } from "./Personalization.jsx";
import { useAccount } from "./AccountContext";
import { selectHomepagePrograms } from "./homepage-featured";

import { Search, FAQ, detailUrl } from "./ui.jsx";
import { ProgramCarousel } from "./ProgramCarousel.jsx";
import { Introduction } from "./Introduction.jsx";
import { HomepageServices } from "./HomepageServices.jsx";
import { homepageFaqItems } from "./faq.js";

import { categoryImages } from "./category-images.js";

export function Home({ navigate, save, plans }) {
  const { account, sensitiveAnswers } = useAccount();
  const featured = selectHomepagePrograms(
    programs,
    account?.profile,
    sensitiveAnswers,
  );
  return (
    <div className="homepage">
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            Informasi <span className="highlight">Program</span> dan{" "}
            <span className="highlight">Panduan Layanan</span> Publik dalam Satu
            Tempat
          </h1>
          <p className="hero-description">
            Jelajahi bantuan, beasiswa, peluang karier, dan berbagai program
            pemerintah Indonesia yang relevan untukmu.
          </p>
          <Search navigate={navigate} hero />
          <div className="popular-search">
            <span>Paling sering dicari</span>
            {["kip-kuliah", "pip", "pelatihan-vokasi", "perpanjangan-sim"].map(
              (id) => (
                <a key={id} href={detailUrl(findItem(id))}>
                  {id === "pip"
                    ? "Program Indonesia Pintar"
                    : findItem(id).name}
                  <ArrowRight size={14} />
                </a>
              ),
            )}
          </div>
        </div>
        <img
          className="hero-landscape"
          src="/hero-lakeside.png"
          alt="Keluarga, pesepeda, dan warga di taman tepi danau dengan panorama kota Indonesia"
          width="2168"
          height="537"
          fetchPriority="high"
        />
      </section>
      <Introduction />
      <section
        className="home-section program-exploration"
        aria-labelledby="program-exploration-title"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id="program-exploration-title">
                Temukan Program yang Kamu Butuhkan
              </h2>
              <p>
                Jelajahi berbagai kategori bantuan dan kesempatan sesuai
                kebutuhanmu.
              </p>
            </div>
            <a className="text-link" href="/program">
              Lihat Semua Program <ArrowRight />
            </a>
          </div>
          <div className="topics-grid program-categories-grid">
            {programCategories.map((category) => (
              <a
                key={category.id}
                className="topic program-category"
                href={`/program/kategori/${category.id}`}
              >
                <div className="topic-title">
                  <span className="program-category-icon" aria-hidden="true">
                    <img
                      src={`/program-category-icons/${categoryImages[category.id]}`}
                      alt=""
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                  </span>
                  <h3>{category.name}</h3>
                </div>
                <span className="program-category-chevron" aria-hidden="true">
                  <CaretRight size={16} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section
        className="container home-section featured-programs"
        aria-labelledby="featured-programs-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="featured-programs-title">
              {featured.mode === "personal"
                ? "Rekomendasi untukmu"
                : "Program Unggulan"}
            </h2>
            {featured.mode === "guest" ? (
              <InlinePersonalization />
            ) : featured.mode === "personal" ? (
              <p className="inline-personalization">
                Temukan program yang relevan berdasarkan informasi profilmu.
              </p>
            ) : featured.mode === "incomplete" ? (
              <p className="inline-personalization">
                <a href="/profil/edit">Lengkapi profilmu</a> untuk menemukan
                program yang lebih relevan.
              </p>
            ) : (
              <p className="inline-personalization">
                Jelajahi program pilihan yang tersedia.
              </p>
            )}
          </div>
          <a className="text-link" href="/program">
            Lihat semua program <ArrowRight />
          </a>
        </div>
        <ProgramCarousel
          key={`${featured.mode === "personal" ? "personal" : "general"}:${featured.items.map((item) => item.id).join(",")}`}
          items={featured.items}
          save={save}
          plans={plans}
        />
      </section>
      <HomepageServices />
      <section
        className="home-section homepage-transparency"
        aria-labelledby="transparency-title"
      >
        <div className="container transparency-panel">
          <div className="transparency-copy">
            <img
              className="transparency-review-icon"
              src="/transparency-review.png"
              alt=""
              width="112"
              height="112"
              loading="lazy"
            />
            <h2 id="transparency-title">
              Ketahui Sumber Informasi dan Anggaran Publik
            </h2>
            <p>
              Periksa rujukan informasi program dan layanan, serta jelajahi data
              anggaran yang tersedia.
            </p>
          </div>
          <nav
            className="transparency-navigation"
            aria-label="Sumber informasi dan anggaran"
          >
            <a href="/sumber">
              Tentang sumber informasi{" "}
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
            <a href="/anggaran">
              Telusuri anggaran <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </section>
      <section
        className="home-section home-faq"
        aria-labelledby="home-faq-title"
      >
        <div className="container home-faq-layout">
          <div className="home-faq-intro">
            <div>
              <p className="home-faq-eyebrow">
                <span aria-hidden="true" /> FAQ
              </p>
              <h2 id="home-faq-title">Pertanyaan yang sering diajukan</h2>
            </div>
            <div className="home-faq-help">
              <h3>Masih punya pertanyaan?</h3>
              <p>
                Temukan panduan untuk menjelajahi program, layanan, dan fitur
                HAKKITA.
              </p>
              <a className="button primary" href="/bantuan">
                Pusat Bantuan <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <FAQ minimal items={homepageFaqItems} />
        </div>
      </section>
    </div>
  );
}
