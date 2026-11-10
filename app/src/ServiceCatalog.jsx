import { useEffect, useRef } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { services, serviceCategories, filterCatalog } from "./data.js";
import { Breadcrumb, PageIntro, Search, Card, Icon, hrefWith } from "./ui.jsx";
import {
  readServiceState,
  servicePage,
  SERVICE_PAGE_SIZE,
} from "./service-catalog.js";

export function ServiceCatalog({
  navigate,
  initialCategory = "",
  save,
  plans,
}) {
  const { values, invalid } = readServiceState(
    location.search,
    initialCategory,
    services,
  );
  const resultsHeading = useRef(null);
  const focusResults = useRef(false);
  const results = filterCatalog({
    type: "layanan",
    query: values.q,
    category: values.kategori,
  });
  const page = servicePage(results, values);
  const category = serviceCategories.find(
    (item) => item.id === values.kategori,
  );
  const url = (next) =>
    hrefWith("/layanan", {
      q: next.q,
      kategori: next.kategori,
      halaman: next.halaman > 1 ? next.halaman : "",
    });
  const returnTo = url({ ...values, halaman: page.page });
  function revealResults() {
    focusResults.current = false;
    resultsHeading.current?.focus({ preventScroll: true });
    resultsHeading.current?.scrollIntoView?.({
      block: "start",
      behavior: "auto",
    });
  }
  function update(patch) {
    focusResults.current = true;
    const next = url({ ...values, halaman: 1, ...patch });
    if (next === location.pathname + location.search) revealResults();
    else navigate(next);
  }
  useEffect(() => {
    if (focusResults.current) revealResults();
  }, [location.pathname, location.search]);
  const heading = values.q
    ? `Hasil pencarian “${values.q}”`
    : category
      ? `Layanan ${category.name}`
      : "Semua layanan";
  return (
    <div className="container page service-catalog">
      <Breadcrumb items={[{ label: "Layanan Publik" }]} />
      <section className="service-hero" aria-label="Cari panduan layanan publik">
      <PageIntro
        title="Panduan Layanan Publik"
        subtitle="Temukan informasi persyaratan, dokumen, dan langkah pengurusan layanan yang kamu butuhkan."
      />
      <Search
        key={values.q}
        initial={values.q}
        type="layanan"
        compact
        onSearch={(q) => update({ q })}
      />
      </section>
      <section
        id="kategori-layanan"
        className="service-categories"
        tabIndex={-1}
        aria-labelledby="service-category-title"
      >
        <h2 id="service-category-title">Jelajahi berdasarkan kategori</h2>
        <div className="service-mobile-category">
          <label htmlFor="service-category-mobile">Kategori layanan</label>
          <select
            id="service-category-mobile"
            value={values.kategori}
            onChange={(event) => update({ kategori: event.target.value })}
          >
            <option value="">Semua kategori</option>
            {serviceCategories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="service-navigation-grid">
          {serviceCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={values.kategori === item.id}
              onClick={() =>
                update({ kategori: values.kategori === item.id ? "" : item.id })
              }
            >
              <Icon name={item.icon} size={22} />
              <span>{item.name}</span>
              {values.kategori === item.id && (
                <X size={18} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </section>
      <section
        className="service-results"
        aria-labelledby="service-results-title"
      >
        <div className="service-results-heading">
          <div className="service-results-heading-main">
            <h2 id="service-results-title" ref={resultsHeading} tabIndex={-1}>
              {heading}
            </h2>
            <p role="status" aria-live="polite" aria-atomic="true">
              {page.pages > 1
                ? `Menampilkan ${(page.page - 1) * SERVICE_PAGE_SIZE + 1}–${(page.page - 1) * SERVICE_PAGE_SIZE + page.items.length} dari ${results.length} layanan`
                : `${results.length} layanan`}
              {values.q && category && ` · ${category.name}`}
            </p>
          </div>
          {values.q && (
            <button
              type="button"
              className="service-clear-query"
              onClick={() => update({ q: "" })}
            >
              Hapus pencarian <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        {invalid && (
          <p className="service-filter-notice" role="status">
            Kategori pada tautan ini sudah tidak tersedia. Pilih salah satu
            kategori di atas.
          </p>
        )}
        {results.length ? (
          <div className="service-results-grid">
            {page.items.map((item) => (
              <Card
                key={item.id}
                item={item}
                serviceCatalog
                query={values.q}
                returnTo={returnTo}
                save={save}
                plans={plans}
              />
            ))}
          </div>
        ) : (
          <div className="service-empty">
            <h3>Layanan tidak ditemukan</h3>
            <p>
              Coba kata kunci lain atau hapus pilihan kategori untuk
              memperluas pencarian.
            </p>
            <button
              className="button secondary"
              onClick={() => update({ q: "", kategori: "" })}
            >
              Reset pencarian
            </button>
          </div>
        )}
        {page.pages > 1 && (
          <nav className="service-pagination" aria-label="Halaman layanan">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={page.page === 1}
              onClick={() => update({ halaman: page.page - 1 })}
            >
              <CaretLeft size={18} weight="regular" aria-hidden="true" />
            </button>
            {Array.from({ length: page.pages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                aria-label={`Halaman ${number}`}
                aria-current={page.page === number ? "page" : undefined}
                onClick={() => update({ halaman: number })}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              aria-label="Halaman berikutnya"
              disabled={page.page === page.pages}
              onClick={() => update({ halaman: page.page + 1 })}
            >
              <CaretRight size={18} weight="regular" aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
