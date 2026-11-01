const source = "https://example.org/official-program";
export const baseDetailFixture = {
  id: "synthetic-only",
  type: "program",
  name: "Program pengujian",
  category: "pendidikan",
  summary: "Ringkasan manfaat dari sumber.",
  about: "Penjelasan tujuan program.",
  agency: "Penyelenggara pengujian",
  region: "Wilayah pengujian",
  benefits: ["Dukungan belajar"],
  requirements: ["Mengikuti ketentuan seleksi"],
  documents: ["Dokumen pendidikan"],
  steps: ["Baca pedoman penyelenggara"],
  official: source,
  sources: [{ label: "Panduan pengujian", url: source }],
};
const info = (value) => ({ status: "verified", value });
const timeline = (opensOn, closesOn) => ({
  addedOn: null,
  firstRecordedOn: "2026-01-01",
  recordingBasis: "baseline",
  contentReviewedOn: "2026-01-01",
  scheduleVerifiedOn: "2026-01-01",
  periods: [{ label: "Jalur seleksi", opensOn, closesOn, sourceUrl: source }],
});
export const detailFixtures = {
  scholarship: {
    ...baseDetailFixture,
    timeline: timeline("2026-10-01", "2026-12-01"),
    detail: {
      mechanisms: ["self_registration", "competitive_selection"],
      action: { kind: "registration" },
    },
  },
  internship: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["competitive_selection"],
      benefits: info(["Pemagangan selama tiga bulan sesuai fixture"]),
      requirements: info([
        {
          title: "Kualifikasi peserta",
          items: ["Kompetensi sesuai bidang pemagangan"],
        },
      ]),
      registration: { status: "verified", value: "unannounced" },
    },
  },
  assignment: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["recipient_assignment"],
      registration: { status: "not_applicable", value: "none" },
      action: { kind: "status" },
    },
  },
  credit: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["financing"],
      benefits: {
        status: "conditional",
        note: "Pembiayaan wajib dikembalikan; ketentuan tiap penyalur berbeda.",
        value: ["Kredit usaha"],
      },
      action: { kind: "financing" },
      access: info([
        {
          id: "bank-a",
          label: "Penyalur A",
          steps: [{ title: "Konsultasi penyalur A", mode: "offline" }],
        },
        {
          id: "bank-b",
          label: "Penyalur B",
          steps: [{ title: "Periksa portal penyalur B", mode: "online" }],
        },
      ]),
    },
  },
  housing: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["financing", "subsidy"],
      notices: [
        { status: "conditional", text: "Kewajiban angsuran tetap berlaku." },
      ],
    },
  },
  assessment: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["assessment_referral", "service_delivery"],
      documents: {
        status: "unknown",
        note: "Daftar dokumen perlu dikonfirmasi melalui penyelenggara program.",
      },
      registration: { status: "not_applicable" },
      action: { kind: "guide" },
    },
  },
  training: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["self_registration", "training"],
      benefits: info([
        "Pelatihan keterampilan",
        "Sertifikat sesuai ketentuan fixture",
      ]),
      benefitValues: info([
        {
          label: "Durasi pelatihan",
          kind: "service",
          condition: "Enam minggu sesuai jadwal fixture.",
        },
      ]),
    },
  },
  sparse: {
    id: "sparse-fixture",
    type: "program",
    name: "Data minim",
    category: "pendidikan",
    detail: { mechanisms: ["unknown"] },
  },
  multiRoute: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["hybrid", "self_registration", "service_delivery"],
      documents: info([
        { id: "identity", name: "Identitas", requirement: "required" },
        { id: "support", name: "Bukti pendukung", requirement: "optional" },
        {
          id: "regional",
          name: "Dokumen daerah",
          requirement: "conditional",
          condition: "Jika melalui jalur daerah",
          region: "Daerah fixture",
          route: "Kunjungan",
        },
        {
          id: "alternative",
          name: "Bukti studi",
          requirement: "alternative",
          alternatives: ["Ijazah", "Surat kelulusan"],
        },
      ]),
      access: info([
        {
          id: "online",
          label: "Pengajuan online",
          steps: [
            { title: "Isi pengajuan", mode: "online", url: source },
            {
              title: "Verifikasi dokumen",
              mode: "mixed",
              condition: "Jika diminta penyelenggara",
            },
          ],
        },
        {
          id: "offline",
          label: "Kunjungan",
          region: "Daerah fixture",
          steps: [{ title: "Konsultasi langsung", mode: "offline" }],
        },
      ]),
    },
  },
  closed: {
    ...baseDetailFixture,
    timeline: timeline("2026-01-01", "2026-02-01"),
    detail: {
      mechanisms: ["self_registration"],
      action: { kind: "registration" },
    },
  },
  conflicting: {
    ...baseDetailFixture,
    detail: {
      mechanisms: ["unknown"],
      requirements: {
        status: "conflicting",
        value: [
          {
            title: "Tidak boleh jadi fakta",
            items: ["Syarat yang belum dapat dipastikan"],
          },
        ],
        note: "Dua sumber memberikan ketentuan berbeda.",
      },
      action: { kind: "registration", status: "conflicting" },
      sources: [
        {
          id: "source-1",
          title: "Sumber A",
          url: source,
          status: "conflicting",
        },
        {
          id: "source-2",
          title: "Sumber B",
          url: "https://example.org/other",
          status: "conflicting",
        },
      ],
    },
  },
  informationOnly: {
    ...baseDetailFixture,
    detail: { mechanisms: ["unknown"], action: { kind: "information" } },
  },
};
