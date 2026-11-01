import test from "node:test";
import assert from "node:assert/strict";
import { selectHomepagePrograms } from "../src/homepage-featured.ts";
import { programs, findItem } from "../src/data.js";

test("featured homepage keeps general records for guests and incomplete profiles without mutating cards", () => {
  const guest = selectHomepagePrograms(programs);
  assert.equal(guest.mode, "guest");
  assert.deepEqual(guest.items, programs.slice(0, 6));
  assert.equal(selectHomepagePrograms(programs, {}).mode, "incomplete");
  assert.equal(
    selectHomepagePrograms(programs, { interests: ["usaha"] }).mode,
    "incomplete",
  );
  assert.equal(guest.items[0], programs[0]);
});
test("personal homepage uses matching metadata and excludes known mandatory conflicts", () => {
  const profile = { interests: ["usaha"], activities: ["usaha"] };
  const before = JSON.stringify(programs);
  const personal = selectHomepagePrograms(programs, profile);
  assert.equal(personal.mode, "personal");
  assert.deepEqual(
    personal.items.map((item) => item.id),
    ["kur"],
  );
  assert.equal(personal.items[0], findItem("kur"));
  assert.equal(
    selectHomepagePrograms(programs, profile, { business: "no" }).mode,
    "general",
  );
  assert.equal(JSON.stringify(programs), before);
});
test("no defensible personal results revert to general programs without a personalized label", () => {
  const result = selectHomepagePrograms(programs, {
    interests: ["pendidikan"],
    activities: ["mahasiswa"],
    year: "2020",
    student: "no",
    province: "Jawa Timur",
  });
  assert.equal(result.mode, "general");
  assert.deepEqual(result.items, programs.slice(0, 6));
  assert.equal(
    selectHomepagePrograms([], { interests: ["usaha"], activities: ["usaha"] })
      .mode,
    "general",
  );
});
test("regional mandatory conditions and legacy programs do not enter personal carousel", () => {
  const result = selectHomepagePrograms(programs, {
    interests: ["pendidikan"],
    activities: ["mahasiswa"],
    province: "Kalimantan Timur",
    city: "Kota Samarinda",
    year: "2026",
  });
  assert.equal(result.mode, "personal");
  assert.ok(
    !result.items.some(
      (item) => item.id === "berau-cerdas" || item.id === "kaltim-tuntas",
    ),
  );
  assert.ok(result.items.some((item) => item.id === "kip-kuliah"));
});
