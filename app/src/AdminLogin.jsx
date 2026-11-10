import { useEffect, useRef, useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { refreshAdminSession, startAdminGoogleLogin, signInAdminWithPassword } from "./admin-auth-client.js";

export function AdminLogin({ navigate }) {
  const [loading, setLoading] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const errorSummary = useRef(null);
  useEffect(() => { if (error) errorSummary.current?.focus(); }, [error]);
  useEffect(() => {
    let active = true;
    refreshAdminSession().then((session) => { if (active && session) navigate("/admin"); });
    return () => { active = false; };
  }, [navigate]);
  return <>
    {error && <div ref={errorSummary} className="form-errors" role="alert" tabIndex={-1}><p>{error}</p></div>}
    <button type="button" className="auth-google" disabled={Boolean(loading)} aria-busy={loading === "google"} onClick={async () => {
      if (loading) return; setError(""); setLoading("google");
      try { await startAdminGoogleLogin(); navigate("/admin"); }
      catch (failure) { setError(failure.message); setLoading(""); }
    }}>
      <img src="/google-g-logo.png" width="20" height="20" alt="" />{loading === "google" ? "Membuka Google…" : "Lanjutkan dengan Google"}
    </button>
    <div className="auth-divider"><span>atau masuk dengan email</span></div>
    <form className="auth-form" noValidate aria-busy={loading === "password"} onSubmit={async (event) => {
      event.preventDefault();
      if (loading) return;
      setError("");
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Masukkan alamat email yang valid."); return; }
      setLoading("password");
      try { await signInAdminWithPassword(email.trim()); navigate("/admin"); }
      catch (failure) { setError(failure.message); }
      finally { setPassword(""); setLoading(""); }
    }}>
      <div className="auth-field"><label htmlFor="admin-email">Email</label><input id="admin-email" name="email" type="email" autoComplete="username" inputMode="email" value={email} maxLength={254} disabled={Boolean(loading)} placeholder="nama@email.com" onChange={(event) => setEmail(event.target.value)} /></div>
      <div className="auth-field"><label htmlFor="admin-password">Kata sandi</label><div className="auth-password"><input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="off" value={password} disabled={Boolean(loading)} placeholder="Masukkan kata sandi" onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-controls="admin-password" aria-pressed={showPassword} disabled={Boolean(loading)} onClick={() => setShowPassword((previous) => !previous)}>{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}</button></div></div>
      <button className="button primary auth-submit" type="submit" disabled={Boolean(loading)}>{loading === "password" ? "Memeriksa akun…" : "Masuk ke Dashboard"}</button>
    </form>
    <a className="auth-guest" href="/">Kembali ke HAKKITA</a>
  </>;
}
