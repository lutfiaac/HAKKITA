# HAKKITA

**Temukan program, pahami layanan publik, dan tentukan langkahmu.**

HAKKITA adalah platform digital yang membantu masyarakat Indonesia menemukan informasi program bantuan, beasiswa, peluang pengembangan diri, dan panduan layanan publik melalui satu portal yang mudah diakses dan dipahami.

HAKKITA menyederhanakan pencarian informasi publik yang tersebar di berbagai situs instansi dan membantu pengguna menemukan informasi yang relevan dengan kebutuhannya.

> **HAKKITA merupakan portal informasi independen, bukan situs resmi pemerintah.** Pendaftaran program dan pengajuan layanan tetap dilakukan melalui kanal resmi instansi terkait.

---

## Latar Belakang

Informasi program dan layanan publik tersedia melalui berbagai kanal. Masyarakat dapat kesulitan menemukan informasi yang relevan, memahami persyaratan, serta mengikuti pembaruan jadwal dan prosedur. HAKKITA membantu pengguna menemukan informasi, memahami langkah yang tersedia, dan mengelola program atau layanan yang ingin ditindaklanjuti.

## Fitur Utama

### Kenali Hakmu

Katalog program untuk menjelajahi bantuan dan peluang yang tersedia, dengan pencarian, kategori, filter, detail program, sumber resmi, serta rekomendasi berdasarkan preferensi pengguna.

### Layanan Publik

Panduan kebutuhan administratif yang menyajikan persyaratan, dokumen, tahapan, instansi, kanal layanan, dan sumber resmi sesuai informasi yang tersedia. HAKKITA tidak memproses pengajuan layanan secara langsung.

### Rencanaku

Ruang personal untuk menyimpan program atau layanan, mengelola daftar persiapan, dan melihat kembali informasi pilihan. Data akun contoh disimpan secara lokal pada browser.

### Telusuri Anggaran

Eksplorasi informasi anggaran publik berdasarkan data dan sumber yang tersedia, melalui visualisasi dan pengelompokan yang mudah dijelajahi.

### Smart Wizard: Cari Program untukmu

Kuesioner interaktif membantu pengguna menemukan program berdasarkan kebutuhan, kegiatan, wilayah, dan informasi lain yang relevan. Hasilnya adalah rekomendasi informasi, bukan penetapan kelayakan resmi.

### Asisten HAKKITA

Antarmuka percakapan untuk membantu pencarian informasi program dan layanan serta navigasi ke halaman yang relevan.

## Pembaruan dan Validasi Informasi

HAKKITA merencanakan pengelolaan informasi dengan bantuan AI Agent dan validasi manusia (*human-in-the-loop*) untuk menjaga relevansi serta akurasi informasi.

Alur yang direncanakan:

1. Agent menelusuri sumber resmi yang telah ditentukan.
2. Agent mengidentifikasi informasi baru atau perubahan.
3. Temuan beserta sumber pendukung diajukan untuk divalidasi.
4. Admin memeriksa sumber, membandingkan informasi, dan melakukan koreksi.
5. Informasi yang disetujui dipublikasikan.
6. Sistem mencatat pembaruan dan keputusan validasi.

Temuan agent tidak direncanakan untuk langsung dipublikasikan tanpa pemeriksaan manusia. Dashboard Admin menyediakan antarmuka untuk validasi informasi, pengelolaan informasi, dan riwayat aktivitas. Otomatisasi penelusuran agent dan proses validasi produksi belum beroperasi.

## Teknologi

| Teknologi | Penggunaan |
| --- | --- |
| React 19 | Antarmuka aplikasi |
| Vite 6 | Development server dan build |
| TypeScript | Modul dan tipe aplikasi |
| CSS | Styling dan tata letak responsif |
| Geist | Tipografi |
| Phosphor Icons | Ikon antarmuka |

Sebagian data dan interaksi pada prototipe menggunakan penyimpanan lokal di browser.

## Menjalankan Proyek

### Prasyarat

- Node.js dan npm
- Git

### Instal dependensi

```bash
npm --prefix app ci
```

### Jalankan development server

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Buka `http://127.0.0.1:4173/` di browser.

### Build aplikasi

```bash
npm run build
```

### Pemeriksaan tambahan

```bash
npm --prefix app run typecheck
npm test
```

## Struktur Proyek

```text
HAKKITA/
|-- app/
|   |-- public/       # Aset aplikasi
|   |-- scripts/      # Script build dan pengujian
|   |-- server/       # Integrasi server lokal
|   |-- src/          # Kode aplikasi
|   |-- tests/        # Pengujian
|   `-- worker/       # Worker untuk deployment
|-- package.json      # Script workspace
|-- package-lock.json
`-- README.md
```

## Batasan dan Keamanan

- HAKKITA bukan penyelenggara program bantuan atau instansi pemerintah.
- Kelayakan penerima tidak ditetapkan oleh HAKKITA.
- Pengguna perlu memeriksa informasi melalui sumber penyelenggara.
- Pengajuan dilakukan melalui kanal resmi yang tersedia.
- Penelusuran otomatis oleh AI Agent, pengingat email, dan validasi produksi memerlukan integrasi layanan tambahan.
- Akun contoh dan penyimpanan lokal bukan pengganti autentikasi, otorisasi, atau database produksi.

## Repository

[GitHub: lutfiaac/HAKKITA](https://github.com/lutfiaac/HAKKITA)

---

**HAKKITA - Informasi lebih mudah ditemukan, langkah berikutnya lebih jelas.**
