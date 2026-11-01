import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { useAccount } from "./AccountContext";
import { Breadcrumb, PageIntro, Modal } from "./ui.jsx";
import { programCategories } from "./taxonomy";
import {
  activityOptions,
  editableProfile,
  hasProfileInformation,
  profileDirty,
  profileInitials,
  profileLocation,
  profileRegions,
} from "./profile-data";

export function AccountAvatar({ name = "", email = "" }) {
  return (
    <span className="profile-account-avatar" aria-hidden="true">
      {profileInitials(name, email)}
    </span>
  );
}
function ProfileChoices({ legend, options, values, onChange, name }) {
  return (
    <fieldset className="choice-grid">
      <legend className="sr-only">{legend}</legend>
      {options.map(([value, label]) => (
        <label key={value}>
          <input
            type="checkbox"
            name={name}
            value={value}
            checked={values.includes(value)}
            onChange={() => onChange(value)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
export function ProfileEditor({ navigate, registerNavigationGuard }) {
  const { account, saveProfile, clearProfileFeedback } = useAccount();
  const editing = hasProfileInformation(account.profile);
  const [draft, setDraft] = useState(() => editableProfile(account.profile));
  const [displayName, setName] = useState(account.identity.displayName || "");
  const [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [nameError, setNameError] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const savingRef = useRef(false),
    pending = useRef(null),
    dirty = useRef(false),
    nameInput = useRef(null),
    errorRef = useRef(null);
  dirty.current = profileDirty(
    displayName,
    draft,
    account.identity.displayName || "",
    account.profile,
  );
  const cities =
    profileRegions.find((province) => province.code === draft.provinceCode)
      ?.cities || [];
  const closeLeave = useCallback(() => {
    pending.current?.cancel?.();
    pending.current = null;
    setLeaveOpen(false);
  }, []);
  useEffect(() => {
    clearProfileFeedback();
  }, [clearProfileFeedback]);
  useEffect(
    () =>
      registerNavigationGuard?.((_to, proceed, cancel) => {
        if (!dirty.current) proceed();
        else {
          pending.current = { proceed, cancel };
          setLeaveOpen(true);
        }
      }),
    [registerNavigationGuard],
  );
  useEffect(() => {
    const unload = (event) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, []);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function toggle(key, value) {
    setDraft((previous) => {
      const values = previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value];
      return {
        ...previous,
        [key]: values,
        ...(key === "activities" && !values.includes("lainnya")
          ? { activitiesOther: "" }
          : {}),
      };
    });
  }
  async function submit(event) {
    event.preventDefault();
    if (savingRef.current) return;
    if (!displayName.trim() || displayName.trim().length > 60) {
      setNameError("Isi nama tampilan dengan 1–60 karakter.");
      nameInput.current?.focus();
      return;
    }
    setNameError("");
    setError("");
    savingRef.current = true;
    setSaving(true);
    try {
      const result = await saveProfile(displayName, {
        ...account.profile,
        ...draft,
      });
      if (!result.ok) {
        setError(
          result.error || "Perubahan belum berhasil disimpan. Coba lagi.",
        );
        return;
      }
      dirty.current = false;
      navigate("/profil");
    } catch {
      setError("Perubahan belum berhasil disimpan. Coba lagi.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  const title = editing ? "Ubah profil" : "Lengkapi profilmu";
  return (
    <div className="container page profile-editor revised-profile-editor">
      <Breadcrumb
        items={[{ label: "Profil Saya", href: "/profil" }, { label: title }]}
      />
      <PageIntro
        title={title}
        subtitle={
          editing
            ? "Perbarui informasi profilmu agar rekomendasi tetap sesuai kebutuhanmu."
            : "Isi informasi yang sesuai dengan dirimu untuk membantu menemukan program yang lebih relevan."
        }
      />
      <form
        className="profile-form"
        noValidate
        onSubmit={submit}
        aria-busy={saving}
      >
        {error && (
          <p
            className="profile-error"
            role="alert"
            ref={errorRef}
            tabIndex={-1}
          >
            {error}
          </p>
        )}
        <fieldset className="profile-editor-fields" disabled={saving}>
          <section>
            <h2>Informasi akun</h2>
            <div className="profile-field profile-name-field">
              <label htmlFor="profile-name">Nama Lengkap</label>
              <input
                id="profile-name"
                ref={nameInput}
                autoComplete="nickname"
                maxLength={60}
                value={displayName}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                }}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "profile-name-error" : undefined}
              />
              {nameError && (
                <p
                  className="profile-error"
                  id="profile-name-error"
                  role="alert"
                >
                  {nameError}
                </p>
              )}
            </div>
          </section>
          <section>
            <h2>Informasi untuk rekomendasi</h2>
            <h3>Wilayah domisili</h3>
            <p>
              Wilayah membantu menampilkan program yang tersedia di daerahmu.
            </p>
            <div className="form-grid">
              <div className="profile-field">
                <label htmlFor="profile-province">Provinsi (opsional)</label>
                <select
                  id="profile-province"
                  value={draft.provinceCode}
                  onChange={(event) => {
                    const province = profileRegions.find(
                      (item) => item.code === event.target.value,
                    );
                    setDraft((previous) => {
                      const city = province?.cities.find(
                        (item) => item.code === previous.cityCode,
                      );
                      return {
                        ...previous,
                        provinceCode: province?.code || "",
                        province: province?.name || "",
                        cityCode: city?.code || "",
                        city: city?.name || "",
                      };
                    });
                  }}
                >
                  <option value="">Pilih provinsi</option>
                  {profileRegions.map((province) => (
                    <option value={province.code} key={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="profile-field">
                <label htmlFor="profile-city">Kabupaten/kota (opsional)</label>
                <select
                  id="profile-city"
                  value={draft.cityCode}
                  disabled={!draft.provinceCode}
                  onChange={(event) => {
                    const city = cities.find(
                      (item) => item.code === event.target.value,
                    );
                    setDraft((previous) => ({
                      ...previous,
                      cityCode: city?.code || "",
                      city: city?.name || "",
                    }));
                  }}
                >
                  <option value="">
                    {draft.provinceCode
                      ? "Pilih kabupaten/kota"
                      : "Pilih provinsi dahulu"}
                  </option>
                  {cities.map((city) => (
                    <option value={city.code} key={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="profile-form-group">
              <h3>Kegiatan saat ini</h3>
              <p>
                Pilih kegiatan yang sesuai dengan keseharianmu. Kamu bisa
                memilih lebih dari satu.
              </p>
              <ProfileChoices
                name="activities"
                legend="Kegiatan saat ini"
                options={activityOptions}
                values={draft.activities}
                onChange={(value) => toggle("activities", value)}
              />
              {draft.activities.includes("lainnya") && (
                <div className="profile-field profile-other-field">
                  <label htmlFor="profile-other">
                    Kegiatan lainnya (opsional)
                  </label>
                  <input
                    id="profile-other"
                    maxLength={100}
                    value={draft.activitiesOther}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        activitiesOther: event.target.value,
                      }))
                    }
                    aria-describedby="profile-other-hint"
                  />
                  <p id="profile-other-hint" className="field-help">
                    Catatan ini belum digunakan untuk mencocokkan persyaratan
                    program.
                  </p>
                </div>
              )}
            </div>
            <div className="profile-form-group">
              <h3>Minat program</h3>
              <p>
                Pilih kategori program yang kamu minati. Kamu bisa memilih lebih
                dari satu.
              </p>
              <ProfileChoices
                name="interests"
                legend="Bidang program yang diminati"
                options={programCategories.map((category) => [
                  category.id,
                  category.name,
                ])}
                values={draft.interests}
                onChange={(value) => toggle("interests", value)}
              />
            </div>
          </section>
        </fieldset>
        <div className="profile-save-bar">
          <button type="submit" className="button primary" disabled={saving}>
            {saving
              ? "Menyimpan…"
              : editing
                ? "Simpan perubahan"
                : "Simpan profil"}
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            className="text-button"
            disabled={saving}
            onClick={() => navigate(editing ? "/profil" : "/program")}
          >
            {editing ? "Batal" : "Lewati untuk sekarang"}
          </button>
        </div>
      </form>
      {leaveOpen && (
        <Modal
          id="profile-unsaved"
          title="Tinggalkan perubahan?"
          onClose={closeLeave}
        >
          <p>
            Perubahan profilmu belum disimpan. Jika kamu meninggalkan halaman
            ini, perubahan tersebut akan hilang.
          </p>
          <div className="inline-actions">
            <button className="button secondary" onClick={closeLeave}>
              Tetap mengedit
            </button>
            <button
              className="button primary"
              onClick={() => {
                const action = pending.current?.proceed;
                dirty.current = false;
                pending.current = null;
                setLeaveOpen(false);
                action?.();
              }}
            >
              Tinggalkan
            </button>
          </div>
          {account.profile.city && !profileLocation(account.profile).city && (
            <p className="field-help">
              Kabupaten/kota sebelumnya belum cocok dengan data wilayah. Pilih
              ulang jika diperlukan.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
export function ProfilePage({ navigate }) {
  const { account, clearProfile, logout, profileFeedback } = useAccount();
  const [confirm, setConfirm] = useState(false),
    [deleting, setDeleting] = useState(false),
    [error, setError] = useState("");
  const busy = useRef(false);
  const profile = account.profile,
    hasProfile = hasProfileInformation(profile);
  const location = profileLocation(profile);
  const activities = (profile.activities || [])
    .map((value) => activityOptions.find(([id]) => id === value)?.[1])
    .filter(Boolean);
  const interests = (profile.interests || [])
    .map((value) => programCategories.find((item) => item.id === value)?.name)
    .filter(Boolean);
  const closeConfirm = useCallback(() => {
    if (!busy.current) setConfirm(false);
  }, []);
  async function removeProfile() {
    if (busy.current) return;
    busy.current = true;
    setDeleting(true);
    setError("");
    try {
      const result = await clearProfile();
      if (result.ok) setConfirm(false);
      else
        setError(
          result.error || "Informasi profil belum berhasil dihapus. Coba lagi.",
        );
    } catch {
      setError("Informasi profil belum berhasil dihapus. Coba lagi.");
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  }
  return (
    <div className="container page revised-profile-page">
      <Breadcrumb items={[{ label: "Profil Saya" }]} />
      <PageIntro
        title="Profil Saya"
        subtitle="Kelola informasi profilmu untuk mendapatkan rekomendasi program yang lebih relevan."
      />
      {profileFeedback && (
        <p className="success-message" role="status">
          {profileFeedback}
        </p>
      )}
      <section className="profile-account-section">
        <h2>Informasi akun</h2>
        <div className="profile-account-identity">
          <AccountAvatar
            name={account.identity.displayName}
            email={account.identity.email}
          />
          <div>
            <h3>{account.identity.displayName || account.identity.email}</h3>
            <p>{account.identity.email}</p>
          </div>
        </div>
      </section>
      <section className="profile-information-section">
        <h2>Informasi profil</h2>
        {hasProfile ? (
          <>
            <dl className="profile-summary">
              <div>
                <dt>Wilayah domisili</dt>
                <dd>
                  {[
                    location.province || profile.province,
                    location.city || profile.city,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Belum diisi"}
                </dd>
              </div>
              <div>
                <dt>Kegiatan saat ini</dt>
                <dd>
                  {activities.join(", ") || "Belum diisi"}
                  {profile.activities?.includes("lainnya") &&
                    profile.activitiesOther && (
                      <p className="profile-other-summary">
                        {profile.activitiesOther}
                      </p>
                    )}
                </dd>
              </div>
              <div>
                <dt>Minat program</dt>
                <dd>{interests.join(", ") || "Belum diisi"}</dd>
              </div>
            </dl>
            <div className="inline-actions">
              <a href="/profil/edit" className="button primary">
                Ubah profil <ArrowRight size={18} />
              </a>
              <a href="/program/rekomendasi" className="button secondary">
                Lihat rekomendasi
              </a>
            </div>
          </>
        ) : (
          <div className="profile-simple-empty">
            <h3>Informasi profil belum dilengkapi</h3>
            <p>
              Tambahkan informasi tentang dirimu untuk membantu menemukan
              program yang sesuai kebutuhanmu.
            </p>
            <a href="/profil/edit" className="button primary">
              Lengkapi profil <ArrowRight size={18} />
            </a>
          </div>
        )}
      </section>
      <section className="profile-account-settings">
        <h2>Pengaturan akun</h2>
        <div>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setError("");
              setConfirm(true);
            }}
          >
            Hapus informasi profil
          </button>
          <p>
            Hapus informasi personalisasi tanpa menghapus akun atau Rencanaku.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/", logout)}
          >
            Keluar dari akun
          </button>
          <p>
            Akhiri sesi akunmu. Informasi profil dan program yang disimpan tetap
            tersedia.
          </p>
        </div>
      </section>
      {confirm && (
        <Modal
          id="clear-profile"
          title="Hapus informasi profil?"
          onClose={closeConfirm}
        >
          <p>
            Wilayah, kegiatan, dan minat program yang kamu simpan akan dihapus.
            Akun dan Rencanaku tetap tersedia.
          </p>
          {error && (
            <p className="profile-error" role="alert">
              {error}
            </p>
          )}
          <div className="inline-actions">
            <button
              type="button"
              className="button secondary"
              onClick={closeConfirm}
              disabled={deleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="button primary"
              onClick={removeProfile}
              disabled={deleting}
            >
              {deleting ? "Menghapus…" : "Hapus informasi"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
