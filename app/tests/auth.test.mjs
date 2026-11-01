import test from "node:test";
import assert from "node:assert/strict";
import {
  authService,
  createSessionDemoService,
  authIntent,
  validateAuthFields,
  AuthServiceError,
  authErrorMessage,
} from "../src/auth-service.ts";
import {
  readSessionDemo,
  writeSessionDemo,
  SESSION_DEMO_KEY,
} from "../src/session-demo.ts";

test("browser-session demo adapter whitelists identity/profile/plans and never retains passwords or tokens", () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) || null,
    setItem: (key, value) => data.set(key, value),
  };
  writeSessionDemo(
    {
      activeId: "session-one",
      accounts: {
        "session-one": {
          identity: {
            id: "session-one",
            displayName: "Dummy",
            email: "dummy@example.com",
            password: "secret",
            token: "oauth",
          },
          profile: {
            province: "Kalimantan Timur",
            income: "sensitive",
            password: "secret",
          },
          plans: {},
          password: "secret",
        },
      },
      password: "secret",
      accessToken: "oauth",
    },
    storage,
  );
  const value = data.get(SESSION_DEMO_KEY);
  assert.doesNotMatch(value, /password|secret|token|oauth|sensitive|income/i);
  assert.equal(
    readSessionDemo(storage).accounts["session-one"].identity.email,
    "dummy@example.com",
  );
  assert.deepEqual(readSessionDemo({ getItem: () => "bad JSON" }).accounts, {});
});

test("dummy Google and email methods return explicitly simulated identities, reusing session records", async () => {
  const existing = {
    activeId: null,
    accounts: {
      demo: {
        identity: {
          id: "demo",
          displayName: "Existing",
          email: "google.demo@example.test",
        },
        profile: {},
        plans: {},
      },
    },
  };
  const service = createSessionDemoService(() => existing);
  assert.equal(service.capabilities.google, true);
  const google = await service.signInWithGoogle();
  assert.equal(google.status, "session_demo");
  assert.equal(google.user.id, "demo");
  assert.equal(google.user.emailVerified, undefined);
  const email = await service.signUp(
    "Dummy",
    "dummy@example.com",
    "never-retain-this",
  );
  assert.equal(email.status, "session_demo");
  assert.equal(email.user.email, "dummy@example.com");
  assert.doesNotMatch(JSON.stringify(email), /password|never-retain-this/);
});

test("unconfigured real auth cannot silently use local demo identities or return a fabricated session", async () => {
  assert.deepEqual(authService.capabilities, {
    emailPassword: false,
    google: false,
    passwordReset: false,
  });
  for (const operation of [
    () => authService.signIn("person@mail.com", "value"),
    () => authService.signUp("Name", "person@mail.com", "value"),
    () => authService.signInWithGoogle(),
    () => authService.resetPassword("person@mail.com"),
  ]) {
    await assert.rejects(
      operation,
      (error) =>
        error instanceof AuthServiceError && error.code === "unavailable",
    );
  }
});

test("session recovery is explicitly simulated and does not read or mutate accounts", async () => {
  const service = createSessionDemoService(() => {
    throw new Error("Recovery must not inspect account existence");
  });
  assert.equal(service.capabilities.passwordReset, true);
  assert.deepEqual(await service.resetPassword("person@example.com"), {
    status: "recovery_demo_requested",
  });
});
test("target email auth validates normal email and empty fields without a demo domain requirement", () => {
  assert.deepEqual(
    validateAuthFields("daftar", {
      name: "Nama",
      email: "nama@gmail.com",
      password: "provider-policy-applies",
    }),
    {},
  );
  assert.deepEqual(Object.keys(validateAuthFields("daftar", {})), [
    "name",
    "email",
    "password",
  ]);
  assert.equal(
    validateAuthFields("masuk", { email: "bad", password: "" }).email,
    "Periksa kembali format alamat email.",
  );
  assert.deepEqual(
    validateAuthFields("pemulihan", { email: "name@example.com" }),
    {},
  );
});
test("auth redirect intent preserves bookmark variant, query and hash without open redirects or auth loops", () => {
  const intent = authIntent(
    "?next=" +
      encodeURIComponent("/layanan/ktp-el/hilang?q=ktp#dokumen") +
      "&save=ktp-el&variant=hilang",
  );
  assert.equal(intent.next, "/layanan/ktp-el/hilang?q=ktp#dokumen");
  assert.equal(intent.guestNext, intent.next);
  assert.equal(intent.save, "ktp-el");
  assert.equal(intent.variant, "hilang");
  for (const next of [
    "https://evil.test",
    "//evil.test",
    "/masuk",
    "/daftar?next=/program",
    "/demo/masuk",
    "/lupa-kata-sandi",
  ])
    assert.equal(
      authIntent("?next=" + encodeURIComponent(next)).next,
      "/",
    );
  assert.equal(
    authIntent("?next=%2Fprofil%2Fedit&intent=personalisasi").personalization,
    true,
  );
  assert.equal(
    authIntent("?next=%2Fprogram%2Frekomendasi%3Fq%3Da").guestNext,
    "/program",
  );
  assert.equal(authIntent("?save=bad%3Aid&variant=..%2Fother").save, null);
});
test("provider errors map to clear messages without disclosing raw SDK details", () => {
  for (const code of [
    "invalid_credentials",
    "account_unavailable",
    "weak_password",
    "network",
    "cancelled",
    "popup_blocked",
    "linking_required",
    "session_expired",
  ]) {
    assert.ok(authErrorMessage(new AuthServiceError(code)));
  }
  assert.equal(
    authErrorMessage(new Error("SECRET SDK STACK")),
    "Permintaan belum berhasil. Coba beberapa saat lagi.",
  );
});
