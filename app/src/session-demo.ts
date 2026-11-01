import { blankSession, normalizeSession } from "./account-store.ts";
import type { SessionSnapshot } from "./models";

export const SESSION_DEMO_KEY = "hakkita-session-demo-v1";
export interface SessionDemoIdentity {
  id: string;
  displayName: string;
  email: string;
}
export function readSessionDemo(
  storage?: Pick<Storage, "getItem">,
): SessionSnapshot {
  try {
    return normalizeSession(
      JSON.parse(
        (storage || window.sessionStorage).getItem(SESSION_DEMO_KEY) || "null",
      ),
      true,
    );
  } catch {
    return blankSession();
  }
}
export function writeSessionDemo(
  state: SessionSnapshot,
  storage?: Pick<Storage, "setItem">,
) {
  (storage || window.sessionStorage).setItem(
    SESSION_DEMO_KEY,
    JSON.stringify(normalizeSession(state, true)),
  );
}
export function hasSessionDemo() {
  try {
    return window.sessionStorage.getItem(SESSION_DEMO_KEY) !== null;
  } catch {
    return false;
  }
}
