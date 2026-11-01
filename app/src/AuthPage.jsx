import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import {
  authErrorMessage,
  authIntent,
  authService,
  validateAuthFields,
} from "./auth-service";

export function AuthHeader() {
  return (
    <header className="auth-header">
      <div className="container auth-header-inner">
        <a href="/" className="brand" aria-label="Hakkita, beranda">
          <img
            src="/hakkita-logo.png"
            alt="Hakkita"
            width="1983"
            height="600"
          />
        </a>
        <a href="/" className="auth-home-link">
          <ArrowLeft size={17} aria-hidden="true" />
          Kembali ke beranda
        </a>
      </div>
    </header>
  );
}
export function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="auth-layout" aria-labelledby="auth-title">
      <div className="auth-intro">
        <h1 id="auth-title">{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
      <p className="auth-privacy">
        Akunmu digunakan untuk menyimpan program dan layanan pilihan. Kamu bisa
        melengkapi profil nanti untuk mendapatkan rekomendasi yang lebih sesuai.
        <br />
        <a href="/privasi?utm_source=chatgpt.com">Kebijakan Privasi</a>
      </p>
    </section>
  );
}
export function AuthPage({
  mode,
  service = authService,
  onAuthenticated,
  onDemoAuthenticated,
}) {
  const registering = mode === "daftar",
    recovering = mode === "pemulihan";
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({}),
    [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false),
    [showPassword, setShowPassword] = useState(false);
  const busy = useRef(false),
    summary = useRef(null);
  const intent = authIntent(location.search);
  const enabled = recovering
    ? service.capabilities.passwordReset
    : service.capabilities.emailPassword;
  const queryString = location.search;
  useEffect(() => {
    if (Object.values(errors).some(Boolean)) summary.current?.focus();
  }, [errors]);
  function change(name, value) {
    setFields((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }
  async function authenticate(google = false) {
    if (busy.current || (google ? !service.capabilities.google : !enabled))
      return;
    const validation = google ? {} : validateAuthFields(mode, fields);
    setErrors(validation);
    setMessage("");
    if (Object.keys(validation).length) return;
    busy.current = true;
    setLoading(true);
    try {
      const result = await (google
        ? service.signInWithGoogle()
        : recovering
          ? service.resetPassword(fields.email.trim())
          : registering
            ? service.signUp(
                fields.name.trim(),
                fields.email.trim(),
                fields.password,
              )
            : service.signIn(fields.email.trim(), fields.password));
      if (
        result.status === "session_demo" &&
        service.mode === "session_demo" &&
        onDemoAuthenticated
      ) {
        onDemoAuthenticated(result.user, intent);
      } else if (
        result.status === "authenticated" &&
        result.user?.emailVerified === true &&
        onAuthenticated
      ) {
        onAuthenticated(result.user, intent);
      } else if (
        result.status === "verification_required" ||
        (result.status === "authenticated" && !result.user?.emailVerified)
      ) {
        setMessage(
          "Alamat email perlu diverifikasi sebelum kamu dapat masuk. Ikuti petunjuk penyedia autentikasi.",
        );
      } else if (result.status === "recovery_demo_requested") {
        setMessage(
          "Simulasi pemulihan selesai. Tidak ada email yang dikirim atau kata sandi yang diubah. Kamu bisa kembali ke halaman Masuk dan menggunakan kata sandi contoh.",
        );
      } else if (result.status === "recovery_requested") {
        setMessage(
          "Jika alamat email terdaftar, ikuti petunjuk pemulihan yang diberikan layanan autentikasi.",
        );
      } else {
        setErrors({
          form: "Sesi belum dapat dikonfirmasi. Silakan coba beberapa saat lagi.",
        });
      }
    } catch (error) {
      setErrors({ form: authErrorMessage(error) });
    } finally {
      setFields((previous) => ({ ...previous, password: "" }));
      busy.current = false;
      setLoading(false);
    }
  }
  const title = recovering
    ? "Lupa kata sandi?"
    : registering
      ? "Buat akun HAKKITA"
      : "Masuk ke HAKKITA";
  const subtitle = recovering
    ? "Gunakan alamat email akunmu untuk memulihkan akses."
    : registering
      ? "Simpan program pilihanmu dan temukan rekomendasi yang lebih sesuai dengan kebutuhanmu."
      : "Lanjutkan aktivitasmu dengan masuk ke akun HAKKITA.";
  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {new URLSearchParams(location.search).get("reason") ===
        "session_expired" && (
        <p role="status" className="auth-status">
          Sesi telah berakhir. Silakan masuk kembali untuk melanjutkan.
        </p>
      )}
      {!recovering && (
        <>
          <button
            type="button"
            className="auth-google"
            disabled={!service.capabilities.google || loading}
            aria-describedby={
              !service.capabilities.google ? "auth-availability" : undefined
            }
            onClick={() => authenticate(true)}
          >
            <img src="/google-g-logo.png" width="20" height="20" alt="" />
            Lanjutkan dengan Google
          </button>
          <div className="auth-divider">
            <span>
              {registering
                ? "atau daftar dengan email"
                : "atau masuk dengan email"}
            </span>
          </div>
        </>
      )}
      {(!enabled || (!recovering && !service.capabilities.google)) && (
        <p id="auth-availability" className="auth-availability" role="status">
          {recovering
            ? "Pemulihan kata sandi belum tersedia. Belum ada email pemulihan yang dikirim."
            : !enabled && !service.capabilities.google
              ? "Masuk dengan Google dan email belum tersedia. Kamu tetap bisa menjelajahi HAKKITA tanpa akun."
              : !service.capabilities.google
                ? "Masuk dengan Google belum tersedia."
                : "Masuk dengan email belum tersedia."}
        </p>
      )}
      <form
        className="auth-form"
        noValidate
        aria-busy={loading}
        onSubmit={(event) => {
          event.preventDefault();
          authenticate();
        }}
      >
        {Object.values(errors).some(Boolean) && (
          <div ref={summary} className="form-errors" role="alert" tabIndex={-1}>
            {Object.values(errors)
              .filter(Boolean)
              .map((error) => (
                <p key={error}>{error}</p>
              ))}
          </div>
        )}
        {message && (
          <p className="auth-status" role="status">
            {message}
          </p>
        )}
        {registering && (
          <div className="auth-field">
            <label htmlFor="auth-name">Nama Lengkap</label>
            <input
              id="auth-name"
              name="name"
              autoComplete="nickname"
              placeholder="Masukkan namamu"
              maxLength={60}
              value={fields.name}
              onChange={(event) => change("name", event.target.value)}
              disabled={!enabled || loading}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name
                  ? "auth-name-error"
                  : !enabled
                    ? "auth-availability"
                    : undefined
              }
            />
            {errors.name && (
              <p id="auth-name-error" className="auth-field-error">
                {errors.name}
              </p>
            )}
          </div>
        )}
        <div className="auth-field">
          <label htmlFor="auth-email">Alamat email</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={fields.email}
            onChange={(event) => change("email", event.target.value)}
            disabled={!enabled || loading}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email
                ? "auth-email-error"
                : !enabled
                  ? "auth-availability"
                  : undefined
            }
          />
          {errors.email && (
            <p id="auth-email-error" className="auth-field-error">
              {errors.email}
            </p>
          )}
        </div>
        {!recovering && (
          <div className="auth-field">
            <label htmlFor="auth-password">Kata sandi</label>
            <div className="auth-password">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={registering ? "new-password" : "current-password"}
                placeholder={
                  registering ? "Buat kata sandi" : "Masukkan kata sandi"
                }
                value={fields.password}
                onChange={(event) => change("password", event.target.value)}
                disabled={!enabled || loading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "auth-password-error"
                    : !enabled
                      ? "auth-availability"
                      : undefined
                }
              />
              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                aria-pressed={showPassword}
                aria-controls="auth-password"
                disabled={!enabled || loading}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p id="auth-password-error" className="auth-field-error">
                {errors.password}
              </p>
            )}
          </div>
        )}
        {!registering && !recovering && (
          <a href={`/lupa-kata-sandi${queryString}`} className="auth-forgot">
            Lupa kata sandi?
          </a>
        )}
        <button
          type="submit"
          className="button primary auth-submit"
          disabled={!enabled || loading}
        >
          {loading
            ? "Memproses…"
            : recovering
              ? service.mode === "session_demo"
                ? "Lanjutkan pemulihan"
                : "Kirim tautan pemulihan"
              : registering
                ? "Buat akun"
                : "Masuk"}
        </button>
      </form>
      {!recovering && (
        <p className="auth-switch">
          <>
            {registering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <a href={`/${registering ? "masuk" : "daftar"}${queryString}`}>
              {registering ? "Masuk" : "Daftar"}
            </a>
          </>
        </p>
      )}
      <a href={intent.guestNext} className="auth-guest">
        Lanjut tanpa akun
      </a>
    </AuthLayout>
  );
}
