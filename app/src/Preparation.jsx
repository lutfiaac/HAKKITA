import { ArrowLeft, ArrowRight, Bell, CheckCircle, FileText } from "@phosphor-icons/react";
import { legacySavedItemKey, savedItemKey } from "./data.js";
import { preparationItems, preparationRoute } from "./preparation-model.js";
import { Breadcrumb, PageIntro, detailUrl } from "./ui.jsx";

export function Preparation({
  item,
  variantId = "",
  plan,
  setPlans,
  onReminder,
}) {
  if (!item || !plan) return null;
  const variant = item.variants?.find((option) => option.id === variantId);
  const tasks = preparationItems(item, variantId);
  const checklist = plan.checklist || {};
  const completed = tasks.filter((task) => checklist[task.id]).length;
  const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const reminderActive = Boolean(plan.reminder?.enabled);
  const contentDetail = `${detailUrl(item)}${variant ? `/${variant.id}` : ""}`;

  function toggle(taskId) {
    setPlans((previous) => {
      const key = savedItemKey(item, variant?.id || "");
      const legacyKey = legacySavedItemKey(item, variant?.id || "");
      const current = previous[key] || previous[legacyKey] || plan;
      const next = {
        ...previous,
        [key]: {
          ...current,
          itemType: item.type,
          variant: variant?.id || "",
          checklist: {
            ...(current.checklist || {}),
            [taskId]: !current.checklist?.[taskId],
          },
        },
      };
      if (legacyKey !== key) delete next[legacyKey];
      return next;
    });
  }

  return (
    <div className="container page preparation-page">
      <Breadcrumb
        items={[
          { label: "Rencanaku", href: "/rencanaku" },
          { label: item.name, href: preparationRoute(item, variant?.id || "") },
          { label: "Persiapan" },
        ]}
      />
      <PageIntro
        title={item.name}
        subtitle={item.summary || "Kelola persiapan untuk informasi yang kamu simpan."}
      />
      <div className="preparation-content">
        {variant && <p className="preparation-variant">{variant.name}</p>}
        <section className="preparation-section" aria-labelledby="preparation-heading">
          <header className="preparation-section-heading">
            <div>
              <h2 id="preparation-heading">Daftar persiapan</h2>
              <p>Tandai dokumen dan langkah yang sudah kamu siapkan.</p>
            </div>
            {tasks.length > 0 && (
              <div className="preparation-progress-copy" aria-live="polite">
                <strong>{completed} dari {tasks.length} sudah ditandai</strong>
              </div>
            )}
          </header>

          {tasks.length ? (
            <>
              {tasks.length >= 2 && <div
                className="preparation-progress-track"
                role="progressbar"
                aria-label="Progres persiapan"
                aria-valuemin={0}
                aria-valuemax={tasks.length}
                aria-valuenow={completed}
              >
                <span style={{ width: `${percentage}%` }} />
              </div>}
              {completed === tasks.length && (
                <p className="preparation-complete" role="status">
                  <CheckCircle size={18} weight="fill" /> Semua persiapan dalam daftar ini sudah kamu tandai.
                </p>
              )}
              <ul className="preparation-checklist">
                {tasks.map((task) => (
                  <li key={task.id} className={checklist[task.id] ? "is-checked" : ""}>
                    <label htmlFor={`prep-${task.id}`}>
                      <input
                        id={`prep-${task.id}`}
                        type="checkbox"
                        checked={Boolean(checklist[task.id])}
                        onChange={() => toggle(task.id)}
                      />
                      <span className="preparation-task-copy">
                        <strong>{task.name}</strong>
                        {task.note && <small>{task.note}</small>}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="preparation-note">
                Daftar ini hanya membantu mencatat persiapanmu. Pastikan kembali persyaratannya melalui sumber resmi.
              </p>
            </>
          ) : (
            <div className="preparation-empty">
                <span className="preparation-empty-icon"><FileText size={28} aria-hidden="true" /></span>
              <h3>Belum ada daftar persiapan</h3>
              <p>Kamu tetap bisa melihat persyaratan dan langkah selanjutnya melalui panduan yang tersedia.</p>
              <a className="button secondary" href={contentDetail}>
                {item.type === "program" ? "Lihat detail program" : "Lihat panduan layanan"}
                <ArrowRight size={17} />
              </a>
            </div>
          )}
        </section>

        {item.type === "program" && (
          <section className="preparation-reminder" aria-labelledby="preparation-reminder-heading">
            <div className="preparation-reminder-icon"><Bell size={20} aria-hidden="true" /></div>
            <div>
              <h2 id="preparation-reminder-heading">Pengingat email</h2>
              <p>{reminderActive ? "Pengingat email aktif" : "Pengingat belum diaktifkan"}</p>
            </div>
            <button className="button secondary" type="button" onClick={onReminder}>
              {reminderActive ? "Kelola pengingat" : "Dapatkan pengingat email"}
            </button>
          </section>
        )}

        <div className="preparation-footer-actions">
          <a className="text-link" href="/rencanaku"><ArrowLeft size={17} /> Kembali ke Rencanaku</a>
          <a className="button primary" href={contentDetail}>
            {item.type === "program" ? "Lihat detail program" : "Lihat panduan layanan"}
            <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}
