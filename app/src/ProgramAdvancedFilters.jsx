import React, { useState } from "react";
import { filterCatalog, programs } from "./data.js";
import { registrationStatus } from "./program-timeline.js";
import {
  benefitOptions,
  educationOptions,
  periodOptions,
} from "./program-filters.js";
import { Modal } from "./ui.jsx";

export function ProgramAdvancedFilters({ values, onApply, onClose }) {
  const [draft, setDraft] = useState(() => ({
    manfaat: [...values.manfaat],
    pendidikan: values.pendidikan,
    periode: periodOptions.some(([value]) => value === values.periode)
      ? values.periode
      : "",
  }));
  const primary = {
    type: "program",
    query: values.q,
    category: values.kategori,
    region: values.wilayah,
    city: values.kabupaten,
    targets: values.sasaran,
    level: values.tingkat,
    activity: values.kegiatan,
    channel: values.kanal,
  };
  const primaryPrograms = filterCatalog(primary);
  const showEducation =
    values.kategori === "pendidikan" ||
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
  return (
    <Modal title="Filter lainnya" id="program-advanced" onClose={onClose}>
      <p className="program-filter-help">
        Persempit hasil berdasarkan informasi program.
      </p>
      <div className="program-advanced-fields">
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
      <div className="program-filter-footer">
        <button
          className="button secondary"
          onClick={() => setDraft({ manfaat: [], pendidikan: "", periode: "" })}
        >
          Reset filter tambahan
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
