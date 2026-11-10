import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Info,
} from "@phosphor-icons/react";
import { programs, programCategories } from "./data.js";
import { useAccount } from "./AccountContext";
import { activityOptions, educationOptions, editableProfile, hasProfileInformation, profileRegions } from "./profile-data.ts";
import { registrationStatus } from "./program-timeline.js";
import { recommendForAnswers, emptyFinderAnswers } from "./program-finder-model.js";
import { Breadcrumb, Card, Modal } from "./ui.jsx";

const steps = [
  {
    title: "Program seperti apa yang sedang kamu cari?",
    description: "Pilih satu atau beberapa kategori yang kamu butuhkan.",
    id: "categories",
  },
  {
    title: "Apa kegiatanmu saat ini?",
    description: "Kamu bisa memilih lebih dari satu jika sesuai.",
    id: "activities",
  },
  {
    title: "Di mana kamu tinggal?",
    description: "Wilayah tempat tinggal membantu kami menemukan program yang tersedia di daerahmu.",
    id: "region",
  },
  {
    title: "Apa jenjang pendidikanmu?",
    description: "Pilih jenjang yang sedang atau terakhir kamu tempuh.",
    id: "education",
  },
];

function stateKey(account) {
  return `hakkita-program-finder:v1:${account?.identity?.id || "guest"}`;
}

function initialWizard(account) {
  const key = stateKey(account);
  try {
    const stored = JSON.parse(sessionStorage.getItem(key) || "null");
    if (stored?.answers && Number.isInteger(stored.step))
      return {
        answers: { ...emptyFinderAnswers(), ...stored.answers },
        step: Math.max(0, Math.min(steps.length - 1, stored.step)),
        showResults: Boolean(stored.showResults),
        showProfileChoice: Boolean(stored.showProfileChoice),
      };
  } catch {}
  const profileReady = Boolean(account && hasProfileInformation(account.profile || {}));
  return {
    answers: emptyFinderAnswers(),
    step: 0,
    showResults: false,
    showProfileChoice: profileReady,
  };
}

function Options({ name, options, value = [], multiple = false, onChange }) {
  return (
    <fieldset className="program-finder-options">
      <legend className="sr-only">{name}</legend>
      {options.map(([id, label]) => {
        const checked = multiple ? value.includes(id) : value === id;
        return (
          <label className="program-finder-option" key={id}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={id}
              checked={checked}
              onChange={() => onChange(id)}
            />
            <span className="program-finder-option-indicator" aria-hidden="true" />
            <span>{label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

function registrationLabel(item) {
  const status = registrationStatus(item);
  if (status === "open") return "Pendaftaran dibuka";
  if (status === "upcoming") return "Periode pendaftaran akan datang";
  if (status === "closed") return "Periode pendaftaran berakhir";
  return "";
}

export function ProgramFinder({ save, plans, modal = false, onClose }) {
  const { account } = useAccount();
  const key = stateKey(account);
  const [wizard, setWizard] = useState(() => initialWizard(account));
  const answers = wizard.answers;
  const categories = useMemo(() => programCategories.map(({ id, name }) => [id, name]), []);
  const province = profileRegions.find((item) => item.code === answers.provinceCode);
  const recommendations = useMemo(
    () => recommendForAnswers(programs, answers),
    [answers, programs],
  );

  React.useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(wizard));
    } catch {}
  }, [key, wizard]);

  function update(patch) {
    setWizard((current) => ({ ...current, ...patch }));
  }

  function closeFinder() {
    if (wizard.showResults) {
      const next = { ...wizard, showResults: false, step: 0 };
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {}
      setWizard(next);
    }
    onClose?.();
  }

  function updateAnswers(patch) {
    update({ answers: { ...answers, ...patch } });
  }

  function startWithProfile() {
    const profile = editableProfile(account?.profile || {});
    update({
      answers: {
        ...emptyFinderAnswers(),
        categories: profile.interests,
        activities: profile.activities,
        provinceCode: profile.provinceCode,
        province: profile.province,
        cityCode: profile.cityCode,
        city: profile.city,
        education: profile.education,
      },
      showProfileChoice: false,
    });
  }

  function startFromScratch() {
    update({ answers: emptyFinderAnswers(), step: 0, showResults: false, showProfileChoice: false });
  }

  function toggleMultiple(field, value) {
    const current = answers[field] || [];
    updateAnswers({
      [field]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    });
  }

  function nextStep() {
    if (wizard.step === 0 && !answers.categories.length) return;
    if (wizard.step === steps.length - 1) update({ showResults: true });
    else update({ step: wizard.step + 1 });
  }

  function previousStep() {
    if (wizard.step === 0) return;
    update({ step: wizard.step - 1 });
  }

  const answerSummary = [
    ...answers.categories.map((id) => programCategories.find((item) => item.id === id)?.name).filter(Boolean),
    ...answers.activities.map((id) => activityOptions.find(([value]) => value === id)?.[1]).filter(Boolean),
    answers.city || answers.province,
    educationOptions.find(([id]) => id === answers.education)?.[1],
  ].filter(Boolean);

  const content = (
    <>
      {modal ? (
        !wizard.showResults && (
        <p className="program-finder-modal-intro">Jawab beberapa pertanyaan agar kami bisa membantu menemukan program yang sesuai dengan kebutuhanmu.</p>
        )
      ) : (
        <>
          <Breadcrumb items={[{ label: "Kenali Hakmu", href: "/program" }, { label: "Cari Program untukmu" }]} />
          <header className="program-finder-heading">
            <a className="program-finder-back-home" href="/">
              <ArrowLeft size={17} /> Kembali ke beranda
            </a>
            <h1>Cari Program untukmu</h1>
            <p>Jawab beberapa pertanyaan agar kami bisa membantu menemukan program yang sesuai dengan kebutuhanmu.</p>
          </header>
        </>
      )}

      {wizard.showProfileChoice ? (
        <section className="program-finder-profile-choice" aria-labelledby="finder-profile-heading">
          <h2 id="finder-profile-heading">Gunakan informasi profilmu?</h2>
          <p>Kamu bisa menggunakan preferensi yang sudah disimpan atau menjawab pertanyaan baru.</p>
          <div className="program-finder-actions">
            <button className="button primary" type="button" onClick={startWithProfile}>Gunakan profil saya <ArrowRight size={17} /></button>
            <button className="button secondary" type="button" onClick={startFromScratch}>Jawab dari awal</button>
          </div>
        </section>
      ) : wizard.showResults ? (
        <section className="program-finder-results" aria-labelledby="finder-results-heading">
          <div className="program-finder-results-header">
            <div>
              <h2 id="finder-results-heading">Program yang mungkin sesuai untukmu</h2>
            </div>
          </div>
          <div className="program-finder-answer-summary" aria-label="Ringkasan jawaban">
            {answerSummary.slice(0, 6).map((answer, index) => <span key={`${answer}-${index}`}>{answer}</span>)}
            {answerSummary.length > 6 && <span>+{answerSummary.length - 6} lainnya</span>}
          </div>
          {recommendations.length ? (
            <div className="catalog-grid program-finder-results-grid">
              {recommendations.map(({ item, reasons }) => {
                const status = registrationLabel(item);
                return (
                  <Card key={item.id} item={item} save={save} plans={plans} curated catalogCard ctaLabel="Lihat program">
                    <div className="program-finder-card-reasons">
                      {status && <p className="program-finder-registration"><Bell size={15} aria-hidden="true" />{status}</p>}
                      <p className="program-finder-why-heading">Mengapa ditampilkan</p>
                      <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="program-finder-empty" role="status">
              <Info size={24} aria-hidden="true" />
              <div>
                <h3>Belum menemukan program yang sesuai</h3>
                <p>Coba ubah beberapa jawabanmu atau jelajahi program lain yang tersedia di HAKKITA.</p>
                <div className="program-finder-actions">
                  <button className="button secondary" type="button" onClick={closeFinder}>Tutup</button>
                  <a className="button primary" href="/program">Lihat semua program <ArrowRight size={17} /></a>
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="program-finder-wizard" aria-labelledby="finder-question-heading">
          <div className="program-finder-progress-header">
            <span>Langkah {wizard.step + 1} dari {steps.length}</span>
            <span>{Math.round(((wizard.step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="program-finder-progress" role="progressbar" aria-label={`Langkah ${wizard.step + 1} dari ${steps.length}`} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={wizard.step + 1}>
            <span style={{ width: `${((wizard.step + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="program-finder-question">
            <h2 id="finder-question-heading">{steps[wizard.step].title}</h2>
            <p>{steps[wizard.step].description}</p>
          </div>

          {wizard.step === 0 && (
            <Options
              name="Kategori program"
              options={categories}
              value={answers.categories}
              multiple
              onChange={(value) => toggleMultiple("categories", value)}
            />
          )}
          {wizard.step === 1 && (
            <Options
              name="Kegiatan saat ini"
              options={activityOptions}
              value={answers.activities}
              multiple
              onChange={(value) => toggleMultiple("activities", value)}
            />
          )}
          {wizard.step === 2 && (
            <div className="program-finder-region-fields">
              <div className="profile-field">
                <label htmlFor="finder-province">Provinsi</label>
                <select
                  id="finder-province"
                  value={answers.provinceCode}
                  onChange={(event) => {
                    const selected = profileRegions.find((item) => item.code === event.target.value);
                    const sameProvince = selected?.cities.find((item) => item.code === answers.cityCode);
                    updateAnswers({
                      provinceCode: selected?.code || "",
                      province: selected?.name || "",
                      cityCode: sameProvince?.code || "",
                      city: sameProvince?.name || "",
                    });
                  }}
                >
                  <option value="">Pilih provinsi</option>
                  {profileRegions.map((item) => <option value={item.code} key={item.code}>{item.name}</option>)}
                </select>
              </div>
              <div className="profile-field">
                <label htmlFor="finder-city">Kabupaten/kota</label>
                <select
                  id="finder-city"
                  value={answers.cityCode}
                  disabled={!province}
                  onChange={(event) => {
                    const selected = province?.cities.find((item) => item.code === event.target.value);
                    updateAnswers({ cityCode: selected?.code || "", city: selected?.name || "" });
                  }}
                >
                  <option value="">{province ? "Pilih kabupaten/kota" : "Pilih provinsi dahulu"}</option>
                  {province?.cities.map((item) => <option value={item.code} key={item.code}>{item.name}</option>)}
                </select>
              </div>
            </div>
          )}
          {wizard.step === 3 && (
            <Options
              name="Jenjang pendidikan"
              options={educationOptions}
              value={answers.education}
              onChange={(value) => updateAnswers({ education: value })}
            />
          )}

          <div className="program-finder-navigation">
            {wizard.step === 0 ? (
              modal ? (
                <button className="button secondary" type="button" onClick={closeFinder}>Tutup</button>
              ) : (
                <a className="button secondary" href="/"><ArrowLeft size={17} /> Beranda</a>
              )
            ) : (
              <button className="button secondary" type="button" onClick={previousStep}><ArrowLeft size={17} /> Kembali</button>
            )}
            <div className="program-finder-navigation-next">
              {wizard.step > 0 && (
                <button className="program-finder-skip" type="button" onClick={nextStep}>
                  Lewati
                </button>
              )}
              <button
                className="button primary"
                type="button"
                onClick={nextStep}
                disabled={wizard.step === 0 && !answers.categories.length}
              >
                {wizard.step === steps.length - 1 ? "Lihat rekomendasi" : "Lanjutkan"} <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );

  if (modal)
    return (
      <Modal
        title={wizard.showResults ? "" : "Cari Program untukmu"}
        onClose={closeFinder}
        id="program-finder-dialog"
        className={`program-finder-dialog${wizard.showResults ? " has-results" : ""}`}
      >
        <div className="program-finder-page is-modal">{content}</div>
      </Modal>
    );

  return <div className="container page program-finder-page">{content}</div>;
}
