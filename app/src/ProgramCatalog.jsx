import React, { useCallback, useEffect, useRef, useState } from "react";
import { CaretDown, SlidersHorizontal, X } from "@phosphor-icons/react";
import { programCategories } from "./data.js";
import { targetGroups } from "./taxonomy";
import { Breadcrumb, Card, Empty, PageIntro, Search } from "./ui.jsx";
import { ProgramRegionFilter } from "./ProgramRegionFilter.jsx";
import { ProgramAdvancedFilters } from "./ProgramAdvancedFilters.jsx";
import {
  benefitOptions,
  educationOptions,
  periodOptions,
} from "./program-filters.js";

export function ProgramCatalog({
  items,
  values,
  labels,
  sort,
  update,
  applyAdvanced,
  reset,
  navigate,
  save,
  plans,
}) {
  const [targetsOpen, setTargetsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const closeAdvanced = useCallback(() => setAdvancedOpen(false), []);
  const targetsRef = useRef(null),
    targetTrigger = useRef(null);
  useEffect(() => {
    if (!targetsOpen) return;
    const outside = (event) => {
      if (!targetsRef.current?.contains(event.target)) setTargetsOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setTargetsOpen(false);
        targetTrigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [targetsOpen]);
  const chips = Object.entries(values).flatMap(([key, value]) => {
    if (
      !value ||
      key === "urutan" ||
      key === "kabupaten" ||
      (Array.isArray(value) && !value.length)
    )
      return [];
    if (key === "sasaran" || key === "manfaat")
      return value.map((target) => ({
        key,
        value: target,
        label:
          (key === "sasaran" ? targetGroups : benefitOptions).find(
            ([id]) => id === target,
          )?.[1] || target,
      }));
    const optionLabel = (
      key === "pendidikan"
        ? educationOptions
        : key === "periode"
          ? periodOptions
          : []
    ).find(([id]) => id === value)?.[1];
    return [
      {
        key,
        value,
        label:
          key === "q"
            ? `Pencarian: ${value}`
            : key === "wilayah" && values.kabupaten
              ? `${values.kabupaten}, ${value}`
              : optionLabel || labels[key] || value,
      },
    ];
  });
  const advancedCount =
    values.manfaat.length +
    Number(Boolean(values.pendidikan)) +
    Number(Boolean(values.periode));
  const noRegionalResults =
    values.wilayah &&
    values.wilayah !== "nasional" &&
    items.length > 0 &&
    items.every((item) => item.regionCoverage?.level === "national");
  return (
    <div className="container page program-catalog">
      <Breadcrumb items={[{ label: "Kenali Hakmu" }]} />
      <PageIntro
        title="Kenali Hakmu"
        subtitle="Temukan informasi bantuan, beasiswa, peluang karier, dan berbagai program yang sesuai kebutuhanmu."
      />
      <div className="program-discovery-controls">
        <Search
          key={values.q}
          navigate={navigate}
          initial={values.q}
          type="program"
          compact
          onSearch={(query) => update("q", query)}
        />
        <div className="program-filter-bar" aria-label="Filter program">
          <div>
            <label className="sr-only" htmlFor="category-filter">
              Kategori program
            </label>
            <span className="program-select-control">
              <select
                id="category-filter"
                value={values.kategori}
                onChange={(event) => update("kategori", event.target.value)}
              >
                <option value="">Semua kategori</option>
                {programCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <CaretDown
                className="program-select-chevron"
                size={16}
                aria-hidden="true"
              />
            </span>
          </div>
          <ProgramRegionFilter
            province={values.wilayah}
            city={values.kabupaten}
            onChange={applyAdvanced}
          />
          <div
            className="program-target-control"
            ref={targetsRef}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setTargetsOpen(false);
            }}
          >
            <button
              ref={targetTrigger}
              className="program-filter-button"
              aria-expanded={targetsOpen}
              aria-controls="program-target-options"
              onClick={() => setTargetsOpen(!targetsOpen)}
            >
              Sasaran penerima
              {values.sasaran.length ? ` (${values.sasaran.length})` : ""}
              <CaretDown size={16} aria-hidden="true" />
            </button>
            {targetsOpen && (
              <div
                className="program-target-popover"
                id="program-target-options"
              >
                <fieldset>
                  <legend>Pilih sasaran penerima</legend>
                  {targetGroups.map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="checkbox"
                        value={value}
                        checked={values.sasaran.includes(value)}
                        onChange={() =>
                          update(
                            "sasaran",
                            values.sasaran.includes(value)
                              ? values.sasaran.filter(
                                  (target) => target !== value,
                                )
                              : [...values.sasaran, value],
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
                <button
                  type="button"
                  className="text-button target-clear"
                  disabled={!values.sasaran.length}
                  onClick={() => update("sasaran", [])}
                >
                  Hapus pilihan
                </button>
              </div>
            )}
          </div>
          <div>
            <button
              className="program-filter-button program-more-filters"
              aria-haspopup="dialog"
              onClick={() => {
                setTargetsOpen(false);
                setAdvancedOpen(true);
              }}
            >
              <SlidersHorizontal size={18} aria-hidden="true" />
              Filter lainnya{advancedCount ? ` (${advancedCount})` : ""}
            </button>
          </div>
        </div>
      </div>
      {chips.length > 0 && (
        <div
          className="active-filters program-active-filters"
          aria-label="Filter aktif"
        >
          {chips.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              aria-label={`Hapus filter ${chip.label}`}
              onClick={() =>
                update(
                  chip.key,
                  Array.isArray(values[chip.key])
                    ? values[chip.key].filter((target) => target !== chip.value)
                    : "",
                )
              }
            >
              {chip.label}
              <X size={14} aria-hidden="true" />
            </button>
          ))}
          <button className="clear-all-filter" onClick={reset}>
            Hapus semua
          </button>
        </div>
      )}
      <div className="program-results-toolbar">
        <p role="status" aria-live="polite">
          <strong>{items.length} program ditemukan</strong>
        </p>
        <label htmlFor="program-sort">
          Urutkan:
          <span className="program-sort-control">
            <select
              id="program-sort"
              value={sort}
              onChange={(event) =>
                update(
                  "urutan",
                  event.target.value === "latest" ? "" : event.target.value,
                )
              }
            >
              <option value="latest">Terbaru dicatat</option>
              <option value="deadline">Tenggat terdekat</option>
              <option value="az">Nama A-Z</option>
              <option value="za">Nama Z-A</option>
            </select>
            <CaretDown
              className="program-sort-chevron"
              size={16}
              aria-hidden="true"
            />
          </span>
        </label>
      </div>
      {noRegionalResults && (
        <div className="program-region-empty" role="status">
          <img
            className="program-region-empty-icon"
            src="/empty-region-badge.png"
            alt=""
            width="96"
            height="96"
          />
          <div className="program-region-empty-copy">
            <strong>
              Belum ada program daerah yang sesuai di{" "}
              {values.kabupaten || values.wilayah}.
            </strong>
            <p>
              Program nasional yang mencakup wilayah ini tetap dapat kamu
              jelajahi di bawah.
            </p>
          </div>
          <button
            type="button"
            className="button"
            onClick={() => applyAdvanced({ wilayah: "", kabupaten: "" })}
          >
            Hapus filter wilayah
          </button>
        </div>
      )}
      {items.length ? (
        <div className="catalog-grid program-catalog-grid">
          {items.map((item) => (
            <Card
              key={item.id}
              item={item}
              query={values.q}
              save={save}
              plans={plans}
              catalogCard
            />
          ))}
        </div>
      ) : (
        <Empty
          title={
            values.wilayah && values.wilayah !== "nasional"
              ? `Belum ada program yang sesuai di ${values.kabupaten || values.wilayah}.`
              : "Tidak ada program yang sesuai dengan pencarianmu."
          }
        >
          <p>
            Coba gunakan kata kunci lain atau kurangi filter untuk melihat lebih
            banyak program.
          </p>
          <button className="button secondary" onClick={reset}>
            Hapus filter
          </button>
          <a className="program-empty-matching" href="/cocokkan">
            Cek kebutuhan tanpa akun
          </a>
        </Empty>
      )}
      {advancedOpen && (
        <ProgramAdvancedFilters
          values={values}
          onApply={applyAdvanced}
          onClose={closeAdvanced}
        />
      )}
    </div>
  );
}
