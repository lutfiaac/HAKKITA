import type { ProgramDetailConfig } from "./program-detail-model";

// Editorial configuration refines existing sourced records; it never changes
// catalog filters, checklist indices, or published enrollment periods.
export const programDetailConfigs: Record<string, ProgramDetailConfig> = {
  "kip-kuliah": {
    metadata: [
      { label: "Pendidikan", value: "Pendidikan tinggi" },
      {
        label: "Bentuk bantuan",
        value: "Biaya pendidikan dan biaya hidup sesuai ketentuan",
      },
    ],
    mechanisms: ["self_registration", "competitive_selection"],
    targets: {
      status: "verified",
      value: [
        "Calon mahasiswa berpotensi akademik dengan keterbatasan ekonomi.",
      ],
    },
    action: {
      kind: "registration",
      heading: "Periksa jalur penerimaanmu",
      description:
        "Jadwal berbeda menurut jalur seleksi. Pendaftaran dan verifikasi dilakukan melalui kanal resmi.",
    },
    relatedGuides: [],
  },
  pip: {
    mechanisms: ["recipient_assignment"],
    targets: {
      status: "verified",
      value: [
        "Peserta didik pemegang KIP atau dari keluarga miskin/rentan miskin.",
      ],
    },
    registration: { status: "not_applicable", value: "none" },
    action: {
      kind: "status",
      heading: "Periksa informasi penerima",
      description:
        "Penerima ditetapkan melalui proses program. Koordinasikan data dan pengusulan dengan sekolah; HAKKITA tidak menyediakan formulir pendaftaran PIP.",
    },
    relatedGuides: [],
  },
  "pelatihan-vokasi": {
    mechanisms: ["self_registration", "competitive_selection", "training"],
    targets: {
      status: "verified",
      value: [
        "WNI usia minimal 17 tahun, lulusan SMA/SMK/MA atau sederajat yang memenuhi kualifikasi pelatihan.",
      ],
    },
    action: {
      kind: "information",
      heading: "Temukan pelatihan di Skillhub",
      description:
        "Pilihan kejuruan, lokasi, dan jadwal mengikuti batch penyelenggara. Periksa ketentuan sebelum mendaftar.",
    },
  },
  kur: {
    metadata: [
      { label: "Bentuk dukungan", value: "Pembiayaan kredit usaha" },
      {
        label: "Jalur pengajuan",
        value: "Bank penyalur; rujukan panduan Bank Mandiri",
      },
    ],
    mechanisms: ["financing"],
    targets: {
      status: "verified",
      value: [
        "Pelaku usaha produktif dan layak yang memenuhi ketentuan penyalur KUR.",
      ],
    },
    action: {
      kind: "financing",
      heading: "Pelajari pengajuan pembiayaan",
      description:
        "Panduan yang dirujuk berasal dari Bank Mandiri. Kelayakan usaha dan keputusan kredit dinilai oleh penyalur.",
    },
    notices: [
      {
        status: "conditional",
        text: "KUR merupakan kredit dengan kewajiban pengembalian. Bunga, angsuran, agunan, dan persetujuan mengikuti jenis KUR serta penyalur.",
      },
    ],
    documents: {
      status: "conditional",
      note: "Daftar berikut mengikuti panduan penyalur yang dirujuk.",
      value: [
        { id: "identity", name: "e-KTP", requirement: "confirm" },
        {
          id: "business",
          name: "Bukti usaha",
          requirement: "alternative",
          alternatives: ["NIB", "Surat keterangan usaha"],
          condition: "Ikuti pilihan dokumen yang diterima penyalur.",
        },
        {
          id: "tax",
          name: "NPWP",
          requirement: "conditional",
          condition:
            "Untuk pinjaman di atas Rp50 juta sesuai panduan penyalur.",
        },
      ],
    },
    relatedGuides: [
      {
        id: "npwp",
        reason:
          "Panduan NPWP jika dipersyaratkan berdasarkan nilai pinjaman dan ketentuan penyalur.",
      },
      {
        id: "nib",
        reason:
          "Panduan NIB sebagai salah satu alternatif bukti usaha yang disebut pada persyaratan.",
      },
    ],
  },
  flpp: {
    mechanisms: ["financing", "subsidy"],
    targets: {
      status: "verified",
      value: [
        "Masyarakat berpenghasilan rendah yang memenuhi ketentuan kepemilikan rumah dan pembiayaan.",
      ],
    },
    action: {
      kind: "guide",
      heading: "Pelajari KPR bersubsidi",
      description:
        "Periksa persyaratan BP Tapera dan bank penyalur sebelum mengajukan KPR.",
    },
    notices: [
      {
        status: "conditional",
        text: "FLPP menggabungkan subsidi dan pembiayaan KPR dengan kewajiban angsuran. Rumah tidak diberikan gratis; batas penghasilan mengikuti zona dan kondisi pemohon.",
      },
    ],
    relatedGuides: [
      {
        id: "npwp",
        reason: "NPWP tercantum pada daftar dokumen pengajuan KPR FLPP.",
      },
    ],
  },
  atensi: {
    metadata: [
      {
        label: "Bentuk layanan",
        value: "Rehabilitasi sosial sesuai kebutuhan",
      },
      { label: "Mekanisme akses", value: "Konsultasi, asesmen, dan rujukan" },
    ],
    mechanisms: ["assessment_referral", "service_delivery"],
    overview:
      "Program dukungan rehabilitasi sosial yang bentuk layanannya disesuaikan dengan kebutuhan dan hasil asesmen.",
    benefits: {
      status: "conditional",
      note: "Jenis dukungan ditentukan melalui asesmen; tidak seluruh bentuk layanan diberikan kepada setiap penerima.",
      value: [
        "Dukungan pemenuhan hidup layak dan perawatan sosial.",
        "Terapi, keterampilan, dan dukungan aksesibilitas sesuai kebutuhan.",
      ],
    },
    targets: {
      status: "conditional",
      value: [
        "Orang yang membutuhkan rehabilitasi sosial berdasarkan asesmen penyelenggara.",
      ],
      note: "Kelompok sasaran dan cakupan layanan perlu dikonfirmasi kepada unit pelaksana.",
    },
    requirements: {
      status: "conditional",
      value: [
        {
          title: "Ketentuan asesmen",
          items: [
            "Kebutuhan calon penerima dinilai oleh penyelenggara.",
            "Bentuk dukungan dan tindak lanjut mengikuti hasil asesmen serta ketentuan unit layanan.",
          ],
        },
      ],
    },
    documents: {
      status: "unknown",
      note: "Daftar dokumen perlu dikonfirmasi melalui penyelenggara program. Kebutuhan dapat berbeda menurut unit layanan dan hasil asesmen.",
    },
    registration: { status: "not_applicable", value: "none" },
    action: {
      kind: "guide",
      heading: "Pahami jalur layanan ATENSI",
      description:
        "Baca pedoman resmi, lalu konfirmasikan konsultasi, rujukan, dan asesmen kepada dinas sosial atau unit rehabilitasi sosial. Tautan ini menuju pedoman PDF, bukan formulir pendaftaran.",
    },
    relatedGuides: [],
  },
  "berau-cerdas": {
    mechanisms: ["self_registration", "competitive_selection"],
    targets: {
      status: "conditional",
      value: [
        "Pelajar dan mahasiswa Kabupaten Berau sesuai jenjang dan jalur penerimaan pada pedoman resmi.",
      ],
    },
    documents: {
      status: "unknown",
      note: "Daftar dokumen perlu dikonfirmasi melalui pedoman resmi periode yang dipilih.",
    },
    action: {
      kind: "information",
      heading: "Periksa pengumuman Beasiswa Berau",
      description:
        "Pastikan periode dan pedoman yang kamu baca berlaku untuk penerimaan yang dituju.",
    },
    notices: [
      {
        status: "conflicting",
        text: "Tampilan portal dan hasil indeks sumber dapat memuat periode berbeda. Jadwal penerimaan terkini belum dapat dipastikan; periksa pengumuman penyelenggara.",
      },
    ],
  },
  "kaltim-tuntas": {
    mechanisms: ["unknown"],
    lifecycle: {
      status: "outdated",
      value: "legacy",
      note: "Informasi ini ditujukan untuk tindak lanjut penerima lama. Dasar Pergub 16 Tahun 2020 telah dicabut oleh Pergub 24 Tahun 2025; jangan menganggap pendaftaran baru sedang dibuka.",
    },
    targets: {
      status: "verified",
      value: [
        "Penerima tahun 2023 dan 2024 yang mengikuti ketentuan MONEV pada portal resmi.",
      ],
    },
    registration: { status: "not_applicable", value: "none" },
    action: {
      kind: "information",
      heading: "Informasi untuk penerima lama",
      description:
        "Periksa kewajiban MONEV dan pengumuman penyelenggara. Ini bukan jalur pendaftaran penerima baru.",
    },
    relatedGuides: [],
  },
};
