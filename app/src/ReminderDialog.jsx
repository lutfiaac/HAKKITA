import { useState } from "react";
import { Bell, CheckCircle } from "@phosphor-icons/react";
import { Modal } from "./ui.jsx";

export function ReminderDialog({
  item,
  email,
  reminder,
  scheduleAvailable,
  onSave,
  onDisable,
  onClose,
}) {
  const [schedule, setSchedule] = useState(Boolean(reminder?.schedule));
  const [updates, setUpdates] = useState(Boolean(reminder?.updates));
  const canSave = schedule || updates;

  return (
    <Modal title="Dapatkan pengingat program" onClose={onClose} id="reminder-dialog">
      <div className="reminder-dialog-content">
        <p className="reminder-dialog-intro">
          Pilih informasi yang ingin kamu terima melalui email.
        </p>
        <div className="reminder-program-name">
          <Bell size={18} aria-hidden="true" />
          <strong>{item.name}</strong>
        </div>

        <fieldset className="reminder-options">
          <legend>Jenis pengingat</legend>
          {scheduleAvailable ? (
            <label className="reminder-option">
              <input
                type="checkbox"
                checked={schedule}
                onChange={(event) => setSchedule(event.target.checked)}
              />
              <span>
                <strong>Pengingat jadwal</strong>
                <small>Ingatkan saya saat jadwal penting program semakin dekat.</small>
              </span>
            </label>
          ) : (
            <p className="reminder-schedule-unavailable">
              Jadwal resmi belum tersedia. Pengingat jadwal belum dapat diatur.
            </p>
          )}
          <label className="reminder-option">
            <input
              type="checkbox"
              checked={updates}
              onChange={(event) => setUpdates(event.target.checked)}
            />
            <span>
              <strong>Info terbaru program</strong>
              <small>
                Beri tahu saya jika ada pembaruan informasi resmi tentang program ini.
              </small>
            </span>
          </label>
        </fieldset>

        <div className="reminder-email">
          <span>Email tujuan</span>
          <strong>{email || "Email akun belum tersedia"}</strong>
        </div>
        <p className="reminder-manage-note">
          Kamu bisa mengubah atau berhenti menerima pengingat kapan saja melalui Rencanaku.
        </p>
        <div className="reminder-dialog-actions">
          {reminder?.enabled && (
            <button className="button reminder-stop" type="button" onClick={onDisable}>
              Berhenti menerima pengingat
            </button>
          )}
          <button className="button secondary" type="button" onClick={onClose}>
            Batal
          </button>
          <button
            className="button primary"
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ schedule, updates })}
          >
            <CheckCircle size={18} /> Simpan pengingat
          </button>
        </div>
      </div>
    </Modal>
  );
}
