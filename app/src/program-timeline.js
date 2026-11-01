// Baseline records when date tracking was introduced. Original addition dates
// were not recorded and remain null; never infer launch dates from this baseline.
const initialRecord = () => ({
  addedOn: null,
  firstRecordedOn: "2026-11-01",
  recordingBasis: "baseline",
  contentReviewedOn: "2026-10-31",
  scheduleVerifiedOn: null,
  periods: [],
});
/** @type {Record<string, import("./models").ProgramTimeline>} */
export const programTimelines = Object.fromEntries(
  ["kip-kuliah", "pip", "pelatihan-vokasi", "kur", "flpp", "atensi"].map(
    (id) => [id, initialRecord()],
  ),
);
const kipSource = "https://kip-kuliah.kemdiktisaintek.go.id/";
for (const id of ["berau-cerdas", "kaltim-tuntas"]) {
  programTimelines[id] = {
    ...initialRecord(),
    addedOn: "2026-11-01",
    recordingBasis: "addition",
    contentReviewedOn: "2026-11-01",
  };
}
programTimelines["kip-kuliah"].scheduleVerifiedOn = "2026-11-01";
programTimelines["kip-kuliah"].periods = [
  ["Pendaftaran akun siswa KIP Kuliah 2026", "2026-02-03", "2026-10-31"],
  ["Seleksi SNBP 2026", "2026-02-10", "2026-02-18"],
  ["Seleksi UTBK-SNBT 2026", "2026-03-25", "2026-04-07"],
  ["Seleksi Mandiri PTN 2026", "2026-06-15", "2026-10-31"],
  ["Seleksi Mandiri PTS 2026", "2026-06-15", "2026-11-01"],
].map(([label, opensOn, closesOn]) => ({
  label,
  opensOn,
  closesOn,
  sourceUrl: kipSource,
}));

export function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function todayInJakarta(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function verifiedPeriods(item) {
  if (!isIsoDate(item.timeline?.scheduleVerifiedOn)) return [];
  return (item.timeline.periods || []).filter(
    (period) =>
      isIsoDate(period.opensOn) &&
      isIsoDate(period.closesOn) &&
      period.opensOn <= period.closesOn &&
      period.sourceUrl?.startsWith("https://"),
  );
}
export function upcomingDeadline(item, today = todayInJakarta()) {
  return (
    verifiedPeriods(item)
      .filter((period) => period.closesOn >= today)
      .sort(
        (a, b) =>
          a.closesOn.localeCompare(b.closesOn) ||
          a.label.localeCompare(b.label, "id"),
      )[0] || null
  );
}
export function registrationStatus(item, today = todayInJakarta()) {
  const periods = verifiedPeriods(item);
  if (!periods.length) return "unknown";
  if (
    periods.some(
      (period) => period.opensOn <= today && period.closesOn >= today,
    )
  )
    return "open";
  if (periods.some((period) => period.opensOn > today)) return "upcoming";
  return "closed";
}
export function sortPrograms(items, sort = "latest", today = todayInJakarta()) {
  const nameOrder = (a, b) =>
    a.name.localeCompare(b.name, "id") || a.id.localeCompare(b.id);
  return [...items].sort((a, b) => {
    if (sort === "az" || sort === "za")
      return (sort === "za" ? -1 : 1) * nameOrder(a, b);
    if (sort === "deadline") {
      const aDeadline = upcomingDeadline(a, today),
        bDeadline = upcomingDeadline(b, today);
      if (aDeadline && bDeadline)
        return (
          aDeadline.closesOn.localeCompare(bDeadline.closesOn) ||
          nameOrder(a, b)
        );
      if (aDeadline || bDeadline) return aDeadline ? -1 : 1;
      // Unknown or expired deadlines never become upcoming by inference.
      return nameOrder(a, b);
    }
    const recordedDate = (item) =>
      [item.timeline?.addedOn, item.timeline?.firstRecordedOn].find(
        isIsoDate,
      ) || "";
    return recordedDate(b).localeCompare(recordedDate(a)) || nameOrder(a, b);
  });
}
export function programTimeNote(item, today = todayInJakarta()) {
  const deadline = upcomingDeadline(item, today);
  const format = (value) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
  if (deadline)
    return {
      label: `Tenggat ${deadline.label}: ${format(deadline.closesOn)}`,
      sourceUrl: deadline.sourceUrl,
    };
  const expired = verifiedPeriods(item).sort((a, b) =>
    b.closesOn.localeCompare(a.closesOn),
  )[0];
  if (expired)
    return {
      label: `Jadwal terakhir berakhir ${format(expired.closesOn)}. Periksa periode berikutnya.`,
      sourceUrl: expired.sourceUrl,
    };
  return { label: "Tenggat belum terverifikasi.", sourceUrl: null };
}
