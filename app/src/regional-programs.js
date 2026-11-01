export const regionalPrograms = [
  {
    id: "berau-cerdas",
    type: "program",
    name: "Beasiswa Berau Cerdas",
    category: "pendidikan",
    icon: "GraduationCap",
    agency: "Bagian Kesra Setda Kabupaten Berau",
    region: "Kabupaten Berau, Kalimantan Timur",
    summary:
      "Bantuan pendidikan bagi pelajar dan mahasiswa Kabupaten Berau sesuai ketentuan seleksi daerah.",
    about:
      "Program beasiswa Pemerintah Kabupaten Berau untuk mendukung pendidikan masyarakat Berau. Jenjang dan jalur penerimaan mengikuti pengumuman resmi.",
    benefits: [
      "Dukungan biaya pendidikan sesuai jalur dan penetapan penerima.",
    ],
    requirements: [
      "Memenuhi ketentuan kependudukan Kabupaten Berau dan jenjang pendidikan pada pedoman periode yang dipilih.",
      "Memenuhi persyaratan seleksi pada pengumuman resmi.",
    ],
    documents: ["Periksa daftar dokumen pada pedoman resmi periode berjalan."],
    steps: [
      "Baca pedoman dan pengumuman pada portal Beasiswa Berau.",
      "Jika pendaftaran dibuka, ikuti alur pada portal resmi.",
      "Periksa hasil seleksi melalui kanal resmi.",
    ],
    note: "Jadwal pendaftaran terkini belum terverifikasi. Jangan menggunakan jadwal tahun sebelumnya sebagai jadwal penerimaan baru.",
    official: "https://beasiswa.beraukab.go.id/beranda",
    sources: [
      {
        label: "Portal resmi Beasiswa Berau",
        url: "https://beasiswa.beraukab.go.id/beranda",
      },
    ],
    related: ["kip-kuliah", "pip"],
    lastVerifiedAt: "1 November 2026",
  },
  {
    id: "kaltim-tuntas",
    type: "program",
    name: "Beasiswa Kaltim Tuntas",
    category: "pendidikan",
    icon: "GraduationCap",
    agency: "Pemerintah Provinsi Kalimantan Timur",
    region: "Kalimantan Timur",
    summary:
      "Informasi beasiswa Kalimantan Timur dan tindak lanjut bagi penerima lama; bukan pengumuman pendaftaran baru.",
    about:
      "Portal resmi saat ini memuat Monitoring dan Evaluasi (MONEV) bagi penerima tahun 2023 dan 2024 untuk pencairan dana tahun 2026.",
    benefits: [
      "Tindak lanjut bantuan pendidikan bagi penerima yang telah ditetapkan, sesuai ketentuan penyelenggara.",
    ],
    requirements: [
      "Pengumuman MONEV ditujukan kepada penerima tahun 2023 dan 2024.",
      "Periksa kewajiban pelaporan dan ketentuan pencairan pada portal resmi.",
    ],
    documents: [
      "Transkrip nilai dan KHS sesuai pengumuman MONEV; dokumen kelulusan jika relevan.",
    ],
    steps: [
      "Baca pengumuman MONEV pada portal resmi.",
      "Penerima lama mengikuti jadwal pelaporan yang diumumkan.",
      "Calon pendaftar baru memeriksa kebijakan pendidikan terbaru melalui kanal Pemprov Kaltim.",
    ],
    note: "Pergub 16 Tahun 2020 telah dicabut oleh Pergub 24 Tahun 2025. Informasi ini tidak menyatakan pendaftaran baru Kaltim Tuntas sedang dibuka.",
    official: "https://beasiswa.kaltimprov.go.id/",
    sources: [
      {
        label: "Pengumuman MONEV Beasiswa Kaltim",
        url: "https://beasiswa.kaltimprov.go.id/",
      },
      {
        label: "JDIH Kaltim: status Pergub 16 Tahun 2020",
        url: "https://jdih.kaltimprov.go.id/dokumen/program-beasiswa-kaltim-tuntas",
      },
    ],
    related: ["berau-cerdas", "kip-kuliah"],
    lastVerifiedAt: "1 November 2026",
  },
];
