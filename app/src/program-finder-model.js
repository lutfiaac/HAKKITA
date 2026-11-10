import { programCategories } from "./taxonomy.ts";

const activityTargets = {
  pelajar: ["pelajar"],
  mahasiswa: ["mahasiswa"],
  bekerja: ["pekerja"],
  "mencari-kerja": ["pencari-kerja", "lulusan-baru"],
  usaha: ["umkm"],
  lainnya: ["umum"],
};

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id")
    .trim();

export function recommendForAnswers(items, answers) {
  const selectedCategories = answers.categories || [];
  if (!selectedCategories.length) return [];

  const selectedActivities = new Set(
    (answers.activities || []).flatMap((activity) => activityTargets[activity] || []),
  );
  return items
    .filter((item) => {
      const categories = [item.primaryCategory || item.category, ...(item.secondaryCategories || [])];
      const matchesCategory = selectedCategories.some((category) => categories.includes(category));
      if (!matchesCategory) return false;

      const coverage = item.regionCoverage;
      if (answers.province && coverage?.level && coverage.level !== "national") {
        if (coverage.provinces?.length && !coverage.provinces.includes(answers.province))
          return false;
        if (
          answers.city &&
          coverage.level === "city" &&
          coverage.cities?.length &&
          !coverage.cities.some((city) => normalize(city) === normalize(answers.city))
        ) return false;
      }
      return true;
    })
    .map((item) => {
      const itemCategories = [item.primaryCategory || item.category, ...(item.secondaryCategories || [])];
      const matchedCategories = selectedCategories.filter((category) => itemCategories.includes(category));
      const reasons = [];
      const matchingNames = matchedCategories
        .map((id) => programCategories.find((category) => category.id === id)?.name)
        .filter(Boolean);
      if (matchingNames.length)
        reasons.push(`Ditampilkan karena kamu memilih kategori ${matchingNames.join(", ")}.`);

      const targetGroups = item.targetGroups || [];
      const activityMatch = [...selectedActivities].some((target) => targetGroups.includes(target));
      if (activityMatch)
        reasons.push("Sasaran program mencakup kegiatan yang kamu pilih.");

      const educationMatch = Boolean(
        answers.education && item.educationLevels?.includes(answers.education),
      );
      if (educationMatch)
        reasons.push("Jenjang program mencakup pendidikan yang kamu pilih.");

      const provinceMatch = Boolean(
        answers.province &&
        item.regionCoverage?.level !== "national" &&
        item.regionCoverage?.provinces?.includes(answers.province),
      );
      const cityMatch = Boolean(
        answers.city &&
        item.regionCoverage?.level === "city" &&
        item.regionCoverage?.cities?.some((city) => normalize(city) === normalize(answers.city)),
      );
      if (cityMatch)
        reasons.push(`Program tercatat mencakup ${answers.city}.`);
      else if (provinceMatch)
        reasons.push(`Program tercatat mencakup wilayah ${answers.province}.`);
      else if (answers.province && item.regionCoverage?.level === "national")
        reasons.push(`Cakupan program nasional mencakup ${answers.province}.`);

      const primaryCategory = item.primaryCategory || item.category;
      const score =
        (selectedCategories.includes(primaryCategory) ? 4 : 3) +
        (activityMatch ? 2 : 0) +
        (educationMatch ? 1 : 0) +
        (provinceMatch || cityMatch ? 1 : 0);
      return { item, reasons, score };
    })
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "id"));
}

export function emptyFinderAnswers() {
  return {
    categories: [],
    activities: [],
    provinceCode: "",
    province: "",
    cityCode: "",
    city: "",
    education: "",
  };
}
