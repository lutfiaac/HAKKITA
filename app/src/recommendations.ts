import type {
  EligibilityRule,
  Profile,
  ProgramMetadata,
  Recommendation,
  RuleResult,
} from "./models";
const activityTargets: Record<string, string[]> = {
  pelajar: ["pelajar"],
  mahasiswa: ["mahasiswa"],
  "mencari-kerja": ["pencari-kerja", "lulusan-baru"],
  bekerja: ["pekerja"],
  usaha: ["umkm"],
  lainnya: ["umum"],
};
export function evaluateRules(
  rules: EligibilityRule[],
  answers: Record<string, unknown>,
): RuleResult[] {
  return rules.map((rule) => {
    const value = answers[rule.field];
    const missing =
      value === undefined ||
      value === null ||
      value === "" ||
      value === "unknown";
    return {
      id: rule.id,
      label: rule.label,
      sourceUrl: rule.sourceUrl,
      state: missing
        ? "unknown"
        : rule.allowed.includes(String(value))
          ? "met"
          : "not-met",
    };
  });
}
export function profileState(profile: Profile) {
  if (
    !Object.values(profile).some((v) =>
      Array.isArray(v) ? v.length : Boolean(v),
    )
  )
    return "Belum ada informasi profil";
  if (
    profile.interests?.length &&
    (profile.activities?.length || profile.year || profile.education)
  )
    return "Cukup untuk rekomendasi awal";
  return "Profil sebagian terisi";
}
export function recommendPrograms(
  items: ({ id: string; name: string } & ProgramMetadata)[],
  profile: Profile,
  temporary: Record<string, string> = {},
): Recommendation[] {
  const interests = profile.interests || [],
    targets = (profile.activities || []).flatMap(
      (a) => activityTargets[a] || [],
    );
  if (!interests.length && !targets.length) return [];
  const answers: Record<string, unknown> = { ...profile, ...temporary };
  if (answers.student === undefined && profile.activities?.includes("pelajar"))
    answers.student = "yes";
  if (answers.business === undefined && profile.activities?.includes("usaha"))
    answers.business = "yes";
  return items
    .filter(
      (item) =>
        (interests.length
          ? interests.includes(item.primaryCategory) ||
            item.secondaryCategories.some((c) => interests.includes(c))
          : targets.some((t) => item.targetGroups.includes(t))) &&
        (item.regionCoverage.level === "national" ||
          !profile.province ||
          item.regionCoverage.provinces.includes(profile.province)),
    )
    .map((item) => {
      const reasons: string[] = [];
      if (
        interests.includes(item.primaryCategory) ||
        item.secondaryCategories.some((c) => interests.includes(c))
      )
        reasons.push("Bidang program sesuai dengan minat yang kamu pilih.");
      if (targets.some((t) => item.targetGroups.includes(t)))
        reasons.push("Sasaran program mencakup kegiatan yang kamu pilih.");
      if (profile.province && item.regionCoverage.level === "national")
        reasons.push(
          `Cakupan program nasional, termasuk ${profile.province}; lokasi pelaksanaan tetap perlu diperiksa.`,
        );
      const rules = evaluateRules(item.eligibilityRules, answers);
      if (
        item.dataCompleteness === "requires-assessment" &&
        !rules.some((r) => r.state === "unknown")
      )
        rules.push({
          id: "official-assessment",
          label: "Hasil asesmen penyelenggara belum tersedia di Hakkita.",
          state: "unknown",
          sourceUrl: item.eligibilityRules[0]?.sourceUrl || "",
        });
      const status = rules.some((r) => r.state === "not-met")
        ? "Belum Sesuai dengan Kondisi"
        : !rules.length || rules.some((r) => r.state === "unknown")
          ? "Perlu Periksa Persyaratan"
          : "Berpotensi Relevan";
      return { id: item.id, status, reasons, rules };
    });
}
