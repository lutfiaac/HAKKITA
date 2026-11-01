import React, { useEffect, useRef, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import dataset from "./data/indonesia-regions.json";

export function ProgramRegionFilter({ province, city, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null),
    trigger = useRef(null);
  const cities =
    dataset.regions.find((region) => region.name === province)?.cities || [];
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      className="program-region-control"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        ref={trigger}
        className="program-filter-button"
        aria-expanded={open}
        aria-controls="program-region-options"
        aria-label={`Wilayah: ${city || (province === "nasional" ? "Nasional" : province) || "Semua wilayah"}`}
        onClick={() => setOpen(!open)}
      >
        <span>
          {city ||
            (province === "nasional" ? "Nasional" : province) ||
            "Semua wilayah"}
        </span>
        <CaretDown size={16} aria-hidden="true" />
      </button>
      <div
        className="program-region-popover"
        id="program-region-options"
        hidden={!open}
      >
        <p className="program-region-heading">Pilih wilayah</p>
        <label htmlFor="region-filter">Provinsi</label>
        <span className="program-select-control">
          <select
            id="region-filter"
            value={province}
            onChange={(event) =>
              onChange({ wilayah: event.target.value, kabupaten: "" })
            }
          >
            <option value="">Semua wilayah</option>
            <option value="nasional">Nasional</option>
            {dataset.regions.map((region) => (
              <option key={region.code}>{region.name}</option>
            ))}
          </select>
          <CaretDown
            className="program-select-chevron"
            size={16}
            aria-hidden="true"
          />
        </span>
        <label htmlFor="city-filter">Kabupaten/kota</label>
        <span className="program-select-control">
          <select
            id="city-filter"
            value={city || ""}
            disabled={!cities.length}
            onChange={(event) => onChange({ kabupaten: event.target.value })}
          >
            <option value="">
              {cities.length ? "Semua kabupaten/kota" : "Pilih provinsi dahulu"}
            </option>
            {cities.map((city) => (
              <option key={city.code}>{city.name}</option>
            ))}
          </select>
          <CaretDown
            className="program-select-chevron"
            size={16}
            aria-hidden="true"
          />
        </span>
        <div className="program-region-footer">
          <button
            type="button"
            className="text-button"
            onClick={() => onChange({ wilayah: "", kabupaten: "" })}
          >
            Hapus wilayah
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
