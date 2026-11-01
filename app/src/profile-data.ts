import dataset from "./data/indonesia-regions.json" with { type: "json" };
import type { Profile } from "./models";
import { programCategories } from "./taxonomy.ts";
export const activityOptions = [
  ["pelajar", "Pelajar"],
  ["mahasiswa", "Mahasiswa"],
  ["bekerja", "Bekerja"],
  ["mencari-kerja", "Mencari pekerjaan"],
  ["usaha", "Memiliki usaha"],
  ["lainnya", "Lainnya"],
];
export const profileRegions = dataset.regions;
export function profileLocation(profile: Profile) {
  const province =
    profileRegions.find((item) => item.code === profile.provinceCode) ||
    profileRegions.find((item) => item.name === profile.province);
  const city =
    province?.cities.find((item) => item.code === profile.cityCode) ||
    province?.cities.find((item) => item.name === profile.city);
  return {
    provinceCode: province?.code || "",
    province: province?.name || "",
    cityCode: city?.code || "",
    city: city?.name || "",
  };
}
export function editableProfile(profile: Profile = {}) {
  return {
    ...profileLocation(profile),
    activities: [
      ...new Set(
        (profile.activities || []).filter((value) =>
          activityOptions.some(([id]) => id === value),
        ),
      ),
    ],
    interests: [
      ...new Set(
        (profile.interests || []).filter((value) =>
          programCategories.some((item) => item.id === value),
        ),
      ),
    ],
    activitiesOther: profile.activities?.includes("lainnya")
      ? (profile.activitiesOther || "").slice(0, 100)
      : "",
  };
}
export function hasProfileInformation(profile: Profile) {
  return Object.values(profile).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value?.trim()),
  );
}
export function profileInitials(name: string, email = "") {
  const value = name.trim() || email.split("@")[0] || "?";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
export function profileDirty(
  name: string,
  draft: ReturnType<typeof editableProfile>,
  originalName: string,
  original: Profile,
) {
  const key = (value: ReturnType<typeof editableProfile>) =>
    JSON.stringify({
      ...value,
      activities: [...value.activities].sort(),
      interests: [...value.interests].sort(),
    });
  return (
    name.trim() !== originalName.trim() ||
    key(draft) !== key(editableProfile(original))
  );
}
