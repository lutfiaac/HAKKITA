import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  catalog,
  categories,
  filterCatalog,
  matchPrograms,
  findItem,
} from "../src/data.js";
import { budgetSnapshot, selectBudget } from "../src/budget.js";
import { registrationStatus } from "../src/program-timeline.js";

test("bundled region dataset covers all 38 provinces and 514 regencies with unique parent codes", () => {
  const { regions, source } = JSON.parse(
    readFileSync(
      new URL("../src/data/indonesia-regions.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(source, "https://wilayah.id/");
  assert.equal(regions.length, 38);
  const cities = regions.flatMap((province) => province.cities);
  assert.equal(cities.length, 514);
  assert.equal(new Set(cities.map((city) => city.code)).size, 514);
  for (const province of regions) {
    assert.ok(province.cities.length > 0);
    assert.ok(
      province.cities.every((city) =>
        city.code.startsWith(province.code + "."),
      ),
    );
  }
  assert.ok(
    regions.find((province) => province.name === "Papua Barat Daya").cities
      .length,
  );
});

test("regional scholarships respect province and district coverage while retaining broader programs", () => {
  const ids = (filters) =>
    filterCatalog({ type: "program", ...filters }).map((item) => item.id);
  assert.ok(
    ids({ region: "Kalimantan Timur", city: "Kabupaten Berau" }).includes(
      "berau-cerdas",
    ),
  );
  assert.ok(
    ids({ region: "Kalimantan Timur", city: "Kabupaten Berau" }).includes(
      "kaltim-tuntas",
    ),
  );
  assert.ok(
    ids({ region: "Kalimantan Timur", city: "Kabupaten Berau" }).includes(
      "kip-kuliah",
    ),
  );
  assert.ok(
    !ids({ region: "Kalimantan Timur", city: "Kota Samarinda" }).includes(
      "berau-cerdas",
    ),
  );
  assert.ok(!ids({ region: "Jawa Timur" }).includes("kaltim-tuntas"));
  assert.ok(!ids({ region: "nasional" }).includes("berau-cerdas"));
  assert.equal(registrationStatus(findItem("kaltim-tuntas")), "unknown");
});

test("benefit multi-select uses OR within the group and AND across filters without duplicating subsidized financing", () => {
  assert.deepEqual(
    filterCatalog({ type: "program", benefit: ["pembiayaan", "subsidi"] })
      .map((item) => item.id)
      .sort(),
    ["flpp", "kur"],
  );
  assert.deepEqual(
    filterCatalog({
      type: "program",
      benefit: ["pembiayaan", "subsidi"],
      category: "perumahan",
    }).map((item) => item.id),
    ["flpp"],
  );
  assert.equal(
    filterCatalog({
      type: "program",
      benefit: ["biaya-pendidikan", "pelatihan"],
    }).length,
    5,
  );
  assert.equal(
    filterCatalog({ type: "program", benefit: ["bantuan-sosial"] }).length,
    0,
  );
  assert.equal(
    filterCatalog({
      type: "program",
      benefit: ["pembiayaan"],
      category: "pendidikan",
    }).length,
    0,
  );
  assert.equal(registrationStatus(findItem("kur"), "2026-11-01"), "unknown");
  assert.equal(
    registrationStatus(findItem("kip-kuliah"), "2026-11-01"),
    "open",
  );
  assert.equal(
    registrationStatus(findItem("kip-kuliah"), "2026-11-02"),
    "closed",
  );
  assert.ok(
    filterCatalog({ type: "program", periodStatus: "open" }).every(
      (item) => registrationStatus(item) === "open",
    ),
  );
});
import {
  sortPrograms,
  upcomingDeadline,
  todayInJakarta,
  isIsoDate,
  programTimeNote,
} from "../src/program-timeline.js";

test("program timing keeps unknown original dates explicit and verifies scoped deadline sources", () => {
  for (const item of catalog.filter((item) => item.type === "program")) {
    const addition = ["berau-cerdas", "kaltim-tuntas"].includes(item.id);
    assert.equal(item.timeline.addedOn, addition ? "2026-11-01" : null);
    assert.equal(
      item.timeline.recordingBasis,
      addition ? "addition" : "baseline",
    );
    assert.ok(isIsoDate(item.timeline.firstRecordedOn));
    for (const period of item.timeline.periods) {
      assert.ok(isIsoDate(period.opensOn) && isIsoDate(period.closesOn));
      assert.ok(period.opensOn <= period.closesOn);
      assert.equal(
        new URL(period.sourceUrl).hostname,
        "kip-kuliah.kemdiktisaintek.go.id",
      );
    }
  }
  assert.equal(
    upcomingDeadline(findItem("kip-kuliah"), "2026-11-01").label,
    "Seleksi Mandiri PTS 2026",
  );
  assert.equal(upcomingDeadline(findItem("kip-kuliah"), "2026-11-02"), null);
  assert.match(
    programTimeNote(findItem("kip-kuliah"), "2026-11-02").label,
    /berakhir/,
  );
  assert.match(
    programTimeNote(findItem("kur"), "2026-11-01").label,
    /belum terverifikasi/,
  );
  assert.equal(todayInJakarta(new Date("2026-10-31T18:00:00Z")), "2026-11-01");
  assert.equal(isIsoDate("2026-02-31"), false);
});

test("time sorting prioritizes recorded dates and verified future deadlines without mutating filtered results", () => {
  const sample = (id, date, deadline = null, verified = true) => ({
    id,
    name: id,
    timeline: {
      addedOn: null,
      firstRecordedOn: date,
      scheduleVerifiedOn: verified ? "2026-11-01" : null,
      periods: deadline
        ? [
            {
              label: "Seleksi",
              opensOn: "2026-10-01",
              closesOn: deadline,
              sourceUrl: "https://example.gov/period",
            },
          ]
        : [],
    },
  });
  const input = [
    sample("A", "2026-10-01"),
    sample("B", "2026-11-01", "2026-11-04"),
    sample("C", null, "2026-11-02"),
    sample("D", "invalid", "2026-10-31"),
    sample("E", "2026-10-01", "2026-11-01", false),
  ];
  assert.deepEqual(
    sortPrograms(input, "latest").map((item) => item.id),
    ["B", "A", "E", "C", "D"],
  );
  assert.deepEqual(
    sortPrograms(input, "deadline", "2026-11-01").map((item) => item.id),
    ["C", "B", "A", "D", "E"],
  );
  assert.deepEqual(
    input.map((item) => item.id),
    ["A", "B", "C", "D", "E"],
  );
  assert.deepEqual(sortPrograms([], "deadline"), []);
  assert.equal(sortPrograms([input[0]], "latest").length, 1);
  assert.deepEqual(
    sortPrograms(input, "za").map((item) => item.id),
    ["E", "D", "C", "B", "A"],
  );
});

test("catalog uses unique routes, sourced content, supported categories, and valid related items", () => {
  assert.equal(new Set(catalog.map((i) => i.id)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(categories.some((c) => c.id === item.category));
    assert.ok(item.agency && item.region && item.summary && item.about);
    assert.ok(new URL(item.official).protocol === "https:");
    assert.ok(item.sources.length > 0);
    for (const source of item.sources)
      assert.equal(new URL(source.url).protocol, "https:");
    for (const id of item.related)
      assert.ok(findItem(id), `${item.id} links to missing ${id}`);
    for (const variant of item.variants || [item])
      assert.ok(
        variant.requirements.length &&
          variant.documents.length &&
          variant.steps.length,
      );
  }
});
test("search tolerates case, whitespace, multiple terms and Indonesian categories", () => {
  assert.equal(filterCatalog({ query: "  KIP   KULIAH " })[0].id, "kip-kuliah");
  assert.equal(filterCatalog({ query: "BPJS" }).length, 1);
  assert.equal(filterCatalog({ query: "kesehatan" })[0].id, "mobile-jkn");
  assert.equal(filterCatalog({ query: "zzzz-nonexistent" }).length, 0);
  assert.equal(filterCatalog({ query: "   " }).length, catalog.length);
});
test("combined catalog filters do not broaden regional guidance", () => {
  assert.equal(filterCatalog({ type: "program" }).length, 8);
  assert.equal(filterCatalog({ type: "layanan" }).length, 8);
  assert.equal(
    filterCatalog({ category: "pendidikan", type: "layanan" }).length,
    0,
  );
  assert.ok(
    !filterCatalog({ region: "nasional" }).some((x) => x.id === "ktp-el"),
  );
  assert.ok(
    filterCatalog({ region: "jakarta" }).some((x) => x.id === "ktp-el"),
  );
});
test("KIP matching rejects explicit year conflict and never promises eligibility", () => {
  const [valid] = matchPrograms({
    need: "kuliah",
    year: "2026",
    economy: "yes",
  });
  assert.equal(valid.issues.length, 0);
  assert.ok(valid.checks.length > 0);
  assert.equal(valid.status, "Perlu Periksa Persyaratan");
  const [conflict] = matchPrograms({
    need: "kuliah",
    year: "other",
    economy: "no",
  });
  assert.equal(conflict.issues.length, 2);
});
test("unknown welfare data retains route to verify requirements", () => {
  const [result] = matchPrograms({
    need: "kuliah",
    year: "unknown",
    economy: "unknown",
  });
  assert.equal(result.item.id, "kip-kuliah");
  assert.equal(result.issues.length, 0);
  assert.equal(result.checks.length, 3);
});
test("matching explains age, education, student and business conflicts", () => {
  assert.deepEqual(matchPrograms({}), []);
  assert.equal(
    matchPrograms({ need: "kerja", age: "under17", education: "other" })[0]
      .issues.length,
    2,
  );
  assert.equal(
    matchPrograms({ need: "sekolah", student: "no" })[0].issues.length,
    1,
  );
  assert.equal(
    matchPrograms({ need: "usaha", business: "no" })[0].issues.length,
    1,
  );
  assert.deepEqual(matchPrograms({ need: "unknown" }), []);
});
test("KTP replacement variants keep distinct documents", () => {
  const ktp = findItem("ktp-el");
  assert.equal(ktp.variants.length, 4);
  assert.ok(
    ktp.variants
      .find((v) => v.id === "hilang")
      .documents.some((x) => /kepolisian/.test(x)),
  );
  assert.ok(
    !ktp.variants
      .find((v) => v.id === "rusak")
      .documents.some((x) => /kepolisian/.test(x)),
  );
});
test("budget groups reconcile within source rounding and missing years stay missing", () => {
  const b = budgetSnapshot;
  assert.ok(
    Math.abs(b.rows.reduce((n, r) => n + r.budget, 0) - b.totalBudget) < 0.02,
  );
  assert.ok(
    Math.abs(b.rows.reduce((n, r) => n + r.realized, 0) - b.totalRealized) <
      0.02,
  );
  assert.equal(selectBudget("2025", "daerah"), null);
  assert.equal(selectBudget("2026", "nasional"), null);
});
