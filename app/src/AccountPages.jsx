import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCircle,
  SignOut,
  Trash,
  Info,
} from "@phosphor-icons/react";
import { useAccount } from "./AccountContext";
import {
  persistentProfile,
  safeReturnPath,
  validateIdentity,
} from "./account-store";
import { programCategories, provinces } from "./taxonomy";
import { profileState, recommendPrograms } from "./recommendations";
import { programs, findItem } from "./data.js";
import {
  Breadcrumb,
  PageIntro,
  Empty,
  Card,
  hrefWith,
  Modal,
  detailUrl,
} from "./ui.jsx";

export function DemoAccountPage({ mode, navigate }) {
  const { state, register, login } = useAccount();
  const [displayName, setName] = useState(""),
    [email, setEmail] = useState(""),
    [selected, setSelected] = useState(""),
    [errors, setErrors] = useState({});
  const registering = mode === "daftar",
    accounts = Object.values(state.accounts);
  const query = new URLSearchParams(location.search);
  const queryString = location.search;
  function submit(e) {
    e.preventDefault();
    if (registering) {
      const result = register(displayName, email);
      if (result.errors || result.error)
        setErrors(result.errors || { form: result.error });
    } else if (!selected || !login(selected))
      setErrors({ form: "Pilih identitas yang tersedia di perangkat ini." });
  }
  const errorRef = useRef(null);
  useEffect(() => {
    if (Object.keys(errors).length) errorRef.current?.focus();
  }, [errors]);
  return (
    <div className="container page account-page">
      <Breadcrumb items={[{ label: registering ? "Buat akun" : "Masuk" }]} />
      <div className="account-form-wrap">
        <PageIntro
          title={
            registering
              ? "Mode demo: identitas baru"
              : "Mode demo: pilih identitas"
          }
          subtitle={
            registering
              ? "Simpan program pilihanmu dan temukan kembali kapan saja."
              : "Kelola program dan layanan yang sudah kamu simpan."
          }
        />
        <div className="local-account-note">
          <ShieldCheck size={21} />
          <p>
            Gunakan identitas contoh untuk mencoba alur akun di perangkat ini.
            Tidak ada akun server, password, atau email yang dikirim.
          </p>
        </div>
        <form className="account-form" onSubmit={submit} noValidate>
          {Object.keys(errors).length > 0 && (
            <div
              ref={errorRef}
              tabIndex={-1}
              className="form-errors"
              role="alert"
            >
              {Object.values(errors).map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )}
          {registering ? (
            <>
              <label htmlFor="account-name">Nama Lengkap Contoh</label>
              <input
                id="account-name"
                autoComplete="off"
                value={displayName}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.displayName)}
                placeholder="Contoh: Sahabat Hakkita"
              />
              <label htmlFor="account-email">Email contoh</label>
              <input
                id="account-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                value={email}
                maxLength={100}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby="account-email-hint"
                placeholder="nama@example.test"
              />
              <p id="account-email-hint" className="field-help">
                Gunakan domain @example.test. Jangan masukkan email atau
                password pribadi.
              </p>
            </>
          ) : accounts.length ? (
            <>
              <label htmlFor="account-select">
                Pilih identitas di perangkat ini
              </label>
              <select
                id="account-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Pilih identitas</option>
                {accounts.map((a) => (
                  <option key={a.identity.id} value={a.identity.id}>
                    {a.identity.displayName} — {a.identity.email}
                  </option>
                ))}
              </select>
              <p className="field-help">
                Identitas lokal ini hanya tersedia di browser yang sama.
              </p>
            </>
          ) : (
            <p className="account-no-identity">
              Belum ada identitas tersimpan di perangkat ini. Buat identitas
              contoh untuk memulai.
            </p>
          )}
          <button
            className="button primary"
            type="submit"
            disabled={!registering && !accounts.length}
          >
            {registering ? "Buat Akun" : "Masuk"}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="account-switch">
          {registering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <a href={`/demo/${registering ? "masuk" : "daftar"}${queryString}`}>
            {registering ? "Masuk" : "Daftar"}
          </a>
        </p>
        <a
          href={safeReturnPath(query.get("next"), "/program")}
          className="text-link account-skip"
        >
          Lanjut tanpa akun <ArrowRight size={17} />
        </a>
      </div>
    </div>
  );
}
export function Welcome() {
  const { account } = useAccount();
  return (
    <div className="container page narrow">
      <PageIntro
        title="Selamat datang di HAKKITA!"
        subtitle="Kamu bisa mulai menjelajahi program atau menambahkan informasi untuk mendapatkan rekomendasi yang lebih personal."
      />
      <p className="local-session-label">
        Identitas {account?.identity.displayName} tersimpan di browser ini.
      </p>
      <div className="inline-actions">
        <a href="/profil/edit" className="button primary">
          Lengkapi Profil <ArrowRight />
        </a>
        <a href="/program" className="button secondary">
          Jelajahi HAKKITA
        </a>
      </div>
    </div>
  );
}
export { ProfileEditor, ProfilePage } from "./ProfilePages.jsx";
export function RecommendationCard({ result, save, plans }) {
  const item = findItem(result.id);
  return (
    <Card item={item} save={save} plans={plans}>
      <div className="recommendation-reasons">
        <span
          className={`match-status ${result.status === "Belum Sesuai dengan Kondisi" ? "attention" : ""}`}
        >
          {result.status}
        </span>
        {result.reasons.map((x) => (
          <p key={x}>{x}</p>
        ))}
        <ul>
          {result.rules
            .filter((r) => r.state !== "met")
            .map((r) => (
              <li key={r.id}>
                <strong>
                  {r.state === "not-met"
                    ? "Belum sesuai: "
                    : "Perlu diperiksa: "}
                </strong>
                {r.label}
              </li>
            ))}
        </ul>
      </div>
    </Card>
  );
}
export function Recommendations({ save, plans }) {
  const { account, sensitiveAnswers } = useAccount();
  const [tab, setTab] = useState("relevant");
  const results = recommendPrograms(
      programs,
      account.profile,
      sensitiveAnswers,
    ),
    potential = results.filter(
      (r) => r.status !== "Belum Sesuai dengan Kondisi",
    );
  const shown = tab === "all" ? results : potential;
  const state = profileState(account.profile);
  return (
    <div className="container page">
      <Breadcrumb
        items={[
          { label: "Kenali Hakmu", href: "/program" },
          { label: "Rekomendasi Untukmu" },
        ]}
      />
      <PageIntro
        title="Rekomendasi Untukmu"
        subtitle="Pilihan yang dihitung dari informasi yang kamu berikan dan persyaratan pada sumber resmi."
      />
      <div className="recommendation-toolbar">
        <span>{state}</span>
        <a className="text-link" href="/profil/edit">
          Perbarui Profil <ArrowRight />
        </a>
      </div>
      <div className="info-box">
        <Info size={23} />
        <p>
          Informasi yang belum diketahui tetap perlu diperiksa. Keputusan
          penerimaan mengikuti penyelenggara, bukan hasil rekomendasi ini.
        </p>
      </div>
      {results.length > 0 && (
        <div className="plan-tabs">
          <button
            className={tab === "relevant" ? "selected" : ""}
            onClick={() => setTab("relevant")}
          >
            Untuk ditelusuri ({potential.length})
          </button>
          <button
            className={tab === "all" ? "selected" : ""}
            onClick={() => setTab("all")}
          >
            Semua hasil ({results.length})
          </button>
        </div>
      )}
      {shown.length ? (
        <div className="catalog-grid recommendation-grid">
          {shown.map((r) => (
            <RecommendationCard
              key={r.id}
              result={r}
              save={save}
              plans={plans}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Belum ditemukan program berdasarkan informasi profilmu."
          action="Ubah Profil"
          href="/profil/edit"
        >
          <p>
            Informasi tambahan atau pilihan bidang lain dapat membantu. Kamu
            tetap dapat menelusuri seluruh katalog.
          </p>
          <a className="text-link" href="/program">
            Jelajahi Semua Program <ArrowRight />
          </a>
        </Empty>
      )}
    </div>
  );
}
export function AccountGate({
  title = "Masuk untuk membuka Rencanaku",
  next = "/rencanaku",
}) {
  return (
    <div className="container page narrow">
      <Empty
        icon={UserCircle}
        title={title}
        action="Masuk atau Daftar"
        href={hrefWith("/masuk", { next })}
      >
        <p>
          Kamu tetap bisa mencari dan membaca seluruh program serta layanan
          tanpa akun.
        </p>
        <a href="/program" className="text-link">
          Jelajahi Tanpa Akun <ArrowRight />
        </a>
      </Empty>
    </div>
  );
}
