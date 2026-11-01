import { programCategories, serviceCategories } from "./taxonomy.ts";
import { programMetadata, serviceMetadata } from "./metadata.ts";
import { additionalItems } from "./additional-data.js";
import { regionalPrograms } from "./regional-programs.js";
import { evaluateRules } from "./recommendations.ts";
import { programTimelines, registrationStatus } from "./program-timeline.js";
export { programCategories, serviceCategories };
export const VERIFIED = "31 Oktober 2026";
export const categories = [...programCategories, ...serviceCategories];
const baseCatalog = [
  {
    id: "kip-kuliah",
    type: "program",
    name: "KIP Kuliah",
    category: "pendidikan",
    icon: "GraduationCap",
    agency: "Kementerian Pendidikan Tinggi, Sains, dan Teknologi",
    region: "Nasional",
    summary:
      "Dukungan biaya kuliah bagi calon mahasiswa berpotensi akademik dengan keterbatasan ekonomi.",
    about:
      "KIP Kuliah mendukung akses pendidikan tinggi. Penerima ditetapkan setelah verifikasi oleh perguruan tinggi dan kementerian.",
    benefits: [
      "Bantuan biaya pendidikan dan biaya hidup sesuai ketentuan program.",
    ],
    requirements: [
      "Lulusan SMA/sederajat tahun 2026, 2025, atau 2024 untuk penerimaan 2026.",
      "Memiliki potensi akademik dan diterima di perguruan tinggi serta program studi yang memenuhi ketentuan.",
      "Keterbatasan ekonomi dibuktikan dengan KIP, DTSEN maksimal desil 4, atau berasal dari panti sosial/asuhan. Jalur lain: pendapatan kotor gabungan orang tua/wali di bawah UMP domisili asal disertai SKTM.",
    ],
    documents: [
      "NIK, NISN, NPSN, dan email aktif",
      "Bukti kondisi ekonomi sesuai jalur persyaratan",
    ],
    steps: [
      "Periksa panduan penerimaan 2026.",
      "Buat atau perbarui akun pada portal KIP Kuliah.",
      "Lengkapi data dan ikuti seleksi masuk perguruan tinggi.",
      "Ikuti verifikasi setelah diterima dan registrasi ulang.",
    ],
    note: "Belum tahu desilmu? Periksa data melalui kanal resmi Kemensos atau tanyakan kepada dinas sosial setempat. Hakkita tidak menetapkan desil.",
    official: "https://kip-kuliah.kemdiktisaintek.go.id/",
    sources: [
      {
        label: "Panduan dan persyaratan KIP Kuliah 2026",
        url: "https://kip-kuliah.kemdiktisaintek.go.id/panduan",
      },
    ],
    match: { need: "kuliah" },
    related: ["pip", "ktp-el"],
  },
  {
    id: "pip",
    type: "program",
    name: "Program Indonesia Pintar (PIP)",
    category: "pendidikan",
    icon: "Books",
    agency: "Puslapdik, Kementerian Pendidikan Dasar dan Menengah",
    region: "Nasional",
    summary:
      "Bantuan pendidikan untuk peserta didik dari keluarga miskin atau rentan miskin.",
    about:
      "PIP membantu peserta didik menyelesaikan pendidikan menengah melalui jalur formal, pendidikan khusus, dan pendidikan kesetaraan.",
    benefits: [
      "Meringankan biaya personal pendidikan serta membantu mencegah putus sekolah.",
    ],
    requirements: [
      "Peserta didik pemegang KIP atau berasal dari keluarga miskin/rentan miskin.",
      "Pertimbangan khusus mencakup antara lain keluarga peserta PKH/KKS, anak yatim/piatu, serta peserta didik terdampak bencana.",
    ],
    documents: ["NISN dan NIK untuk memeriksa penerima pada SIPINTAR"],
    steps: [
      "Periksa informasi penerima melalui SIPINTAR.",
      "Koordinasikan data pendidikan dan tindak lanjut pengusulan dengan sekolah.",
    ],
    note: "Kepemilikan dokumen tidak otomatis menetapkan seseorang sebagai penerima. Periksa hasil penetapan melalui SIPINTAR.",
    official: "https://pip.kemendikdasmen.go.id/home_v1",
    sources: [
      {
        label: "SIPINTAR — informasi dan sasaran PIP",
        url: "https://pip.kemendikdasmen.go.id/home_v1",
      },
    ],
    match: { need: "sekolah" },
    related: ["kip-kuliah"],
  },
  {
    id: "pelatihan-vokasi",
    type: "program",
    name: "Pelatihan Vokasi Nasional",
    category: "pekerjaan",
    icon: "Briefcase",
    agency: "Kementerian Ketenagakerjaan",
    region: "Nasional; lokasi sesuai pelatihan",
    summary:
      "Pelatihan keterampilan melalui Skillhub untuk mempersiapkan diri memasuki dunia kerja.",
    about:
      "Pelatihan vokasi pemerintah melalui platform Skillhub, dengan pilihan kejuruan dan mekanisme seleksi sesuai penyelenggara.",
    benefits: [
      "Pelatihan tanpa biaya dan sertifikat pelatihan.",
      "Sertifikasi kompetensi untuk peserta yang lulus sesuai ketentuan.",
    ],
    requirements: [
      "Warga Negara Indonesia berusia minimal 17 tahun.",
      "Lulusan SMA/SMK/MA atau sederajat dan memiliki akun SIAPkerja.",
      "Memenuhi kualifikasi dan seleksi pelatihan yang dipilih.",
    ],
    documents: [
      "NIK, email, nomor telepon, dan data pendidikan",
      "Data rekening serta kompetensi sesuai permintaan pelatihan",
    ],
    steps: [
      "Buat akun SIAPkerja dan lengkapi profil.",
      "Pilih pelatihan di Skillhub dan periksa jadwal batch.",
      "Ikuti asesmen dan proses seleksi.",
      "Periksa pengumuman dan daftar ulang jika diterima.",
    ],
    note: "Pendaftaran mengikuti batch. Periksa jadwal dan ketersediaan pelatihan langsung di Skillhub.",
    official: "https://skillhub.kemnaker.go.id/",
    sources: [
      {
        label: "Skillhub — Pelatihan Vokasi Nasional dan FAQ",
        url: "https://skillhub.kemnaker.go.id/",
      },
    ],
    match: { need: "kerja" },
    related: ["kur"],
  },
  {
    id: "kur",
    type: "program",
    name: "Kredit Usaha Rakyat (KUR)",
    category: "usaha",
    icon: "Storefront",
    agency: "Kemenko Perekonomian; penyaluran melalui lembaga keuangan",
    region: "Nasional; panduan penyalur Bank Mandiri",
    summary:
      "Pembiayaan modal kerja atau investasi untuk usaha produktif. KUR merupakan kredit, bukan bantuan tunai gratis.",
    about:
      "KUR memperluas akses pembiayaan UMKM. Panduan berikut merujuk ketentuan Bank Mandiri; penyalur lain dapat memiliki rincian berbeda.",
    benefits: [
      "Akses kredit untuk modal kerja atau investasi usaha yang layak.",
    ],
    requirements: [
      "Memiliki usaha produktif dan layak. Persyaratan umum Mandiri mencantumkan usaha berjalan minimal 6 bulan; ketentuan khusus mengikuti jenis KUR.",
      "Memiliki NIB atau surat keterangan usaha dan identitas kependudukan.",
      "Kelayakan kredit dan riwayat pembiayaan diperiksa oleh bank.",
    ],
    documents: [
      "e-KTP, NIB atau surat keterangan usaha",
      "NPWP untuk pinjaman di atas Rp50 juta sesuai panduan penyalur",
    ],
    steps: [
      "Tentukan kebutuhan pembiayaan dan kemampuan mengangsur.",
      "Periksa jenis KUR dan persyaratan pada penyalur.",
      "Ajukan dokumen melalui kanal resmi Bank Mandiri.",
      "Ikuti penilaian usaha dan keputusan kredit oleh bank.",
    ],
    note: "Bunga, angsuran, agunan, dan persetujuan mengikuti ketentuan penyalur serta jenis pembiayaan.",
    official: "https://www.bankmandiri.co.id/kredit-usaha-rakyat-kur",
    sources: [
      {
        label: "Bank Mandiri — ketentuan KUR",
        url: "https://www.bankmandiri.co.id/kredit-usaha-rakyat-kur",
      },
    ],
    match: { need: "usaha" },
    related: ["pelatihan-vokasi", "ktp-el"],
  },
  {
    id: "ktp-el",
    type: "layanan",
    name: "Pengurusan KTP-el",
    category: "kependudukan",
    icon: "IdentificationCard",
    agency: "Dinas Dukcapil Provinsi DKI Jakarta",
    region: "DKI Jakarta",
    summary:
      "Panduan penerbitan KTP-el baru dan penggantian kartu untuk penduduk DKI Jakarta.",
    about:
      "KTP-el adalah identitas resmi penduduk. Panduan ini mengikuti layanan Dukcapil DKI Jakarta.",
    fee: "Gratis",
    channel:
      "Service Poin Dukcapil Kelurahan; kanal online Alpukat Betawi sesuai jenis layanan.",
    variants: [
      {
        id: "baru",
        name: "KTP-el baru",
        requirements: [
          "Penduduk DKI Jakarta berusia 17 tahun atau telah menikah.",
        ],
        documents: [
          "Fotokopi KK untuk pemula usia 17 tahun",
          "KK asli dan fotokopi surat nikah/akta perkawinan untuk pemula di bawah 17 tahun yang sudah menikah",
        ],
        steps: [
          "Siapkan dokumen sesuai kondisi pemohon.",
          "Ajukan melalui layanan Dukcapil kelurahan dan ikuti arahan petugas.",
        ],
      },
      {
        id: "hilang",
        name: "Hilang",
        requirements: ["KTP-el hilang."],
        documents: [
          "Surat keterangan kehilangan dari kepolisian",
          "Fotokopi KK",
        ],
        steps: [
          "Lengkapi surat kehilangan dan dokumen.",
          "Ajukan penggantian melalui kanal Dukcapil DKI Jakarta.",
        ],
      },
      {
        id: "rusak",
        name: "Rusak",
        requirements: ["KTP-el rusak."],
        documents: ["KTP-el yang rusak", "Fotokopi KK"],
        steps: [
          "Bawa kartu rusak dan dokumen.",
          "Ajukan penggantian melalui kanal Dukcapil DKI Jakarta.",
        ],
      },
      {
        id: "perubahan-data",
        name: "Perubahan data",
        requirements: ["Perubahan biodata penduduk yang didukung dokumen sah."],
        documents: [
          "KK dan KTP asli",
          "Dokumen pendukung perubahan biodata sesuai jenis perubahan",
        ],
        steps: [
          "Siapkan dokumen perubahan yang sesuai.",
          "Ajukan melalui layanan Dukcapil DKI Jakarta untuk verifikasi dan pembaruan.",
        ],
      },
    ],
    note: "Di luar DKI Jakarta, periksa kanal dan prosedur Dukcapil kabupaten/kota domisilimu.",
    official:
      "https://kependudukancapil.jakarta.go.id/kartu-tanda-penduduk-elektronik-e-ktp/1000/",
    sources: [
      {
        label: "Dukcapil DKI Jakarta — KTP elektronik",
        url: "https://kependudukancapil.jakarta.go.id/kartu-tanda-penduduk-elektronik-e-ktp/1000/",
      },
    ],
    related: ["paspor", "mobile-jkn"],
  },
  {
    id: "perpanjangan-sim",
    type: "layanan",
    name: "Perpanjangan SIM",
    category: "mobilitas",
    icon: "SteeringWheel",
    agency: "Korps Lalu Lintas POLRI",
    region: "Nasional; mengikuti ketersediaan SATPAS",
    summary:
      "Perpanjang SIM A atau SIM C melalui layanan SINAR di aplikasi Digital Korlantas POLRI.",
    about:
      "Layanan perpanjangan SIM secara online dengan verifikasi oleh SATPAS.",
    requirements: [
      "SIM masih berlaku. SIM yang sudah kedaluwarsa tidak dapat diperpanjang melalui aplikasi.",
      "Lengkapi pemeriksaan kesehatan jasmani dan psikologi.",
    ],
    documents: [
      "Foto e-KTP dan SIM",
      "Foto tanda tangan dengan tinta hitam pada kertas putih",
      "Pasfoto terbaru berlatar biru sesuai format pada panduan",
    ],
    steps: [
      "Unduh Digital Korlantas dan verifikasi identitas.",
      "Pilih SIM, lalu Perpanjangan SIM; lengkapi dokumen.",
      "Lakukan pembayaran dan tunggu verifikasi SATPAS.",
      "Pilih pengambilan atau pengiriman sesuai kanal yang tersedia.",
    ],
    channel: "Aplikasi Digital Korlantas POLRI / SINAR.",
    note: "Biaya akhir mencakup komponen sesuai layanan yang dipilih. Periksa rincian sebelum membayar di aplikasi resmi.",
    official: "https://digitalkorlantas.polri.go.id/sim/",
    sources: [
      {
        label: "Digital Korlantas — SINAR dan panduan SIM",
        url: "https://digitalkorlantas.polri.go.id/sim/",
      },
    ],
    related: ["ktp-el", "paspor"],
  },
  {
    id: "paspor",
    type: "layanan",
    name: "Pembuatan Paspor",
    category: "mobilitas",
    icon: "AirplaneTilt",
    agency: "Direktorat Jenderal Imigrasi",
    region: "WNI; panduan Kantor Imigrasi Jakarta Pusat",
    summary:
      "Persiapkan dokumen dan tahapan permohonan paspor baru untuk WNI dewasa.",
    about:
      "Panduan permohonan paspor baru. Untuk paspor anak, penggantian, atau kehilangan, periksa panduan khusus pada instansi terkait.",
    requirements: [
      "Warga Negara Indonesia yang mengajukan paspor baru.",
      "Data nama, tempat/tanggal lahir, dan nama orang tua pada dokumen pendukung harus lengkap.",
    ],
    documents: [
      "KTP yang berlaku dan Kartu Keluarga",
      "Akta kelahiran, akta perkawinan/buku nikah, ijazah, atau surat baptis",
      "Dokumen pewarganegaraan atau penetapan ganti nama jika relevan",
    ],
    steps: [
      "Daftar melalui M-Paspor dan ikuti petunjuk permohonan.",
      "Lengkapi pemeriksaan dokumen dan pembayaran.",
      "Hadir untuk pengambilan foto, sidik jari, dan wawancara.",
      "Tunggu verifikasi dan penerbitan oleh Imigrasi.",
    ],
    fee: "Paspor elektronik 5 tahun: Rp650.000; 10 tahun: Rp950.000. Percepatan dikenai biaya tambahan sesuai panduan.",
    channel: "M-Paspor dan kantor imigrasi yang dipilih.",
    official:
      "https://jakartapusat.imigrasi.go.id/layanan/warga-negara-indonesia-wni/paspor-baru",
    sources: [
      {
        label: "Imigrasi Jakarta Pusat — paspor baru",
        url: "https://jakartapusat.imigrasi.go.id/layanan/warga-negara-indonesia-wni/paspor-baru",
      },
    ],
    related: ["ktp-el", "perpanjangan-sim"],
  },
  {
    id: "mobile-jkn",
    type: "layanan",
    name: "Pendaftaran Peserta JKN",
    category: "kesehatan",
    icon: "Heartbeat",
    agency: "BPJS Kesehatan",
    region: "Nasional",
    summary:
      "Panduan mendaftar kepesertaan Jaminan Kesehatan Nasional melalui Mobile JKN.",
    about:
      "Mobile JKN menyediakan pendaftaran peserta baru. Membuat akun aplikasi dan mendaftarkan kepesertaan merupakan dua proses yang berbeda.",
    requirements: [
      "Data kependudukan dapat diverifikasi melalui nomor KK.",
      "Email dan nomor telepon aktif untuk verifikasi.",
    ],
    documents: [
      "Nomor Kartu Keluarga dan data anggota keluarga",
      "Email dan nomor telepon aktif",
    ],
    steps: [
      "Pilih Pendaftaran Peserta Baru pada Mobile JKN.",
      "Baca ketentuan, masukkan KK, dan lengkapi data peserta.",
      "Ikuti pilihan kepesertaan yang tersedia lalu verifikasi kontak.",
      "Periksa persetujuan dan informasi pembayaran pada kanal resmi.",
    ],
    channel: "Aplikasi Mobile JKN.",
    note: "Panduan ini untuk pendaftaran peserta, bukan penetapan penerima bantuan iuran. Periksa status dan kewajiban iuran pada BPJS Kesehatan.",
    official:
      "https://bpjs-kesehatan.go.id/user-manual-mobile-jkn/administrasi%20JKN.html",
    sources: [
      {
        label: "BPJS Kesehatan — administrasi kepesertaan JKN",
        url: "https://bpjs-kesehatan.go.id/user-manual-mobile-jkn/administrasi%20JKN.html",
      },
    ],
    related: ["ktp-el"],
  },
];
export const catalog = [
  ...baseCatalog,
  ...additionalItems,
  ...regionalPrograms,
].map((item) => {
  const metadata =
    item.type === "program"
      ? programMetadata[item.id]
      : serviceMetadata[item.id];
  return {
    ...item,
    ...metadata,
    category: metadata.primaryCategory,
    slug: item.id,
    description: item.summary,
    organizer: item.agency,
    ...(item.type === "program"
      ? { timeline: programTimelines[item.id] || null }
      : {}),
    officialUrl: item.official,
    sourceReferences: item.sources,
    lastVerifiedAt: item.lastVerifiedAt || VERIFIED,
    requiredDocuments: item.documents || [],
    applicationSteps: item.steps || [],
    relatedServices: item.related.filter(
      (id) =>
        [...baseCatalog, ...additionalItems, ...regionalPrograms].find(
          (x) => x.id === id,
        )?.type === "layanan",
    ),
    secondaryCategories: metadata.secondaryCategories || [],
    aliases: metadata.aliases || [],
    enrollmentPeriod: null,
    fundingRelationship: null,
    processingTime: null,
  };
});
export const programs = catalog.filter((item) => item.type === "program");
export const services = catalog.filter((item) => item.type === "layanan");
export const findItem = (id) => catalog.find((item) => item.id === id);
export const categoryName = (id) =>
  categories.find((c) => c.id === id)?.name || id;
export function filterCatalog({
  query = "",
  category = "",
  type = "",
  region = "",
  city = "",
  targets = [],
  benefit = "",
  level = "",
  education = "",
  activity = "",
  channel = "",
  verifiedPeriod = false,
  periodStatus = "",
} = {}) {
  const terms = query
    .toLocaleLowerCase("id")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return catalog.filter((item) => {
    const coverage = item.regionCoverage;
    const inRegion =
      !region ||
      (region === "nasional"
        ? coverage?.level === "national"
        : coverage?.level === "national" ||
          coverage?.provinces?.includes(
            region === "jakarta" ? "DKI Jakarta" : region,
          ));
    const haystack = [
      item.name,
      item.summary,
      item.agency,
      categoryName(item.category),
      item.id,
      ...item.aliases,
      ...(item.variants || []).map((v) => v.name + " " + v.id),
    ]
      .join(" ")
      .toLocaleLowerCase("id");
    return (
      (!type || item.type === type) &&
      (!category ||
        item.category === category ||
        item.secondaryCategories.includes(category)) &&
      inRegion &&
      (!city ||
        Boolean(
          region &&
          region !== "nasional" &&
          (coverage?.level === "national" ||
            (coverage?.provinces?.includes(region) &&
              (coverage.level === "province" ||
                coverage.cities?.includes(city)))),
        )) &&
      (!targets.length ||
        item.targetGroups?.includes("umum") ||
        targets.some((t) => item.targetGroups?.includes(t))) &&
      (!(Array.isArray(benefit) ? benefit.length : benefit) ||
        (Array.isArray(benefit) ? benefit : [benefit]).some((value) =>
          (item.benefitTypes || [item.benefitType]).includes(value),
        )) &&
      (!level || item.governmentLevel === level) &&
      (!education || item.educationLevels?.includes(education)) &&
      (!activity || item.employmentStatuses?.includes(activity)) &&
      (!channel || item.serviceChannels?.includes(channel)) &&
      (!verifiedPeriod || Boolean(item.enrollmentPeriod)) &&
      (!periodStatus || registrationStatus(item) === periodStatus) &&
      terms.every((term) => haystack.includes(term))
    );
  });
}
export function resultUrl(item, query = "") {
  const q = query.toLowerCase();
  const variant = item.variants?.find(
    (v) => q.includes(v.id) || q.includes(v.name.toLowerCase()),
  );
  return `/${item.type}/${item.id}${variant ? `/${variant.id}` : ""}`;
}
export function matchPrograms(answers) {
  return programs
    .filter(
      (item) => item.match && answers.need && item.match.need === answers.need,
    )
    .map((item) => {
      const rules = evaluateRules(item.eligibilityRules, answers);
      const issues = rules
        .filter((rule) => rule.state === "not-met")
        .map((rule) =>
          rule.id === "year"
            ? `Tahun kelulusan tidak sesuai: ${rule.label}`
            : `Belum sesuai: ${rule.label}`,
        );
      const checks = rules
        .filter((rule) => rule.state === "unknown")
        .map((rule) =>
          rule.id === "year"
            ? `Periksa tahun kelulusan: ${rule.label}`
            : `Perlu diperiksa: ${rule.label}`,
        );
      return {
        item,
        issues,
        checks,
        status: issues.length
          ? "Belum Sesuai dengan Kondisi"
          : checks.length
            ? "Perlu Periksa Persyaratan"
            : "Berpotensi Relevan",
      };
    });
}
