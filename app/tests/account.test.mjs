import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCOUNT_KEY,
  createLocalAccountAdapter,
  normalizeSession,
  persistentProfile,
  safeReturnPath,
  validateIdentity,
} from "../src/account-store.ts";
import {
  evaluateRules,
  recommendPrograms,
  profileState,
} from "../src/recommendations.ts";
import {
  programs,
  programCategories,
  serviceCategories,
  filterCatalog,
  findItem,
  resultUrl,
} from "../src/data.js";
import { selectBudget, formatBudget } from "../src/budget.js";

test("taxonomy has exactly seven program and twelve service categories, with no invented entries", () => {
  assert.equal(programCategories.length, 7);
  assert.equal(serviceCategories.length, 12);
  assert.equal(
    programCategories.find((c) => c.id === "pekerjaan").name,
    "Pekerjaan & Karier",
  );
  for (const item of programs) {
    assert.ok(item.eligibilityRules.length);
    for (const rule of item.eligibilityRules)
      assert.ok(item.sources.some((s) => s.url === rule.sourceUrl));
  }
});
test("identity validation accepts only example identities, trims whitespace, and enforces length", () => {
  assert.equal(
    Object.keys(validateIdentity(" Sahabat ", " USER@example.test ").errors)
      .length,
    0,
  );
  assert.equal(
    validateIdentity(" Sahabat ", " USER@example.test ").identity.email,
    "user@example.test",
  );
  assert.ok(validateIdentity("", "").errors.displayName);
  assert.ok(validateIdentity("A", "real@gmail.com").errors.email);
  assert.ok(
    validateIdentity("A".repeat(61), "a@example.test").errors.displayName,
  );
});
test("adapter strips sensitive answers and whitelists account data", () => {
  const map = new Map();
  const storage = {
    getItem: (key) => map.get(key) || null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
  const adapter = createLocalAccountAdapter(storage);
  assert.deepEqual(adapter.read(), { activeId: null, accounts: {} });
  const identity = { id: "a", displayName: "A", email: "a@example.test" };
  adapter.write({
    activeId: "a",
    accounts: {
      a: {
        identity,
        profile: {
          province: "Jawa Timur",
          interests: ["usaha"],
          activities: ["usaha"],
          economy: "yes",
          business: "yes",
          firstHome: "yes",
          nik: "sensitive-identity",
          income: "sensitive-income",
          password: "never-persist",
        },
        plans: { kur: { done: [], variant: "" } },
      },
    },
  });
  const raw = map.get(ACCOUNT_KEY);
  for (const key of [
    "economy",
    "business",
    "firstHome",
    "nik",
    "income",
    "password",
    "sensitive-identity",
  ])
    assert.ok(!raw.includes(key));
  assert.equal(adapter.read().accounts.a.profile.province, "Jawa Timur");
  adapter.reset();
  assert.deepEqual(adapter.read().accounts, {});
  map.set(ACCOUNT_KEY, "broken-json");
  assert.deepEqual(adapter.read().accounts, {});
});
test("malformed sessions and plan data cannot mix account ownership or crash a view", () => {
  assert.equal(
    normalizeSession({ activeId: "constructor", accounts: {} }).activeId,
    null,
  );
  assert.equal(
    normalizeSession({ activeId: "missing", accounts: {} }).activeId,
    null,
  );
  assert.equal(
    Object.keys(
      normalizeSession({
        accounts: {
          a: {
            identity: { id: "b", email: "a@example.test", displayName: "A" },
          },
        },
      }).accounts,
    ).length,
    0,
  );
  const normalized = normalizeSession({
    activeId: "a",
    accounts: {
      a: {
        identity: { id: "a", email: "a@example.test", displayName: "A" },
        profile: {},
        plans: {
          kur: { done: [0, -1, 1.5, "3"], variant: "" },
          "bad/path": { done: [], variant: "" },
        },
      },
    },
  });
  assert.deepEqual(normalized.accounts.a.plans.kur.done, [0]);
  assert.equal(Object.keys(normalized.accounts.a.plans).length, 1);
});
test("return destinations remain internal and never loop into authentication", () => {
  for (const url of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/masuk?next=/masuk",
    "/daftar",
  ])
    assert.equal(safeReturnPath(url), "/rencanaku");
  assert.equal(
    safeReturnPath("/layanan/ktp-el/hilang"),
    "/layanan/ktp-el/hilang",
  );
});
test("recommendation evaluation treats unknowns as unknown and mandatory conflicts as conflicts", () => {
  const kip = programs.find((p) => p.id === "kip-kuliah");
  assert.deepEqual(
    evaluateRules(kip.eligibilityRules, {}).map((r) => r.state),
    ["unknown", "unknown", "unknown"],
  );
  const profile = {
    interests: ["pendidikan"],
    activities: ["mahasiswa"],
    year: "2026",
  };
  const relevant = recommendPrograms(programs, profile, {
    economy: "yes",
    admitted: "yes",
  }).find((r) => r.id === "kip-kuliah");
  assert.equal(relevant.status, "Berpotensi Relevan");
  assert.equal(
    recommendPrograms(
      programs,
      { ...profile, year: "other" },
      { economy: "yes", admitted: "yes" },
    ).find((r) => r.id === "kip-kuliah").status,
    "Belum Sesuai dengan Kondisi",
  );
  assert.equal(
    recommendPrograms(programs, profile, {}).find((r) => r.id === "kip-kuliah")
      .status,
    "Perlu Periksa Persyaratan",
  );
  assert.equal(
    recommendPrograms(programs, {
      interests: ["kesehatan"],
      activities: ["bekerja"],
    }).length,
    0,
  );
});
test("recommendations recalculate from profile and do not infer unknown economic status", () => {
  const first = recommendPrograms(programs, {
    interests: ["usaha"],
    activities: ["usaha"],
  });
  assert.deepEqual(
    first.map((r) => r.id),
    ["kur"],
  );
  const next = recommendPrograms(programs, {
    interests: ["perumahan"],
    activities: ["bekerja"],
  });
  assert.deepEqual(
    next.map((r) => r.id),
    ["flpp"],
  );
  assert.equal(profileState({}), "Belum ada informasi profil");
  assert.equal(
    profileState({ province: "Jawa Timur" }),
    "Profil sebagian terisi",
  );
  assert.equal(
    profileState({ interests: ["usaha"], activities: ["usaha"] }),
    "Cukup untuk rekomendasi awal",
  );
  const atensi = recommendPrograms(
    programs,
    { interests: ["rentan"] },
    { officialAssessment: "yes" },
  )[0];
  assert.equal(atensi.status, "Perlu Periksa Persyaratan");
});
test("program filters apply AND across dimensions, OR across recipients, and include national coverage", () => {
  assert.ok(
    filterCatalog({
      type: "program",
      category: "pendidikan",
      region: "Jawa Timur",
    }).some((p) => p.id === "kip-kuliah"),
  );
  assert.ok(
    !filterCatalog({ type: "layanan", region: "Jawa Timur" }).some(
      (p) => p.id === "ktp-el",
    ),
  );
  assert.deepEqual(
    filterCatalog({
      type: "program",
      targets: ["umkm", "petani"],
      benefit: "pembiayaan",
    }).map((p) => p.id),
    ["kur", "flpp"],
  );
  assert.equal(
    filterCatalog({ type: "program", verifiedPeriod: true }).length,
    0,
  );
});
test("common service synonyms find the correct record and variant", () => {
  assert.equal(filterCatalog({ query: "bikin NPWP" })[0].id, "npwp");
  assert.equal(
    filterCatalog({ query: "perpanjang SIM" })[0].id,
    "perpanjangan-sim",
  );
  const ktp = filterCatalog({ query: "KTP hilang" })[0];
  assert.equal(ktp.id, "ktp-el");
  assert.equal(resultUrl(ktp, "KTP hilang"), "/layanan/ktp-el/hilang");
  assert.equal(
    resultUrl(findItem("ktp-el"), "KTP rusak"),
    "/layanan/ktp-el/rusak",
  );
});
test("budget categories are sourced and missing/null values stay distinguishable from zero", () => {
  assert.equal(selectBudget("2026", "daerah", "Jawa Timur"), null);
  assert.equal(
    selectBudget("2026", "daerah", "nasional", "Belanja Modal").rows.length,
    1,
  );
  assert.equal(selectBudget("2026", "daerah", "nasional", "unknown"), null);
  assert.equal(formatBudget(null), "Informasi belum tersedia");
  assert.equal(formatBudget(0), "0,00");
});
