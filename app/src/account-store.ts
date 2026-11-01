import type {
  AccountAdapter,
  AccountRecord,
  Profile,
  SavedPlan,
  SessionSnapshot,
} from "./models";
export const ACCOUNT_KEY = "hakkita-accounts-v2";
export const blankSession = (): SessionSnapshot => ({
  activeId: null,
  accounts: {},
});
const profileKeys = [
  "provinceCode",
  "cityCode",
  "activitiesOther",
  "province",
  "city",
  "activities",
  "education",
  "year",
  "interests",
  "age",
  "student",
] as const;
export function persistentProfile(profile: Profile): Profile {
  const output: Record<string, unknown> = {};
  for (const key of profileKeys) {
    const value = profile[key];
    if (typeof value === "string") output[key] = value.slice(0, 100);
    else if (Array.isArray(value))
      output[key] = value.filter((x) => typeof x === "string").slice(0, 15);
  }
  return output as Profile;
}
export function normalizePlans(value: unknown): Record<string, SavedPlan> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, plan]) => {
      if (
        !/^[a-z0-9-]+(?::[a-z0-9-]+)?$/.test(key) ||
        !plan ||
        typeof plan !== "object" ||
        !Array.isArray(plan.done)
      )
        return [];
      return [
        [
          key,
          {
            done: plan.done.filter(
              (x: unknown) =>
                Number.isInteger(x) && Number(x) >= 0 && Number(x) < 100,
            ),
            variant: typeof plan.variant === "string" ? plan.variant : "",
            savedAt: typeof plan.savedAt === "number" ? plan.savedAt : 0,
            goal: typeof plan.goal === "string" ? plan.goal.slice(0, 80) : "",
          },
        ],
      ];
    }),
  );
}
export function normalizeSession(
  value: unknown,
  sessionDemo = false,
): SessionSnapshot {
  const out = blankSession();
  if (!value || typeof value !== "object") return out;
  const raw = value as Partial<SessionSnapshot>;
  for (const [id, record] of Object.entries(raw.accounts || {})) {
    if (
      !/^[a-zA-Z0-9-]+$/.test(id) ||
      ["constructor", "prototype", "__proto__"].includes(id) ||
      !record?.identity ||
      record.identity.id !== id ||
      typeof record.identity.email !== "string" ||
      (sessionDemo
        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.identity.email)
        : !record.identity.email.endsWith("@example.test")) ||
      typeof record.identity.displayName !== "string"
    )
      continue;
    out.accounts[id] = {
      identity: {
        id,
        displayName: record.identity.displayName.slice(0, 60),
        email: record.identity.email.slice(0, 100),
      },
      profile: persistentProfile(record.profile || {}),
      plans: normalizePlans(record.plans),
    };
  }
  out.activeId =
    raw.activeId && Object.hasOwn(out.accounts, raw.activeId)
      ? raw.activeId
      : null;
  return out;
}
export function createLocalAccountAdapter(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): AccountAdapter {
  return {
    read() {
      try {
        return normalizeSession(
          JSON.parse(storage.getItem(ACCOUNT_KEY) || "null"),
        );
      } catch {
        return blankSession();
      }
    },
    write(state) {
      const safe: SessionSnapshot = { activeId: state.activeId, accounts: {} };
      for (const [id, record] of Object.entries(state.accounts))
        safe.accounts[id] = {
          identity: {
            id: record.identity.id,
            displayName: record.identity.displayName,
            email: record.identity.email,
          },
          profile: persistentProfile(record.profile),
          plans: normalizePlans(record.plans),
        };
      storage.setItem(ACCOUNT_KEY, JSON.stringify(safe));
    },
    reset() {
      storage.removeItem(ACCOUNT_KEY);
    },
  };
}
export function validateIdentity(displayName: string, email: string) {
  const errors: Record<string, string> = {};
  const name = displayName.trim(),
    normalized = email.trim().toLowerCase();
  if (!name) errors.displayName = "Isi nama tampilan.";
  else if (name.length > 60)
    errors.displayName = "Gunakan maksimal 60 karakter.";
  if (!normalized) errors.email = "Isi email contoh.";
  else if (
    normalized.length > 100 ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@example\.test$/.test(normalized)
  )
    errors.email = "Gunakan alamat contoh, misalnya nama@example.test.";
  return { errors, identity: { displayName: name, email: normalized } };
}
export function safeReturnPath(value: string | null, fallback = "/rencanaku") {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\x00-\x1f]/.test(value)
  )
    return fallback;
  try {
    const url = new URL(value, "https://hakkita.local");
    if (
      url.origin !== "https://hakkita.local" ||
      [
        "/masuk",
        "/daftar",
        "/lupa-kata-sandi",
        "/demo/masuk",
        "/demo/daftar",
      ].includes(url.pathname)
    )
      return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
