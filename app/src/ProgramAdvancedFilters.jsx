import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { filterCatalog, programCategories, programs } from "./data.js";
import { targetGroups } from "./taxonomy";
import { ProgramRegionFields } from "./ProgramRegionFilter.jsx";
import { registrationStatus } from "./program-timeline.js";
import {
  benefitOptions,
  educationOptions,
  periodOptions,
} from "./program-filters.js";
import { Modal } from "./ui.jsx";

export function ProgramAdvancedFilters({
  values,
  onApply,
  onClose,
  allFilters = false,
}) {
  const emptyPrimary = {
    kategori: "",
    wilayah: "",
    kabupaten: "",
    sasaran: [],
  };
  const [draft, setDraft] = useState(() => ({
    ...(allFilters
      ? {
          kategori: values.kategori,
          wilayah: values.wilayah,
          kabupaten: values.kabupaten,
          sasaran: [...values.sasaran],
        }
      : {}),
    manfaat: [...values.manfaat],
    pendidikan: values.pendidikan,
    periode: periodOptions.some(([value]) => value === values.periode)
      ? values.periode
      : "",
  }));
  const selected = { ...values, ...draft };
  const updateDraft = (patch) =>
    setDraft((previous) => ({ ...previous, ...patch }));
  const primary = {
    type: "program",
    query: values.q,
    category: selected.kategori,
    region: selected.wilayah,
    city: selected.kabupaten,
    targets: selected.sasaran,
    level: values.tingkat,
    activity: values.kegiatan,
    channel: values.kanal,
  };
  const primaryPrograms = filterCatalog(primary);
  const showEducation =
    selected.kategori === "pendidikan" ||
    primaryPrograms.some((program) => program.educationLevels?.length) ||
    Boolean(draft.pendidikan);
  const showPeriod =
    programs.filter((program) => registrationStatus(program) !== "unknown")
      .length >
    programs.length / 2;
  const previewCount = filterCatalog({
    ...primary,
    benefit: draft.manfaat,
    education: draft.pendidikan,
    periodStatus: draft.periode,
  }).length;
  const fields = (
    <>
      <p className="program-filter-help">
        Persempit hasil berdasarkan informasi program.
      </p>
      <div className="program-advanced-fields">
        {allFilters && (
          <>
            <div>
              <label htmlFor="drawer-category-filter">Kategori program</label>
              <span className="program-select-control">
                <select
                  id="drawer-category-filter"
                  value={draft.kategori}
                  onChange={(event) =>
                    updateDraft({ kategori: event.target.value })
                  }
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
            <div className="program-drawer-region">
              <ProgramRegionFields
                idPrefix="drawer-"
                province={draft.wilayah}
                city={draft.kabupaten}
                onChange={updateDraft}
              />
            </div>
            <fieldset className="program-benefit-options">
              <legend>Sasaran penerima</legend>
              {targetGroups.map(([value, label]) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    value={value}
                    checked={draft.sasaran.includes(value)}
                    onChange={() =>
                      setDraft((previous) => ({
                        ...previous,
                        sasaran: previous.sasaran.includes(value)
                          ? previous.sasaran.filter((item) => item !== value)
                          : [...previous.sasaran, value],
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </>
        )}
        <fieldset className="program-benefit-options">
          <legend>Jenis manfaat</legend>
          {benefitOptions.map(([value, label]) => (
            <label key={value}>
              <input
                type="checkbox"
                value={value}
                checked={draft.manfaat.includes(value)}
                onChange={() =>
                  setDraft((previous) => ({
                    ...previous,
                    manfaat: previous.manfaat.includes(value)
                      ? previous.manfaat.filter((item) => item !== value)
                      : [...previous.manfaat, value],
                  }))
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
        {showEducation && (
          <div>
            <label htmlFor="education-filter">Jenjang pendidikan</label>
            <select
              id="education-filter"
              value={draft.pendidikan}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  pendidikan: event.target.value,
                }))
              }
            >
              <option value="">Semua jenjang</option>
              {educationOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="program-filter-help education-context">
              Mengikuti jenjang dalam persyaratan program; periksa detail untuk
              konteksnya.
            </p>
          </div>
        )}
        {showPeriod && (
          <div>
            <label htmlFor="period-filter">Periode pendaftaran</label>
            <select
              id="period-filter"
              value={draft.periode}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  periode: event.target.value,
                }))
              }
            >
              <option value="">Semua periode</option>
              {periodOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
  return (
    <Modal
      title={allFilters ? "Filter program" : "Filter lainnya"}
      id={allFilters ? "program-mobile-filters" : "program-advanced"}
      className={allFilters ? "program-filter-drawer" : ""}
      onClose={onClose}
    >
      {allFilters ? (
        <div className="program-filter-drawer-body">{fields}</div>
      ) : (
        fields
      )}
      <div className="program-filter-footer">
        <button
          className="button secondary"
          onClick={() =>
            setDraft({
              ...(allFilters ? emptyPrimary : {}),
              manfaat: [],
              pendidikan: "",
              periode: "",
            })
          }
        >
          {allFilters ? "Reset filter" : "Reset filter tambahan"}
        </button>
        <button
          className="button primary"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          Tampilkan {previewCount} program
        </button>
      </div>
    </Modal>
  );
}
