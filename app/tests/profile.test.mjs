import test from "node:test";
import assert from "node:assert/strict";
import {
  editableProfile,
  hasProfileInformation,
  profileDirty,
  profileInitials,
  profileLocation,
  profileRegions,
} from "../src/profile-data.ts";
import { persistentProfile } from "../src/account-store.ts";
import { selectHomepagePrograms } from "../src/homepage-featured.ts";
import { programs } from "../src/data.js";

test("profile locations normalize canonical codes and compatible old labels without inventing cities", () => {
  assert.equal(profileRegions.length, 38);
  assert.equal(
    profileRegions.flatMap((province) => province.cities).length,
    514,
  );
  assert.deepEqual(profileLocation({ provinceCode: "64", cityCode: "64.03" }), {
    provinceCode: "64",
    cityCode: "64.03",
    province: "Kalimantan Timur",
    city: "Kabupaten Berau",
  });
  assert.equal(
    profileLocation({ province: "Jawa Timur", city: "Kota Malang" }).cityCode,
    "35.73",
  );
  assert.equal(
    profileLocation({ provinceCode: "35", cityCode: "64.03" }).cityCode,
    "",
  );
  assert.equal(profileLocation({ city: "Malang" }).cityCode, "");
});
test("profile dirty state ignores selection order but recognizes real account and profile changes", () => {
  const original = {
    activities: ["bekerja", "mahasiswa"],
    interests: ["usaha", "pendidikan"],
  };
  assert.equal(
    profileDirty(
      " Name ",
      {
        ...editableProfile(original),
        activities: ["mahasiswa", "bekerja"],
        interests: ["pendidikan", "usaha"],
      },
      "Name",
      original,
    ),
    false,
  );
  assert.equal(
    profileDirty("New", editableProfile(original), "Name", original),
    true,
  );
  assert.equal(hasProfileInformation({ province: "" }), false);
  assert.equal(hasProfileInformation({ activities: ["bekerja"] }), true);
  assert.equal(hasProfileInformation({ interests: ["usaha"] }), true);
  assert.equal(profileInitials("Nama Pengguna"), "NP");
  assert.equal(profileInitials("", "mail@example.com"), "M");
});
test("other activities remain optional free text and never become invented matching rules", () => {
  assert.equal(
    editableProfile({ activitiesOther: "stale" }).activitiesOther,
    "",
  );
  const profile = {
    activities: ["lainnya"],
    interests: ["usaha"],
    activitiesOther: "pelajar dokter petani",
  };
  assert.equal(
    editableProfile(profile).activitiesOther,
    "pelajar dokter petani",
  );
  assert.deepEqual(
    selectHomepagePrograms(programs, profile).items.map((item) => item.id),
    selectHomepagePrograms(programs, {
      ...profile,
      activitiesOther: "teks lain",
    }).items.map((item) => item.id),
  );
  assert.deepEqual(
    persistentProfile({
      provinceCode: "64",
      cityCode: "64.03",
      activitiesOther: "Kegiatan",
      password: "secret",
      income: "private",
    }),
    { provinceCode: "64", cityCode: "64.03", activitiesOther: "Kegiatan" },
  );
});
