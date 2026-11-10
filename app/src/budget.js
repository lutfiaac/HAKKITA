// Verified snapshots from official government publications. Values in T = trillion rupiah;
// values in M = billion rupiah. Only the period and region represented by each source are offered.
export const budgetSnapshots = {
  nasional: {
    year: "2026",
    scope: "nasional",
    name: "Anggaran Pendapatan dan Belanja Negara",
    period: "Realisasi sampai 30 September 2026",
    unit: "triliun rupiah",
    unitShort: "T",
    totalBudget: 3842.7,
    totalRealized: 2660.5,
    realizationPercent: 69.2,
    allocationBasis: "Belanja Pemerintah Pusat",
    sectors: [
      { id: "ekonomi", name: "Ekonomi", budget: 823.723184554, purpose: "Mendukung teknologi, ketahanan pangan, transportasi, energi, UMKM, dan koperasi." },
      { id: "umum", name: "Pelayanan Umum", budget: 794.381705632, purpose: "Mendukung birokrasi dan layanan publik yang berintegritas, produktif, dan profesional." },
      { id: "pendidikan", name: "Pendidikan", budget: 459.692569843, purpose: "Mendukung peningkatan kualitas sumber daya manusia yang berdaya saing." },
      { id: "pertahanan", name: "Pertahanan", budget: 337.371835237, purpose: "Mendukung kemampuan pertahanan untuk menjaga kedaulatan negara." },
      { id: "sosial", name: "Perlindungan Sosial", budget: 279.541562531, purpose: "Memberikan perlindungan bagi masyarakat miskin dan rentan dari risiko sosial." },
      { id: "keamanan", name: "Ketertiban dan Keamanan", budget: 242.574768579, purpose: "Mendukung penegakan hukum, keamanan, pemberantasan narkoba, dan penguatan siber." },
      { id: "kesehatan", name: "Kesehatan", budget: 153.100068262, purpose: "Mendukung sumber daya manusia sehat dan produktif serta transformasi sistem kesehatan." },
      { id: "perumahan", name: "Perumahan dan Fasilitas Umum", budget: 28.616530003, purpose: "Mendukung penyediaan perumahan dan kawasan permukiman." },
      { id: "agama", name: "Agama", budget: 14.407406843, purpose: "Mendukung pemahaman nilai agama dan kehidupan beragama yang moderat dan toleran." },
      { id: "lingkungan", name: "Perlindungan Lingkungan Hidup", budget: 13.358614384, purpose: "Mendukung kualitas lingkungan, keanekaragaman hayati, pengelolaan sampah, dan hutan lestari." },
      { id: "pariwisata", name: "Pariwisata", budget: 2.965144892, purpose: "Mendukung pengembangan pariwisata dan ekonomi kreatif." },
    ],
    revenue: {
      totalBudget: 3153.6,
      totalRealized: 2341.5,
      realizationPercent: 74.2,
      rows: [{ name: "Pendapatan Negara", budget: 3153.6, realized: 2341.5, percent: 74.2 }],
    },
    rows: [
      { name: "Belanja Pemerintah Pusat", budget: 3149.7, realized: 2061.3 },
      { name: "Transfer ke Daerah", budget: 693.0, realized: 599.2 },
    ],
    sourceNotes: "Realisasi dalam APBN KiTa Oktober 2026; pagu APBN 2026.",
    sources: [
      { label: "APBN KiTa Oktober 2026", url: "https://www.kemenkeu.go.id/APBNKITAOktober2026", note: "Realisasi s.d. 30 September 2026; diterbitkan 9 Oktober 2026." },
      { label: "Publikasi APBN KiTa: pagu APBN 2026", url: "https://media.kemenkeu.go.id/getmedia/3ba8d073-01bb-4d0a-96b5-1f153cbfa76c/Publikasi-Web-Konpers-APBN-Kita-%28-April-2026-%29.pdf?ext=.pdf", note: "Pagu belanja negara Rp3.842,7 triliun; BPP Rp3.149,7 triliun dan TKD Rp693,0 triliun." },
      { label: "UU 17 Tahun 2025 — rincian APBN 2026", url: "https://jdih.kemenkeu.go.id/api/download/dab7680a-86cf-484e-8328-8652280ad718/2025UU17.pdf", note: "Lampiran I memuat rincian final Belanja Pemerintah Pusat menurut fungsi." },
      { label: "Kemenkeu — arah fungsi Belanja Pemerintah Pusat 2026", url: "https://anggaran.kemenkeu.go.id/in/post/apbn-2026:-belanja-prioritas-mewujudkan-kedaulatan-pangan,-energi,-dan-ekonomi", note: "Uraian tujuan dan arah penggunaan menurut fungsi." },
    ],
  },
  "daerah:DKI Jakarta": {
    year: "2026",
    scope: "daerah",
    name: "APBD DKI Jakarta",
    region: "DKI Jakarta",
    province: "DKI Jakarta",
    regionLabel: "Tingkat provinsi — seluruh DKI Jakarta",
    period: "Realisasi sampai November 2026",
    receivedAt: "6 November 2026",
    unit: "miliar rupiah",
    unitShort: "M",
    totalBudget: 74285.30,
    totalRealized: 43931.20,
    realizationPercent: 59.14,
    allocationBasis: "Jenis belanja daerah",
    sectors: [],
    revenue: {
      totalBudget: 71450.67,
      totalRealized: 48543.79,
      realizationPercent: 67.94,
      rows: [
        { name: "Pendapatan Asli Daerah (PAD)", budget: 57670.65, realized: 43066.91, percent: 74.68 },
        { name: "Transfer ke Daerah dan Dana Desa (TKDD)", budget: 11159.48, realized: 5475.37, percent: 49.06 },
        { name: "Pendapatan lainnya", budget: 2620.55, realized: 1.51, percent: 0.06 },
      ],
    },
    rows: [
      { name: "Belanja Pegawai", budget: 21431.74, realized: 15952.76 },
      { name: "Belanja Barang dan Jasa", budget: 28998.17, realized: 17242.21 },
      { name: "Belanja Modal", budget: 10164.77, realized: 2860.39 },
      { name: "Belanja Lainnya", budget: 13690.63, realized: 7875.84 },
    ],
    sourceNotes: "Data APBD Murni/Perubahan; data diterima SIKD per 6 November 2026.",
    sources: [
      { label: "Portal Data SIKD — APBD DKI Jakarta", url: "https://djpk.kemenkeu.go.id/portal/data/apbd?pemda=--&provinsi=09&tahun=2026", note: "Data APBD Murni/Perubahan; realisasi s.d. November 2026; diterima SIKD per 6 November 2026." },
    ],
  },
};

// Kept as an alias for older in-app references; new page uses scope-specific snapshots.
export const budgetSnapshot = budgetSnapshots["daerah:DKI Jakarta"];
export const listBudgetProvinces = () => [...new Set(
  Object.values(budgetSnapshots)
    .filter((snapshot) => snapshot.scope === "daerah" && snapshot.province)
    .map((snapshot) => snapshot.province),
)].sort((a, b) => a.localeCompare(b, "id"));
export const listBudgetRegions = (province) => Object.values(budgetSnapshots)
  .filter((snapshot) => snapshot.scope === "daerah" && snapshot.province === province && snapshot.region)
  .map((snapshot) => ({ value: snapshot.region, label: snapshot.regionLabel || snapshot.region }));
export const formatBudget = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : "Informasi belum tersedia";

export function selectBudget(year, scope, region = "") {
  const key = scope === "nasional" ? "nasional" : `daerah:${region}`;
  const snapshot = budgetSnapshots[key];
  return snapshot?.year === String(year) ? snapshot : null;
}
