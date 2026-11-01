import React, { useState } from "react";
import {
  ArrowRight,
  ArrowCounterClockwise,
  BookmarkSimple,
  ShieldCheck,
  Trash,
  CheckCircle,
} from "@phosphor-icons/react";
import { findItem, categoryName } from "./data.js";
import { Breadcrumb, PageIntro, Empty, detailUrl } from "./ui.jsx";
import { normalizePlans } from "./account-store";
import { useAccount } from "./AccountContext";
export function Plans({ plans, setPlans, setNotice }) {
  const { account } = useAccount();
  const [legacy, setLegacy] = useState(() => {
    try {
      return localStorage.getItem("hakkita-legacy-plans-owner")
        ? {}
        : normalizePlans(
            JSON.parse(localStorage.getItem("hakkita-plans-v1") || "{}"),
          );
    } catch {
      return {};
    }
  });
  const [filter, setFilter] = useState("all"),
    [type, setType] = useState(""),
    [removed, setRemoved] = useState(null);
  const entries = Object.entries(plans)
    .sort((a, b) => (b[1].savedAt || 0) - (a[1].savedAt || 0))
    .map(([key, value]) => {
      const item = findItem(key.split(":")[0]);
      const variant = item?.variants?.find((v) => v.id === value.variant);
      const selected = variant || item;
      const docs = selected?.documents || [];
      const unavailable = !item || Boolean(value.variant && !variant);
      return { key, value, item, variant, docs, unavailable };
    });
  const isDone = (e) =>
    !e.unavailable &&
    e.docs.length > 0 &&
    e.docs.every((_, i) => e.value.done.includes(i));
  const visible = entries.filter(
    (e) =>
      (!type || e.item?.type === type) &&
      (filter === "all" || (filter === "done" ? isDone(e) : !isDone(e))),
  );
  function remove(e) {
    setRemoved(e);
    setPlans((p) => {
      const next = { ...p };
      delete next[e.key];
      return next;
    });
    setNotice("Simpanan dihapus. Kamu dapat mengembalikannya dengan Urungkan.");
  }
  function toggle(e, index) {
    setPlans((p) => ({
      ...p,
      [e.key]: {
        ...p[e.key],
        done: p[e.key].done.includes(index)
          ? p[e.key].done.filter((x) => x !== index)
          : [...p[e.key].done, index],
      },
    }));
  }
  return (
    <div className="container page">
      <Breadcrumb items={[{ label: "Rencanaku" }]} />
      <PageIntro
        title="Rencanaku"
        subtitle="Simpan pilihan dan siapkan langkah berikutnya, sedikit demi sedikit."
      />
      <div className="plan-privacy">
        <ShieldCheck size={20} />
        <p>
          Checklist ini untuk persiapan pribadi, bukan status pengajuan
          pemerintah. Simpanan terkait identitas di browser ini.
        </p>
      </div>
      {Object.keys(legacy).length > 0 && (
        <div className="info-box">
          <div>
            <h3>Ada simpanan dari versi sebelumnya.</h3>
            <p>
              Pilih impor jika simpanan perangkat tersebut milikmu. Simpanan
              akan dihubungkan ke identitas {account.identity.displayName}.
            </p>
            <button
              className="text-button"
              onClick={() => {
                setPlans((previous) => ({ ...legacy, ...previous }));
                try {
                  localStorage.setItem(
                    "hakkita-legacy-plans-owner",
                    account.identity.id,
                  );
                } catch {}
                setLegacy({});
                setNotice(
                  "Simpanan perangkat sebelumnya ditambahkan ke identitas ini.",
                );
              }}
            >
              Impor simpanan sebelumnya <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
      {removed && (
        <div className="undo-bar" role="status">
          <span>{removed.item?.name || "Simpanan"} dihapus dari rencana.</span>
          <button
            onClick={() => {
              setPlans((p) => ({ ...p, [removed.key]: removed.value }));
              setRemoved(null);
            }}
            className="text-button"
          >
            Urungkan <ArrowCounterClockwise />
          </button>
        </div>
      )}
      <div className="plan-tabs" role="group" aria-label="Filter rencana">
        {[
          ["all", "Semua"],
          ["progress", "Perlu disiapkan"],
          ["done", "Dokumen siap"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={filter === id ? "selected" : ""}
          >
            {label} {id === "all" && <span>{entries.length}</span>}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="plan-type">
        Jenis simpanan
      </label>
      <select
        id="plan-type"
        className="plan-type-filter"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">Program dan layanan</option>
        <option value="program">Program</option>
        <option value="layanan">Layanan</option>
      </select>
      {!visible.length ? (
        <Empty
          icon={BookmarkSimple}
          title={
            entries.length
              ? "Belum ada simpanan untuk filter ini."
              : "Belum ada yang kamu simpan."
          }
        >
          <p>
            {entries.length
              ? "Ubah filter untuk melihat simpanan lainnya."
              : "Program dan layanan yang kamu simpan akan muncul di sini."}
          </p>
          <div className="inline-actions">
            <a className="button primary" href="/program">
              Jelajahi Program <ArrowRight size={17} />
            </a>
            <a className="button secondary" href="/layanan">
              Cari Layanan
            </a>
          </div>
        </Empty>
      ) : (
        <div className="plans-grid">
          {visible.map((e) => (
            <article className="plan-card" key={e.key}>
              <div className="plan-card-head">
                <div>
                  <span className="category-label">
                    {e.item
                      ? categoryName(e.item.category)
                      : "Simpanan sebelumnya"}
                  </span>
                  <h2>
                    {e.item ? (
                      <a
                        href={
                          detailUrl(e.item) +
                          (e.variant ? `/${e.variant.id}` : "")
                        }
                      >
                        {e.item.name}
                      </a>
                    ) : (
                      "Informasi tidak lagi tersedia"
                    )}
                  </h2>
                  {e.variant && <p>{e.variant.name}</p>}
                </div>
                <button
                  onClick={() => remove(e)}
                  className="icon-button"
                  aria-label={`Hapus ${e.item?.name || "simpanan tidak tersedia"}`}
                >
                  <Trash size={21} />
                </button>
              </div>
              {e.unavailable ? (
                <p className="unavailable-plan">
                  Item atau jenis pengurusan ini belum tersedia dalam katalog
                  saat ini. Kamu dapat menghapusnya atau mencari panduan
                  terbaru.
                </p>
              ) : (
                <>
                  <div className="plan-goal">
                    <label htmlFor={`goal-${e.key}`}>
                      Siapkan untuk tujuan
                    </label>
                    <select
                      id={`goal-${e.key}`}
                      value={e.value.goal || ""}
                      onChange={(event) => {
                        const goal = event.target.value;
                        setPlans((p) => ({
                          ...p,
                          [e.key]: { ...p[e.key], goal },
                        }));
                      }}
                    >
                      <option value="">Belum dipilih</option>
                      {[
                        ["pendidikan", "Pendidikan"],
                        ["karier", "Pekerjaan dan karier"],
                        ["dokumen", "Dokumen pribadi"],
                        ["keluarga", "Keluarga"],
                        ["usaha", "Usaha"],
                        ["hunian", "Hunian"],
                        ["lainnya", "Tujuan lainnya"],
                      ].map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="plan-progress">
                    {e.docs.filter((_, i) => e.value.done.includes(i)).length}{" "}
                    dari {e.docs.length} dokumen siap
                  </p>
                  {e.docs.length > 0 && (
                    <progress
                      value={
                        e.docs.filter((_, i) => e.value.done.includes(i)).length
                      }
                      max={e.docs.length}
                      aria-label={`Kesiapan dokumen ${e.item.name}`}
                    />
                  )}
                  <div className="checklist">
                    {e.docs.map((doc, i) => (
                      <label key={i}>
                        <input
                          type="checkbox"
                          checked={e.value.done.includes(i)}
                          onChange={() => toggle(e, i)}
                        />
                        <span>{doc}</span>
                      </label>
                    ))}
                  </div>
                  {isDone(e) && (
                    <p className="ready-note">
                      <CheckCircle size={18} />
                      Dokumen sudah kamu tandai siap. Lanjutkan pemeriksaan
                      melalui penyelenggara.
                    </p>
                  )}
                </>
              )}
              {e.item && (
                <a
                  href={
                    detailUrl(e.item) + (e.variant ? `/${e.variant.id}` : "")
                  }
                  className="text-link"
                >
                  Lihat panduan lengkap <ArrowRight size={18} />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
