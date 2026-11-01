import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  blankSession,
  createLocalAccountAdapter,
  validateIdentity,
  persistentProfile,
} from "./account-store";
import type {
  AccountRecord,
  Profile,
  SavedPlan,
  SessionSnapshot,
} from "./models";
import {
  hasSessionDemo,
  readSessionDemo,
  writeSessionDemo,
  type SessionDemoIdentity,
} from "./session-demo";
// User-authorized session demo identities use sessionStorage. Legacy example
// records remain in their separate local adapter. Neither is a verified server
// session; this context never receives passwords or OAuth tokens.
interface AccountContextValue {
  saveProfile: (
    name: string,
    profile: Profile,
  ) => Promise<{ ok: boolean; error?: string }>;
  profileFeedback: string;
  clearProfileFeedback: () => void;
  state: SessionSnapshot;
  account: AccountRecord | null;
  storageUnavailable: boolean;
  sessionDemo: boolean;
  startSessionDemo: (identity: SessionDemoIdentity) => void;
  register: (
    name: string,
    email: string,
  ) => { error?: string; errors?: Record<string, string> };
  login: (id: string) => boolean;
  logout: () => void;
  updateProfile: (profile: Profile) => void;
  updateDisplayName: (name: string) => boolean;
  clearProfile: () => Promise<{ ok: boolean; error?: string }>;
  plans: Record<string, SavedPlan>;
  setPlans: Dispatch<SetStateAction<Record<string, SavedPlan>>>;
  sensitiveAnswers: Record<string, string>;
  setSensitiveAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  resetSession: () => void;
}
const AccountContext = createContext<AccountContextValue | null>(null);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState("");
  const clearProfileFeedback = useCallback(() => setProfileFeedback(""), []);
  const persistedState = useRef<SessionSnapshot | null>(null);
  const [sessionDemo, setSessionDemo] = useState(hasSessionDemo);
  const [state, setState] = useState<SessionSnapshot>(() => {
    try {
      return hasSessionDemo()
        ? readSessionDemo()
        : createLocalAccountAdapter(localStorage).read();
    } catch {
      return blankSession();
    }
  });
  const [sensitiveAnswers, setSensitiveAnswers] = useState<
    Record<string, string>
  >({});
  const account = state.activeId
    ? state.accounts[state.activeId] || null
    : null;
  useEffect(() => {
    if (persistedState.current === state) return;
    try {
      if (sessionDemo) writeSessionDemo(state);
      else createLocalAccountAdapter(localStorage).write(state);
      persistedState.current = state;
    } catch {
      setStorageUnavailable(true);
    }
  }, [state, sessionDemo]);
  function persistAccount(next: SessionSnapshot) {
    if (sessionDemo) writeSessionDemo(next);
    else createLocalAccountAdapter(localStorage).write(next);
    persistedState.current = next;
    setState(next);
    setStorageUnavailable(false);
  }
  async function saveProfile(name: string, profile: Profile) {
    const trimmed = name.trim();
    if (!account || !trimmed || trimmed.length > 60)
      return { ok: false, error: "Periksa kembali nama tampilanmu." };
    const id = account.identity.id;
    try {
      persistAccount({
        ...state,
        accounts: {
          ...state.accounts,
          [id]: {
            ...account,
            identity: { ...account.identity, displayName: trimmed },
            profile: persistentProfile(profile),
          },
        },
      });
      setSensitiveAnswers({});
      setProfileFeedback("Profil berhasil disimpan.");
      return { ok: true };
    } catch {
      setStorageUnavailable(true);
      return {
        ok: false,
        error: "Perubahan belum berhasil disimpan. Coba lagi.",
      };
    }
  }
  function startSessionDemo(identity: SessionDemoIdentity) {
    setProfileFeedback("");
    const previous = sessionDemo ? state : readSessionDemo();
    const existing = Object.values(previous.accounts).find(
      (record) =>
        record.identity.email.toLowerCase() === identity.email.toLowerCase(),
    );
    const safeIdentity = existing?.identity || {
      id: identity.id,
      displayName: identity.displayName.slice(0, 60),
      email: identity.email.trim().toLowerCase(),
    };
    setSensitiveAnswers({});
    setSessionDemo(true);
    setState({
      activeId: safeIdentity.id,
      accounts: {
        ...previous.accounts,
        [safeIdentity.id]: existing || {
          identity: safeIdentity,
          profile: {},
          plans: {},
        },
      },
    });
  }
  function register(name: string, email: string) {
    setProfileFeedback("");
    const checked = validateIdentity(name, email);
    if (Object.keys(checked.errors).length) return { errors: checked.errors };
    if (
      Object.values(state.accounts).some(
        (a) => a.identity.email === checked.identity.email,
      )
    )
      return {
        error:
          "Identitas ini sudah ada di perangkat ini. Pilih identitas tersebut pada halaman Masuk.",
      };
    const id =
      globalThis.crypto?.randomUUID?.() ||
      `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const record: AccountRecord = {
      identity: { id, ...checked.identity },
      profile: {},
      plans: {},
    };
    setSensitiveAnswers({});
    setState((p) => ({
      activeId: id,
      accounts: { ...p.accounts, [id]: record },
    }));
    return {};
  }
  function login(id: string) {
    setProfileFeedback("");
    if (!state.accounts[id]) return false;
    setSensitiveAnswers({});
    setState((p) => ({ ...p, activeId: id }));
    return true;
  }
  function logout() {
    setProfileFeedback("");
    setSensitiveAnswers({});
    setState((p) => ({ ...p, activeId: null }));
  }
  function updateProfile(profile: Profile) {
    if (!account) return;
    setState((p) => ({
      ...p,
      accounts: {
        ...p.accounts,
        [account.identity.id]: { ...p.accounts[account.identity.id], profile },
      },
    }));
  }
  function updateDisplayName(name: string) {
    const trimmed = name.trim();
    if (!account || !trimmed || trimmed.length > 60) return false;
    const id = account.identity.id;
    setState((previous) => ({
      ...previous,
      accounts: {
        ...previous.accounts,
        [id]: {
          ...previous.accounts[id],
          identity: { ...previous.accounts[id].identity, displayName: trimmed },
        },
      },
    }));
    return true;
  }
  async function clearProfile() {
    if (!account) return { ok: false };
    try {
      const id = account.identity.id;
      persistAccount({
        ...state,
        accounts: { ...state.accounts, [id]: { ...account, profile: {} } },
      });
      setSensitiveAnswers({});
      setProfileFeedback("Informasi profil berhasil dihapus.");
      return { ok: true };
    } catch {
      setStorageUnavailable(true);
      return {
        ok: false,
        error: "Informasi profil belum berhasil dihapus. Coba lagi.",
      };
    }
  }
  const setPlans: AccountContextValue["setPlans"] = (next) => {
    if (!account) return;
    const id = account.identity.id;
    setState((p) => {
      if (p.activeId !== id) return p;
      const record = p.accounts[id];
      const plans = typeof next === "function" ? next(record.plans) : next;
      return { ...p, accounts: { ...p.accounts, [id]: { ...record, plans } } };
    });
  };
  function resetSession() {
    setSensitiveAnswers({});
    setState(blankSession());
  }
  return (
    <AccountContext.Provider
      value={{
        state,
        account,
        storageUnavailable,
        sessionDemo,
        startSessionDemo,
        saveProfile,
        profileFeedback,
        clearProfileFeedback,
        register,
        login,
        logout,
        updateProfile,
        updateDisplayName,
        clearProfile,
        plans: account?.plans || {},
        setPlans,
        sensitiveAnswers,
        setSensitiveAnswers,
        resetSession,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("AccountProvider is required");
  return context;
}
