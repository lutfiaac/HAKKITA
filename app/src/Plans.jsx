import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookmarkSimple,
  FileText,
  GraduationCap,
  Info,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  findItem,
  parseSavedItemKey,
  savedItemKey,
} from "./data.js";
import { preparationItems, preparationRoute } from "./preparation-model.js";
import { Breadcrumb, Empty, Modal, PageIntro, detailUrl, hrefWith } from "./ui.jsx";

const pageSize = 12;

function SavedEmpty({ icon, title, children, className = "" }) {
  return (
    <Empty icon={icon} iconSize={64} title={title} className={`rencana-empty ${className}`}>
      {children}
    </Empty>
  );
}

export function PlansGuest({ next = "/rencanaku" }) {
  return (
    <div className="container page rencanaku-page">
      <Breadcrumb items={[{ label: "Rencanaku" }]} />
      <PageIntro
        title="Rencanaku"
        subtitle="Simpan program dan layanan pilihanmu, siapkan kebutuhan, dan dapatkan pengingat penting."
      />
      <SavedEmpty icon={ShieldCheck} title="Masuk untuk melihat Rencanaku">
        <p>Masuk atau buat akun agar kamu bisa menyimpan program dan layanan, mencatat persiapan, serta mendapatkan pengingat.</p>
        <div className="rencana-empty-actions">
          <a
            className="button primary"
            href={hrefWith("/masuk", { next })}
          >
            Masuk / Daftar <ArrowRight size={18} />
          </a>
          <a className="button secondary" href="/program">
            Jelajahi program
          </a>
        </div>
      </SavedEmpty>
    </div>
  );
}

export function Plans({
  plans = {},
  setPlans,
  setNotice,
  loadError = false,
  onRetry,
}) {
  const [filter, setFilter] = useState("program");
  const [page, setPage] = useState(1);
  const [removeTarget, setRemoveTarget] = useState(null);
  const candidates = Object.entries(plans)
    .map(([key, value]) => {
      const reference = parseSavedItemKey(key);
      const catalogItem = findItem(reference.id);
      const type =
        reference.type || value.itemType || catalogItem?.type || "";
      const item =
        reference.type && catalogItem?.type !== reference.type
          ? undefined
          : catalogItem;
      const variantId = reference.variant || value.variant || "";
      const variant = item?.variants?.find((option) => option.id === variantId);
      return {
        key,
        value,
        item,
        type,
        variant,
        variantId,
        unavailable: !item || Boolean(variantId && !variant),
      };
    })
    .sort((a, b) => (b.value.savedAt || 0) - (a.value.savedAt || 0));
  const uniqueEntries = new Map();
  for (const entry of candidates) {
    const canonical = entry.item
      ? savedItemKey(entry.item, entry.variant?.id || entry.variantId)
      : entry.key;
    const existing = uniqueEntries.get(canonical);
    if (existing) {
      existing.keys.push(entry.key);
      if (entry.key === canonical) {
        existing.key = entry.key;
        existing.value = entry.value;
        existing.item = entry.item;
        existing.variant = entry.variant;
        existing.variantId = entry.variantId;
        existing.type = entry.type;
        existing.unavailable = entry.unavailable;
      }
    } else uniqueEntries.set(canonical, { ...entry, keys: [entry.key] });
  }
  const entries = [...uniqueEntries.values()];
  const programCount = entries.filter((entry) => entry.type === "program").length;
  const serviceCount = entries.filter((entry) => entry.type === "layanan").length;
  const tabs = [
    { id: "program", label: "Program", count: programCount },
    { id: "layanan", label: "Layanan Publik", count: serviceCount },
  ];
  const visible = entries.filter((entry) => entry.type === filter);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageEntries = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function commitRemove(entry) {
    setPlans((previous) => {
      const next = { ...previous };
      entry.keys.forEach((key) => delete next[key]);
      return next;
    });
    setNotice("Dihapus dari Rencanaku.");
  }

  function remove(entry) {
    if (entry.type === "program" && entry.value.reminder?.enabled) {
      setRemoveTarget(entry);
      return;
    }
    commitRemove(entry);
  }

  function selectTab(tabId) {
    setFilter(tabId);
    setPage(1);
  }

  function moveTab(event, index) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    event.currentTarget.parentElement
      ?.querySelector(`[data-tab-id="${nextTab.id}"]`)
      ?.focus();
    selectTab(nextTab.id);
  }

  function emptyState() {
    return filter === "program" ? (
      <SavedEmpty icon={GraduationCap} title="Belum ada program yang disimpan">
        <p>Temukan dan simpan program yang menarik agar kamu bisa melihatnya kembali kapan saja.</p>
        <div className="rencana-empty-actions">
          <a className="button primary" href="/program">Jelajahi program <ArrowRight size={18} /></a>
        </div>
      </SavedEmpty>
    ) : (
      <SavedEmpty icon={FileText} title="Belum ada layanan yang disimpan">
        <p>Simpan panduan layanan yang kamu butuhkan agar mudah ditemukan kembali saat diperlukan.</p>
        <div className="rencana-empty-actions">
          <a className="button primary" href="/layanan">Jelajahi layanan <ArrowRight size={18} /></a>
        </div>
      </SavedEmpty>
    );
  }

  return (
    <div className="container page rencanaku-page">
      <Breadcrumb items={[{ label: "Rencanaku" }]} />
      <PageIntro
        title="Rencanaku"
        subtitle="Simpan program dan layanan pilihanmu, siapkan kebutuhan, dan dapatkan pengingat penting."
      />
      {loadError ? (
        <SavedEmpty
          icon={Info}
          title="Rencanaku belum dapat ditampilkan"
          className="rencana-error-state"
        >
          <p>Ada kendala saat memuat informasi yang kamu simpan. Coba lagi.</p>
          <div className="rencana-empty-actions">
            <button className="button primary" onClick={onRetry}>
              Coba lagi <ArrowRight size={18} />
            </button>
          </div>
        </SavedEmpty>
      ) : (
        <>
          <div className="rencana-tabs" role="tablist" aria-label="Jenis simpanan">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                id={`rencana-tab-${tab.id}`}
                data-tab-id={tab.id}
                role="tab"
                aria-selected={filter === tab.id}
                aria-controls="rencana-results"
                tabIndex={filter === tab.id ? 0 : -1}
                className={filter === tab.id ? "is-active" : ""}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => moveTab(event, index)}
              >
                {tab.label} <span>{tab.count}</span>
              </button>
            ))}
          </div>
          <div
            id="rencana-results"
            role="tabpanel"
            aria-labelledby={`rencana-tab-${filter}`}
            tabIndex={0}
            aria-live="polite"
          >
            {visible.length === 0 ? (
              emptyState()
            ) : (
              <>
                <div
                  className="rencana-grid"
                >
                {pageEntries.map((entry) => {
                  const href =
                    entry.item && !entry.unavailable
                      ? `${detailUrl(entry.item)}${entry.variant ? `/${entry.variant.id}` : ""}`
                      : "";
                  const checklistItems = entry.item
                    ? preparationItems(entry.item, entry.variantId)
                    : [];
                  const completed = checklistItems.filter(
                    (task) => entry.value.checklist?.[task.id],
                  ).length;
                  const preparationHref = entry.item
                    ? preparationRoute(entry.item, entry.variantId)
                    : "";
                  return (
                    <article className="rencana-card" key={entry.key}>
                      <div className="rencana-card-top">
                        <h2>
                          {href ? (
                            <a href={href}>{entry.item.name}</a>
                          ) : (
                            entry.item?.name || "Informasi tidak tersedia"
                          )}
                        </h2>
                        <button
                          type="button"
                          className="rencana-remove"
                          aria-label={`Hapus ${entry.item?.name || "informasi"} dari Rencanaku`}
                          title="Hapus dari Rencanaku"
                          onClick={() => remove(entry)}
                        >
                          <BookmarkSimple size={20} weight="fill" />
                        </button>
                      </div>
                      {entry.variant && (
                        <p className="rencana-variant">{entry.variant.name}</p>
                      )}
                      {entry.unavailable ? (
                        <p className="rencana-unavailable">
                          Informasi tidak tersedia di katalog saat ini.
                        </p>
                      ) : entry.item?.summary ? (
                        <p className="rencana-summary">{entry.item.summary}</p>
                      ) : null}
                      <div className="rencana-preparation-summary">
                        <span className="rencana-preparation-title">Persiapan</span>
                        {checklistItems.length ? (
                          <>
                            <span>{completed} dari {checklistItems.length} sudah ditandai</span>
                            <div
                              className="rencana-progress-track"
                              role="progressbar"
                              aria-label={`Progres persiapan ${entry.item?.name || ""}`}
                              aria-valuemin={0}
                              aria-valuemax={checklistItems.length}
                              aria-valuenow={completed}
                            >
                              <span style={{ width: `${Math.round((completed / checklistItems.length) * 100)}%` }} />
                            </div>
                          </>
                        ) : (
                          <span className="rencana-preparation-muted">Daftar persiapan belum tersedia</span>
                        )}
                      </div>
                      {entry.type === "program" && (
                        <p className={`rencana-reminder-status${entry.value.reminder?.enabled ? " is-active" : ""}`}>
                          <Bell size={16} aria-hidden="true" />
                          {entry.value.reminder?.enabled ? "Pengingat email aktif" : "Pengingat belum diaktifkan"}
                        </p>
                      )}
                      <div className="rencana-card-actions">
                        {preparationHref ? (
                          <a className="rencana-detail-link" href={preparationHref}>
                            Atur persiapan <ArrowRight size={18} />
                          </a>
                        ) : (
                          <span className="rencana-unavailable-label">
                            Informasi tidak tersedia
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
                </div>
                {pageCount > 1 && (
                  <nav className="rencana-pagination" aria-label="Halaman simpanan">
                    <button
                    type="button"
                    className="button secondary"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ArrowLeft size={17} /> Sebelumnya
                    </button>
                    <span aria-live="polite">
                      Halaman {currentPage} dari {pageCount}
                    </span>
                    <button
                    type="button"
                    className="button secondary"
                    disabled={currentPage >= pageCount}
                    onClick={() =>
                      setPage((value) => Math.min(pageCount, value + 1))
                    }
                  >
                    Berikutnya <ArrowRight size={17} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </>
      )}
      {removeTarget && (
        <Modal
          title="Hapus program dari Rencanaku?"
          onClose={() => setRemoveTarget(null)}
          id="remove-reminder-dialog"
        >
          <p>Program ini akan dihapus dari daftar tersimpan dan pengingatnya akan dinonaktifkan.</p>
          <div className="inline-actions">
            <button
              type="button"
              className="button primary"
              onClick={() => {
                commitRemove(removeTarget);
                setRemoveTarget(null);
              }}
            >
              Hapus program
            </button>
            <button type="button" className="button secondary" onClick={() => setRemoveTarget(null)}>
              Batal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
