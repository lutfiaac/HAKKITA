import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeProgramDetail,
  formatBenefitAmount,
  officialUrl,
  shouldRenderSection,
} from "../src/program-detail.ts";
import { programs, findItem } from "../src/data.js";
import {
  baseDetailFixture,
  detailFixtures,
} from "./program-detail-fixtures.mjs";
const normalize = (item) =>
  normalizeProgramDetail(item, undefined, "2026-11-01");

test("all existing programs normalize with explicit mechanisms, unique nonempty sections and official sources", () => {
  for (const item of programs) {
    const model = normalize(item);
    assert.ok(model.mechanisms.length);
    assert.equal(
      new Set(model.sections.map((section) => section.id)).size,
      model.sections.length,
    );
    assert.ok(model.sections.every(shouldRenderSection));
    assert.ok(model.sources.length);
    assert.ok(model.action.url);
  }
  assert.deepEqual(normalize(findItem("flpp")).mechanisms, [
    "financing",
    "subsidy",
  ]);
  assert.equal(
    normalize(findItem("atensi")).sections.find(
      (section) => section.id === "dokumen",
    ).information.status,
    "unknown",
  );
  assert.deepEqual(normalize(findItem("atensi")).relatedGuides, []);
});
test("scholarship action is a registration only for a verified open schedule", () => {
  assert.equal(
    normalize(detailFixtures.scholarship).action.label,
    "Buka pendaftaran resmi",
  );
  const closed = normalize(detailFixtures.closed);
  assert.equal(closed.registration.status, "closed");
  assert.equal(closed.action.label, "Lihat informasi resmi");
  assert.equal(
    normalize({ ...detailFixtures.scholarship, timeline: null }).action.label,
    "Lihat informasi resmi",
  );
  assert.equal(
    normalizeProgramDetail(detailFixtures.scholarship, undefined, "2026-09-01")
      .registration.status,
    "upcoming",
  );
});
test("internship qualification and duration stay data-driven and unannounced periods are distinct", () => {
  const model = normalize(detailFixtures.internship);
  assert.equal(model.registration.status, "unannounced");
  assert.match(
    model.sections.find((section) => section.id === "manfaat").information
      .value[0],
    /tiga bulan/,
  );
});
test("recipient assignment and assessment routes do not imply independent registration", () => {
  assert.equal(normalize(detailFixtures.assignment).registration, null);
  assert.equal(
    normalize(detailFixtures.assignment).action.label,
    "Cek melalui kanal resmi",
  );
  assert.equal(normalize(detailFixtures.assessment).registration, null);
  assert.equal(
    normalize(detailFixtures.assessment).action.label,
    "Lihat panduan resmi",
  );
});
test("credit, subsidy and several official distributor routes remain distinguishable", () => {
  const credit = normalize(detailFixtures.credit);
  assert.equal(credit.action.label, "Lihat cara pengajuan");
  assert.match(
    credit.sections.find((section) => section.id === "manfaat").information
      .note,
    /dikembalikan/,
  );
  assert.equal(
    credit.sections.find((section) => section.id === "cara-akses").information
      .value.length,
    2,
  );
  assert.match(normalize(detailFixtures.housing).notices[0].text, /angsuran/);
});
test("training renders only configured benefits and value conditions without inventing amounts", () => {
  const values = normalize(detailFixtures.training).sections.find(
    (section) => section.kind === "values",
  ).information.value;
  assert.equal(values[0].amount, undefined);
  assert.match(values[0].condition, /Enam minggu/);
});
test("minimal records expose important unknowns without invented documents, steps or actions", () => {
  const model = normalize(detailFixtures.sparse);
  assert.equal(model.action.url, null);
  assert.deepEqual(model.sources, []);
  for (const id of ["dokumen", "cara-akses", "persyaratan"]) {
    const information = model.sections.find(
      (section) => section.id === id,
    ).information;
    assert.equal(information.status, "unknown");
    assert.equal(information.value, undefined);
  }
  assert.ok(!model.sections.some((section) => section.id === "besaran"));
});
test("multiple routes and required, optional, conditional and alternative documents preserve their conditions", () => {
  const model = normalize(detailFixtures.multiRoute);
  const documents = model.sections.find((section) => section.id === "dokumen")
    .information.value;
  assert.deepEqual(
    documents.map((document) => document.requirement),
    ["required", "optional", "conditional", "alternative"],
  );
  assert.equal(documents[3].alternatives.length, 2);
  assert.equal(
    model.sections.find((section) => section.id === "cara-akses").information
      .value[0].steps[1].mode,
    "mixed",
  );
});
test("conflicting and unavailable sources suppress unsafe primary actions and retain uncertainty", () => {
  const conflict = normalize(detailFixtures.conflicting);
  assert.equal(conflict.action.url, null);
  assert.equal(
    conflict.sections.find((section) => section.id === "persyaratan")
      .information.status,
    "conflicting",
  );
  const unavailable = normalize({
    ...baseDetailFixture,
    detail: {
      mechanisms: ["unknown"],
      sources: [
        {
          id: "source-1",
          title: "Rujukan",
          url: baseDetailFixture.official,
          status: "unverified",
          availability: "unavailable",
        },
      ],
    },
  });
  assert.equal(unavailable.action.url, null);
  assert.equal(unavailable.sources.length, 1);
});
test("financial values require units, validate ranges and avoid crashes for malformed currencies", () => {
  assert.equal(
    formatBenefitAmount({
      label: "Bantuan",
      kind: "fixed",
      amount: 1000000,
      currency: "IDR",
    }),
    null,
  );
  assert.match(
    formatBenefitAmount({
      label: "Subsidi",
      kind: "percentage",
      amount: 10,
      unit: "dari biaya",
    }),
    /10% dari biaya/,
  );
  assert.match(
    formatBenefitAmount({
      label: "Bantuan",
      kind: "range",
      amount: 100,
      maximum: 200,
      currency: "IDR",
      unit: "per semester",
    }),
    /per semester/,
  );
  assert.equal(
    formatBenefitAmount({
      label: "Bantuan",
      kind: "range",
      amount: 200,
      maximum: 100,
      unit: "per bulan",
    }),
    null,
  );
  assert.equal(
    formatBenefitAmount({
      label: "Bantuan",
      kind: "fixed",
      amount: 100,
      currency: "INVALID_CODE",
      unit: "per bulan",
    }),
    null,
  );
});

test("information pages never become application forms and unsafe links are not actions", () => {
  assert.equal(
    normalize(detailFixtures.informationOnly).action.label,
    "Lihat informasi resmi",
  );
  assert.equal(officialUrl("javascript:alert(1)"), null);
  assert.equal(officialUrl("https://"), null);
  assert.equal(
    normalize({
      ...baseDetailFixture,
      official: "javascript:alert(1)",
      sources: [],
    }).action.url,
    null,
  );
});
test("outdated or discontinued records, renamed programs, unknown and not-applicable fields remain distinct", () => {
  assert.ok(
    normalize(findItem("kaltim-tuntas")).notices.some(
      (notice) => notice.status === "outdated",
    ),
  );
  const discontinued = normalize({
    ...detailFixtures.scholarship,
    detail: {
      ...detailFixtures.scholarship.detail,
      lifecycle: {
        status: "verified",
        value: "discontinued",
        note: "Program telah dihentikan.",
      },
      renamedTo: "Nama baru",
    },
  });
  assert.equal(discontinued.action.label, "Lihat informasi resmi");
  assert.equal(discontinued.renamedTo, "Nama baru");
  assert.equal(
    shouldRenderSection({
      id: "x",
      title: "x",
      kind: "text",
      information: { status: "not_applicable", value: "Sembunyikan" },
    }),
    false,
  );
  assert.equal(
    shouldRenderSection({
      id: "x",
      title: "x",
      kind: "text",
      information: { status: "unknown", note: "Konfirmasi" },
    }),
    true,
  );
});
