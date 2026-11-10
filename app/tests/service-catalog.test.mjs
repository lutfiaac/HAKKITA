import test from "node:test";
import assert from "node:assert/strict";
import { services, filterCatalog } from "../src/data.js";
import { serviceCategories } from "../src/taxonomy.ts";
import {
  readServiceState,
  resolveServiceCategory,
  matchesServiceRegion,
  matchesServiceChannel,
  serviceRegionOptions,
  servicePage,
  serviceReturnPath,
} from "../src/service-catalog.js";

test("eight categories contain sourced guides and retain existing IDs", () => {
  assert.equal(serviceCategories.length, 8);
  assert.equal(services.length, 30);
  assert.equal(new Set(services.map((item) => item.id)).size, 30);
  for (const item of services) {
    assert.ok(
      serviceCategories.some((category) => category.id === item.category),
    );
    assert.ok(item.serviceSubcategory);
    assert.ok(item.official && item.sources.length);
  }
  assert.equal(
    services.find((item) => item.id === "skck").category,
    "kependudukan",
  );
  assert.equal(
    services.find((item) => item.id === "lapor").category,
    "pengaduan",
  );
  for (const [old, next] of Object.entries({
    imigrasi: "kependudukan",
    hukum: "kependudukan",
    perizinan: "pekerjaan-usaha",
    ketenagakerjaan: "pekerjaan-usaha",
    akademik: "akademik",
    pertanahan: "pertanahan",
    pengaduan: "pengaduan",
  }))
    assert.equal(resolveServiceCategory(old, services), next);
  assert.equal(resolveServiceCategory("daerah", services), "");
  assert.equal(
    resolveServiceCategory("hukum", [
      { serviceSubcategory: "hukum", category: "kependudukan" },
      { serviceSubcategory: "hukum", category: "layanan-lainnya" },
    ]),
    "",
  );
});

test("service aliases, punctuation and combined filters share the catalog search", () => {
  for (const query of [
    "KTP",
    "ktp-el",
    "e-KTP",
    "KTPel",
    "  Kartu   Tanda Penduduk ",
  ])
    assert.deepEqual(
      filterCatalog({ type: "layanan", query }).map((item) => item.id),
      ["ktp-el"],
    );
  assert.deepEqual(
    filterCatalog({
      type: "layanan",
      query: "  bikin NPWP  ",
      category: "pajak",
      region: "nasional",
      channel: "online",
    }).map((item) => item.id),
    ["npwp"],
  );
  assert.equal(
    filterCatalog({ type: "layanan", query: "NPWP", category: "transportasi" })
      .length,
    0,
  );
  assert.deepEqual(
    filterCatalog({ type: "layanan", query: "keimigrasian" }).map(
      (item) => item.id,
    ),
    ["paspor"],
  );
  assert.equal(filterCatalog({ type: "layanan", items: [] }).length, 0);
});

test("service coverage is guide-specific and unknown coverage is never promoted to national", () => {
  const ids = (region) =>
    filterCatalog({ type: "layanan", region }).map((item) => item.id);
  assert.ok(!ids("nasional").includes("ktp-el"));
  assert.ok(!ids("nasional").includes("paspor"));
  assert.ok(ids("DKI Jakarta").includes("paspor"));
  assert.ok(ids("kota:DKI Jakarta:Jakarta Pusat").includes("ktp-el"));
  assert.ok(!ids("kota:DKI Jakarta:Jakarta Selatan").includes("paspor"));
  assert.ok(ids("kota:DKI Jakarta:Jakarta Selatan").includes("npwp"));
  assert.equal(
    matchesServiceRegion({ regionCoverage: null }, "Jawa Timur"),
    false,
  );
  assert.equal(
    matchesServiceRegion({ regionCoverage: null }, "belum-diketahui"),
    true,
  );
  const multi = {
    regionCoverage: {
      level: "city",
      provinces: ["Jawa Timur"],
      cities: ["Surabaya", "Malang"],
    },
  };
  assert.equal(matchesServiceRegion(multi, "kota:Jawa Timur:Malang"), true);
  assert.equal(matchesServiceRegion(multi, "kota:Jawa Timur:Blitar"), false);
  assert.ok(
    serviceRegionOptions([multi]).some(
      ([value]) => value === "kota:Jawa Timur:Surabaya",
    ),
  );
  assert.equal(matchesServiceChannel({ serviceChannels: [] }, "online"), false);
  assert.equal(
    matchesServiceChannel({ serviceChannels: ["online", "offline"] }, "mixed"),
    true,
  );
  assert.equal(
    matchesServiceChannel({ serviceChannels: ["online"] }, "mixed"),
    false,
  );
  assert.deepEqual(
    filterCatalog({ type: "layanan", channel: "mixed" })
      .map((item) => item.id)
      .sort(),
    ["bpjs-ketenagakerjaan", "ktp-el", "ombudsman", "paspor", "pbg-slf", "sim-baru", "skck"],
  );
});

test("service URLs recover from invalid filters, retain known aliases, and reject external return destinations", () => {
  const state = readServiceState(
    "?kategori=nope&wilayah=Atlantis&kanal=website&halaman=-8",
    "",
    services,
  );
  assert.equal(state.invalid, true);
  assert.equal(state.values.kategori, "");
  assert.equal(state.values.wilayah, undefined);
  assert.equal(state.values.kanal, undefined);
  assert.equal(state.values.halaman, 1);
  assert.equal(
    readServiceState("?q=passport", "imigrasi", services).values.kategori,
    "kependudukan",
  );
  assert.equal(
    serviceReturnPath(
      "?from=" + encodeURIComponent("/layanan?kategori=pajak&q=npwp"),
    ),
    "/layanan?kategori=pajak&q=npwp",
  );
  for (const destination of [
    "https://evil.test",
    "//evil.test",
    "/layanan/../../masuk",
    "/layanan/npwp",
  ])
    assert.equal(
      serviceReturnPath("?from=" + encodeURIComponent(destination)),
      "/layanan",
    );
});

test("pagination bounds rendering only when the service dataset grows and sorts consistently", () => {
  const many = Array.from({ length: 29 }, (_, i) => ({
    id: String(i),
    name: `Layanan ${String(i).padStart(2, "0")}`,
  }));
  const result = servicePage(many, { urutan: "za", halaman: 2 });
  assert.equal(result.items.length, 12);
  assert.equal(result.items[0].id, "16");
  assert.equal(result.pages, 3);
  assert.equal(
    servicePage(many, { urutan: "az", halaman: 999 }).items.length,
    5,
  );
  assert.equal(servicePage(services, { urutan: "az", halaman: 1 }).pages, 3);
  assert.equal(servicePage([], { urutan: "az", halaman: 1 }).items.length, 0);
});
