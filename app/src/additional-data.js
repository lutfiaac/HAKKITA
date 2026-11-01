const ossGuide =
  "https://s3.oss.go.id/oss/cms/%28z%29-2025_Perizinan-Berusaha-UMK-Risiko-Rendah-dan-Menengah-Rendah---Orang-Perseorangan-9a47a94cdbba5065cde976891a2c90f5.pdf";
export const additionalItems = [
  {
    id: "flpp",
    type: "program",
    name: "KPR Sejahtera FLPP",
    category: "perumahan",
    icon: "House",
    agency: "BP Tapera dan bank penyalur",
    region: "Nasional; ketentuan penghasilan mengikuti zona",
    summary:
      "Pembiayaan rumah bersubsidi bagi masyarakat berpenghasilan rendah. Merupakan KPR dengan kewajiban angsuran.",
    about:
      "FLPP mendukung akses kepemilikan rumah melalui pembiayaan perumahan yang dikelola BP Tapera.",
    benefits: [
      "Dukungan pembiayaan pembelian rumah dengan skema KPR Sejahtera.",
    ],
    requirements: [
      "WNI yang belum memiliki rumah dan belum pernah menerima subsidi pembiayaan perumahan sesuai ketentuan.",
      "Penghasilan berada dalam batas MBR yang berlaku menurut zona dan status keluarga; bank menilai kelayakan pembiayaan.",
    ],
    documents: [
      "Surat pemesanan rumah, KTP elektronik, dan KK",
      "NPWP, SPT, serta bukti penghasilan sesuai jenis pekerjaan",
      "Dokumen perkawinan jika relevan dan surat pernyataan pemohon",
    ],
    steps: [
      "Periksa syarat zona dan pilih rumah serta bank penyalur.",
      "Siapkan dokumen dan ajukan KPR melalui kanal BP Tapera/bank.",
      "Ikuti verifikasi dan penilaian kredit oleh bank.",
    ],
    note: "Batas penghasilan berbeda menurut wilayah. Periksa rincian pada BP Tapera; Hakkita tidak menilai kemampuan kredit.",
    official: "https://www.tapera.go.id/kpr-flpp/",
    sources: [
      {
        label: "BP Tapera — syarat dan tahapan KPR FLPP",
        url: "https://www.tapera.go.id/kpr-flpp/",
      },
    ],
    related: ["ktp-el", "npwp"],
  },
  {
    id: "atensi",
    type: "program",
    name: "Asistensi Rehabilitasi Sosial (ATENSI)",
    category: "rentan",
    icon: "HandHeart",
    agency: "Kementerian Sosial",
    region: "Nasional; pelaksanaan sesuai asesmen dan unit layanan",
    summary:
      "Dukungan rehabilitasi sosial sesuai kebutuhan individu melalui pendekatan keluarga, komunitas, dan residensial.",
    about:
      "ATENSI mencakup dukungan hidup layak, perawatan sosial, terapi, keterampilan, dan aksesibilitas sesuai asesmen.",
    benefits: [
      "Bentuk dukungan disesuaikan dengan kebutuhan dan hasil asesmen pekerja sosial.",
    ],
    requirements: [
      "Kondisi dan kebutuhan calon penerima harus dinilai oleh penyelenggara.",
      "Penerimaan dan dukungan mengikuti hasil asesmen serta ketentuan unit layanan.",
    ],
    documents: [
      "Data calon penerima dan kebutuhan layanan sesuai permintaan penyelenggara; konfirmasikan dokumen dengan unit layanan",
    ],
    steps: [
      "Pelajari pedoman ATENSI pada sumber resmi.",
      "Konsultasikan kebutuhan dan jalur rujukan kepada dinas sosial atau unit rehabilitasi sosial.",
      "Ikuti asesmen dan tindak lanjut dari penyelenggara.",
    ],
    note: "Pedoman operasional menjadi rujukan umum. Kanal dan dokumen spesifik perlu dikonfirmasi kepada unit layanan, bukan diasumsikan sama di semua daerah.",
    official: "https://kemensos.go.id/uploads/topics/17035995429363.pdf",
    sources: [
      {
        label: "Kemensos — Pedoman Operasional ATENSI",
        url: "https://kemensos.go.id/uploads/topics/17035995429363.pdf",
      },
      {
        label: "JDIH Kemensos — istilah ATENSI",
        url: "https://jdih.kemensos.go.id/glosarium",
      },
    ],
    related: ["ktp-el", "mobile-jkn"],
  },
  {
    id: "npwp",
    type: "layanan",
    name: "Pendaftaran NPWP",
    category: "pajak",
    icon: "Receipt",
    agency: "Direktorat Jenderal Pajak",
    region: "Nasional",
    summary:
      "Panduan pendaftaran wajib pajak orang pribadi penduduk Indonesia melalui Coretax DJP.",
    about:
      "Pendaftaran dengan aktivasi NIK digunakan untuk mendaftarkan NIK sebagai NPWP. Pilih alur sesuai kondisi perpajakanmu.",
    requirements: [
      "Orang pribadi penduduk Indonesia yang hendak mendaftarkan diri sebagai wajib pajak.",
      "Data identitas dapat divalidasi serta email dan nomor ponsel dapat diakses.",
    ],
    documents: ["KTP dan KK terbaru", "Email dan nomor ponsel aktif"],
    steps: [
      "Buka Coretax DJP dan pilih Daftar di sini → Perorangan.",
      "Pilih memiliki NIK dan alur pendaftaran dengan aktivasi NIK.",
      "Lengkapi data, validasi kontak dan identitas sesuai petunjuk.",
      "Periksa pernyataan lalu kirim pengajuan melalui Coretax.",
    ],
    channel:
      "Coretax DJP. Panduan ini khusus pendaftaran orang pribadi dengan NIK.",
    note: "Mengakses panduan Hakkita tidak mendaftarkanmu sebagai wajib pajak. Proses dan validasi dilakukan DJP.",
    official:
      "https://www.pajak.go.id/coretaxpedia/pendaftaran-wp-orang-pribadi",
    sources: [
      {
        label: "DJP — pendaftaran wajib pajak orang pribadi",
        url: "https://www.pajak.go.id/coretaxpedia/pendaftaran-wp-orang-pribadi",
      },
      {
        label: "DJP — dokumen Coretax",
        url: "https://pajak.go.id/coretaxpedia/dokumen-yang-perlu-disiapkan",
      },
    ],
    related: ["ktp-el", "kur"],
  },
  {
    id: "skck",
    type: "layanan",
    name: "Surat Keterangan Catatan Kepolisian (SKCK)",
    category: "hukum",
    icon: "ShieldCheck",
    agency: "Kepolisian Negara Republik Indonesia",
    region: "Nasional; penerbitan sesuai kewenangan kantor kepolisian",
    summary: "Panduan awal mengajukan SKCK melalui kanal resmi kepolisian.",
    about:
      "SKCK menerangkan ada atau tidaknya catatan kriminalitas seseorang berdasarkan pelayanan fungsi Intelkam.",
    requirements: [
      "Pilih tujuan permohonan dan kantor penerbit sesuai kewenangannya.",
      "Lengkapi data serta dokumen yang diminta pada pengajuan resmi.",
    ],
    documents: [
      "Identitas dan dokumen pendukung sesuai persyaratan yang ditampilkan kanal pengajuan; konfirmasikan pada kantor penerbit",
    ],
    steps: [
      "Periksa kanal SKCK resmi dan tujuan permohonan.",
      "Lengkapi formulir serta dokumen pada Polri Super App atau kanal pelayanan.",
      "Ikuti verifikasi dan penelitian data oleh petugas.",
      "Lanjutkan pembayaran PNBP dan penerbitan sesuai petunjuk kanal resmi.",
    ],
    fee: "PNBP Rp30.000 sesuai informasi portal SKCK resmi dan PP 76 Tahun 2020.",
    channel:
      "Polri Super App, situs SKCK, atau loket kepolisian sesuai kewenangan.",
    note: "Panduan ini tidak menggantikan daftar dokumen spesifik yang ditampilkan saat permohonan. Tidak ada kantor atau jadwal yang diasumsikan tersedia.",
    official: "https://skck-online.polri.go.id/",
    sources: [
      {
        label: "POLRI — portal SKCK dan biaya resmi",
        url: "https://skck-online.polri.go.id/",
      },
      {
        label: "Polda Jatim — alur penerbitan SKCK",
        url: "https://tribratanews.jatim.polri.go.id/informasi-penerbitan-skck",
      },
    ],
    related: ["ktp-el"],
  },
  {
    id: "nib",
    type: "layanan",
    name: "Pendaftaran Nomor Induk Berusaha (NIB)",
    category: "perizinan",
    icon: "Storefront",
    agency: "Kementerian Investasi dan Hilirisasi/BKPM",
    region: "Nasional",
    summary:
      "Akses panduan perizinan berusaha untuk usaha mikro dan kecil melalui OSS.",
    about:
      "Panduan ini untuk UMK orang perseorangan dengan risiko rendah atau menengah rendah. Kebutuhan izin mengikuti kegiatan dan tingkat risiko usaha.",
    requirements: [
      "Pilih panduan UMK yang sesuai dengan bentuk dan kondisi usahamu.",
      "Ikuti isian serta validasi yang diminta OSS untuk kegiatan usaha terkait.",
    ],
    documents: [
      "NIK dan data identitas pelaku usaha serta NPWP pribadi",
      "Data bidang dan lokasi usaha; data BPJS jika sudah dimiliki",
    ],
    steps: [
      "Buka panduan OSS untuk usaha mikro dan kecil.",
      "Pilih panduan yang sesuai dan ikuti pendaftaran hak akses.",
      "Lengkapi data kegiatan usaha dan persyaratan pada OSS.",
      "Periksa hasil penerbitan serta kewajiban perizinan lanjutan.",
    ],
    channel: "Portal OSS.",
    note: "NIB tidak selalu merupakan satu-satunya persyaratan usaha. Periksa izin dan standar tambahan sesuai tingkat risiko.",
    official: ossGuide,
    sources: [
      {
        label:
          "OSS — panduan UMK orang perseorangan, risiko rendah dan menengah rendah",
        url: ossGuide,
      },
    ],
    related: ["npwp", "kur"],
  },
  {
    id: "lapor",
    type: "layanan",
    name: "SP4N-LAPOR!",
    category: "pengaduan",
    icon: "ChatText",
    agency: "Kementerian PANRB dan Kementerian Komunikasi dan Digital",
    region: "Nasional",
    summary: "Kanal aspirasi dan pengaduan mengenai pelayanan publik.",
    about:
      "SP4N-LAPOR! menghubungkan laporan masyarakat dengan instansi terkait.",
    requirements: [
      "Sampaikan substansi laporan yang jelas dan pilih instansi atau lokasi sesuai konteks.",
      "Ikuti ketentuan pengiriman laporan pada kanal resmi.",
    ],
    documents: [
      "Uraian kejadian dan bukti pendukung bila tersedia; hindari memasukkan data pribadi yang tidak diperlukan",
    ],
    steps: [
      "Buka kanal resmi yang sedang tersedia.",
      "Pilih jenis laporan dan isi uraian serta lokasi/instansi terkait.",
      "Periksa kembali isi dan privasi laporan sebelum mengirim di kanal resmi.",
    ],
    channel: "Portal SP4N-LAPOR!.",
    note: "Pada pemeriksaan 31 Oktober 2026, lapor.go.id sedang pemeliharaan dan mengarahkan pelapor ke prod.lapor.go.id. Periksa pengumuman resmi untuk pembaruan.",
    official: "https://prod.lapor.go.id/",
    sources: [
      {
        label: "SP4N-LAPOR! — kanal layanan",
        url: "https://prod.lapor.go.id/",
      },
      {
        label: "Pengumuman pemeliharaan dan kanal alternatif",
        url: "https://lapor.go.id/",
      },
    ],
    related: [],
  },
];
