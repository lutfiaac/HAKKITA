import {
  ArrowRight,
  ArrowSquareOut,
  Bell,
  BookmarkSimple,
} from "@phosphor-icons/react";
import { External } from "./ui.jsx";

export function DetailActionPanel({
  heading,
  description,
  url,
  label,
  saved,
  onSave,
  reminderActive = false,
  onReminder,
}) {
  if (onReminder) {
    return (
      <aside
        className="program-detail-actions program-access-panels-wrap"
        aria-label="Akses program dan informasi terbaru"
      >
        <div className="program-access-panels">
          <section className="program-access-card program-official-card">
            <div className="program-access-heading">
              <span className="program-access-icon" aria-hidden="true">
                <ArrowSquareOut size={20} />
              </span>
              <h2>Akses Program Resmi</h2>
            </div>
            <p>Periksa informasi terbaru melalui kanal resmi penyelenggara program.</p>
            <div className="program-access-actions">
              {url ? (
                <External className="button primary" href={url}>
                  Lihat informasi resmi
                </External>
              ) : (
                <p className="program-access-unavailable">
                  Tautan kanal resmi belum tersedia.
                </p>
              )}
            </div>
          </section>

          <section className="program-access-card program-reminder-card">
            <div className="program-access-heading">
              <span className="program-access-icon" aria-hidden="true">
                <Bell size={20} />
              </span>
              <h2>Dapatkan Informasi Terbaru</h2>
            </div>
            <p>
              Simpan program ini agar mudah ditemukan kembali, atau dapatkan
              pengingat jadwal dan pembaruan melalui email.
            </p>
            <div className="program-access-actions">
              <button
                type="button"
                className="button primary"
                onClick={onReminder}
              >
                <Bell size={18} aria-hidden="true" />
                {reminderActive ? "Kelola pengingat" : "Dapatkan pengingat email"}
              </button>
              <button
                type="button"
                className="button secondary"
                aria-pressed={saved}
                aria-label={
                  saved ? "Hapus dari Rencanaku" : "Simpan ke Rencanaku"
                }
                onClick={onSave}
              >
                <BookmarkSimple size={18} weight={saved ? "fill" : "regular"} />
                {saved ? "Tersimpan di Rencanaku" : "Simpan ke Rencanaku"}
              </button>
            </div>
          </section>
        </div>
      </aside>
    );
  }

  return (
    <aside className="program-detail-actions detail-action-panel-wrap" aria-label={heading}>
      <div className="program-action-panel detail-action-panel">
        <div className="detail-action-copy">
          <h2>{heading}</h2>
          <p>{description}</p>
        </div>
        <div className="detail-action-controls">
          {url && <External className="button primary" href={url}>{label}</External>}
          <button className="button secondary" aria-pressed={saved} onClick={onSave}>
            <BookmarkSimple size={19} weight={saved ? "fill" : "regular"} />
            {saved ? "Hapus dari Rencanaku" : "Simpan ke Rencanaku"}
          </button>
          {saved && <a className="text-link" href="/rencanaku">Buka Rencanaku <ArrowRight size={16} /></a>}
        </div>
        {onReminder && (
          <div className="detail-reminder-prompt">
            <div>
              <strong>Jangan lewatkan informasi penting</strong>
              <p>Dapatkan pengingat jadwal dan informasi terbaru tentang program ini melalui email.</p>
            </div>
            <button type="button" className="detail-reminder-link" onClick={onReminder}>
              <Bell size={17} aria-hidden="true" />
              {reminderActive ? "Kelola pengingat" : "Dapatkan pengingat email"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
