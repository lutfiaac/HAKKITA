import { safeReturnPath } from "./account-store.ts";
import { readSessionDemo, type SessionDemoIdentity } from "./session-demo.ts";

export type AuthMode = "masuk" | "daftar" | "pemulihan";
export interface VerifiedAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}
export type AuthResult =
  | { status: "session_demo"; user: SessionDemoIdentity }
  | { status: "authenticated"; user: VerifiedAuthUser }
  | { status: "verification_required" }
  | { status: "recovery_demo_requested" }
  | { status: "recovery_requested" };
export interface AuthService {
  mode?: "session_demo";
  capabilities: {
    emailPassword: boolean;
    google: boolean;
    passwordReset: boolean;
  };
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(name: string, email: string, password: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  resetPassword(email: string): Promise<AuthResult>;
}
export class AuthServiceError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}
// No provider, SDK, trusted session endpoint or credentials exist in this repo.
// Never fall back to the legacy local-identity adapter for real authentication.
const unavailable = async (): Promise<never> => {
  throw new AuthServiceError("unavailable");
};
export const authService: AuthService = {
  capabilities: { emailPassword: false, google: false, passwordReset: false },
  signIn: unavailable,
  signUp: unavailable,
  signInWithGoogle: unavailable,
  resetPassword: unavailable,
};
// User-authorized browser-session simulation. This never contacts Google, a
// database, or an authentication server and never retains the password.
export function createSessionDemoService(read = readSessionDemo): AuthService {
  const identity = (name: string, email: string): AuthResult => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = Object.values(read().accounts).find(
      (record) => record.identity.email.toLowerCase() === normalizedEmail,
    );
    return {
      status: "session_demo",
      user: existing?.identity || {
        id:
          globalThis.crypto?.randomUUID?.() ||
          `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        displayName: name.trim().slice(0, 60),
        email: normalizedEmail,
      },
    };
  };
  return {
    mode: "session_demo",
    capabilities: { emailPassword: true, google: true, passwordReset: true },
    async signIn(email, _password) {
      return identity(email.trim().split("@")[0], email);
    },
    async signUp(name, email, _password) {
      return identity(name, email);
    },
    async signInWithGoogle() {
      return identity("Pengguna Google", "google.demo@example.test");
    },
    async resetPassword(_email) {
      return { status: "recovery_demo_requested" };
    },
  };
}
export const sessionDemoService = createSessionDemoService();
export const authMessages: Record<string, string> = {
  unavailable:
    "Masuk dan pendaftaran belum tersedia. Kamu tetap bisa melanjutkan tanpa akun.",
  invalid_credentials:
    "Email atau kata sandi tidak sesuai. Periksa kembali dan coba lagi.",
  account_unavailable:
    "Permintaan belum dapat diproses. Periksa email atau gunakan pemulihan akun.",
  weak_password: "Kata sandi belum memenuhi ketentuan layanan autentikasi.",
  network: "Koneksi bermasalah. Coba beberapa saat lagi.",
  cancelled: "Proses masuk dengan Google dibatalkan.",
  popup_blocked: "Jendela masuk diblokir browser. Izinkan popup dan coba lagi.",
  linking_required:
    "Gunakan metode masuk sebelumnya untuk menautkan akun melalui penyedia autentikasi.",
  session_expired:
    "Sesi telah berakhir. Silakan masuk kembali untuk melanjutkan.",
  unknown: "Permintaan belum berhasil. Coba beberapa saat lagi.",
};
export function authErrorMessage(error: unknown) {
  return error instanceof AuthServiceError
    ? authMessages[error.code] || authMessages.unknown
    : authMessages.unknown;
}
export function validateAuthFields(
  mode: AuthMode,
  fields: { name?: string; email?: string; password?: string },
) {
  const errors: Record<string, string> = {};
  if (mode === "daftar" && !fields.name?.trim())
    errors.name = "Masukkan nama tampilan.";
  else if (mode === "daftar" && fields.name!.trim().length > 60)
    errors.name = "Gunakan nama tampilan maksimal 60 karakter.";
  if (!fields.email?.trim()) errors.email = "Masukkan alamat email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = "Periksa kembali format alamat email.";
  if (mode !== "pemulihan" && !fields.password)
    errors.password = "Masukkan kata sandi.";
  return errors;
}
export function authIntent(search: string) {
  const query = new URLSearchParams(search);
  const next = safeReturnPath(query.get("next"), "/");
  const guestDestination = safeReturnPath(query.get("next"), "/program");
  const publicNext =
    /^\/(rencanaku|profil|selamat-datang)(?:[/?#]|$)/.test(guestDestination) ||
    /^\/program\/rekomendasi(?:[/?#]|$)/.test(guestDestination)
      ? "/program"
      : guestDestination;
  return {
    next,
    guestNext: publicNext,
    save: /^[a-z0-9-]+$/.test(query.get("save") || "")
      ? query.get("save")
      : null,
    variant: /^[a-z0-9-]+$/.test(query.get("variant") || "")
      ? query.get("variant")
      : "",
    personalization: query.get("intent") === "personalisasi",
  };
}
