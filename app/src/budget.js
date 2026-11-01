// Snapshot of DJPK SIKD. Amounts are in billion rupiah (M), not individual benefits.
export const budgetSnapshot = {
  year: "2026",
  scope: "daerah",
  reportingGovernments: 546,
  period: "Realisasi sampai Oktober 2026",
  receivedAt: "30 Oktober 2026",
  verifiedAt: "31 Oktober 2026",
  source: "https://djpk.kemenkeu.go.id/portal/data/apbd",
  totalBudget: 1266675.33,
  totalRealized: 754363.82,
  rows: [
    { name: "Belanja Pegawai", budget: 506149.33, realized: 361365.08 },
    { name: "Belanja Barang dan Jasa", budget: 381466.0, realized: 215491.89 },
    { name: "Belanja Modal", budget: 156012.68, realized: 56302.1 },
    { name: "Belanja Lainnya", budget: 223047.32, realized: 121204.75 },
  ],
};
export const formatBudget = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    : "Informasi belum tersedia";
export function selectBudget(year, scope, region = "nasional", category = "") {
  if (
    year !== budgetSnapshot.year ||
    scope !== budgetSnapshot.scope ||
    region !== "nasional" ||
    !budgetSnapshot.source
  )
    return null;
  if (!category) return budgetSnapshot;
  const rows = budgetSnapshot.rows.filter((row) => row.name === category);
  if (!rows.length) return null;
  return {
    ...budgetSnapshot,
    rows,
    totalBudget: rows.reduce((sum, row) => sum + row.budget, 0),
    totalRealized: rows.every((row) => typeof row.realized === "number")
      ? rows.reduce((sum, row) => sum + row.realized, 0)
      : null,
  };
}
