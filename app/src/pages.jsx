import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowCounterClockwise,
  CaretRight,
  CaretDown,
  SlidersHorizontal,
  Compass,
  MapPin,
  Info,
  FileText,
  ShieldCheck,
  BookmarkSimple,
  Check,
  CheckCircle,
  Trash,
  ChartBar,
  List,
} from "@phosphor-icons/react";
import {
  catalog,
  categories,
  findItem,
  categoryName,
  filterCatalog,
  matchPrograms,
  VERIFIED,
} from "./data.js";
import { budgetSnapshot, selectBudget, formatBudget } from "./budget.js";
import { provinces } from "./taxonomy";
import {
  Icon,
  Search,
  Breadcrumb,
  PageIntro,
  External,
  Empty,
  detailUrl,
  hrefWith,
  FAQ,
} from "./ui.jsx";
function FAQPage() {
  return (
    <div className="container page narrow">
      <Breadcrumb items={[{ label: "FAQ" }]} />
      <PageIntro
        title="Ada yang ingin kamu pahami?"
        subtitle="Jawaban untuk membantu langkahmu di Hakkita."
      />
      <FAQ />
      <details className="faq">
        <summary>
          Bagaimana memeriksa data kesejahteraan?
          <CaretDown />
        </summary>
        <p>
          Konfirmasikan status data dan cara pembaruan kepada dinas sosial atau
          kelurahan/desa. Hakkita tidak menghitung atau menetapkan desil resmi.
        </p>
      </details>
      <details className="faq">
        <summary>
          Di mana akun dan Rencanaku disimpan?
          <CaretDown />
        </summary>
        <p>
          Identitas contoh, profil pilihan, dan simpanan terkait browser ini.
          Tidak ada akun server atau sinkronisasi antarperangkat. Jawaban
          ekonomi tambahan tidak disimpan di penyimpanan browser.
        </p>
      </details>
      <a className="text-link help-link" href="/cari">
        Kembali mencari informasi <ArrowRight />
      </a>
    </div>
  );
}

const needs = [
  { value: "kuliah", label: "Melanjutkan kuliah", icon: "GraduationCap" },
  { value: "sekolah", label: "Biaya pendidikan sekolah", icon: "Books" },
  { value: "kerja", label: "Mengembangkan keterampilan", icon: "Briefcase" },
  { value: "usaha", label: "Pembiayaan usaha", icon: "Storefront" },
];
function RadioGroup({ name, title, options, value, onChange }) {
  return (
    <fieldset className="radio-fieldset">
      <legend>{title}</legend>
      {options.map((o) => (
        <label
          key={o.value}
          className={
            value === o.value ? "radio-option selected" : "radio-option"
          }
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.icon && <Icon name={o.icon} size={24} />}
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
export function Matching() {
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState({});
  const set = (key) => (value) => setAnswers((a) => ({ ...a, [key]: value }));
  const yesNo = [
    { value: "yes", label: "Ya" },
    { value: "no", label: "Tidak" },
    { value: "unknown", label: "Belum tahu" },
  ];
  const ready =
    step === 0
      ? !!answers.need
      : answers.need === "kuliah"
        ? answers.year && answers.economy
        : answers.need === "kerja"
          ? answers.age && answers.education
          : answers.need === "sekolah"
            ? answers.student
            : answers.business;
  const results = matchPrograms(answers);
  return (
    <div className="container page">
      <Breadcrumb
        items={[
          { label: "Kenali Hakmu", href: "/program" },
          { label: "Temukan program" },
        ]}
      />
      <div className="wizard-wrap">
        <PageIntro
          eyebrow="MULAI DARI DIRIMU"
          title={
            step === 2
              ? "Pilihan untuk kamu telusuri."
              : "Temukan program yang relevan."
          }
          subtitle="Beberapa pertanyaan sederhana untuk membantumu memahami pilihan dan persyaratannya."
        />
        <div
          className="wizard-progress"
          aria-label={`Langkah ${step + 1} dari 3`}
        >
          {["Kebutuhanmu", "Kondisimu", "Pilihan program"].map((x, i) => (
            <span className={step >= i ? "current" : ""} key={x}>
              <b>{i + 1}</b>
              {x}
            </span>
          ))}
        </div>
        {step < 2 ? (
          <div className="wizard-panel">
            {step === 0 ? (
              <RadioGroup
                name="need"
                title="Apa kebutuhan utamamu saat ini?"
                options={needs}
                value={answers.need}
                onChange={set("need")}
              />
            ) : (
              <>
                {answers.need === "kuliah" && (
                  <>
                    <RadioGroup
                      name="year"
                      title="Kapan kamu lulus SMA atau sederajat?"
                      options={[
                        ...["2026", "2025", "2024"].map((y) => ({
                          value: y,
                          label: y,
                        })),
                        { value: "other", label: "Di luar tahun tersebut" },
                        { value: "unknown", label: "Belum tahu / belum lulus" },
                      ]}
                      value={answers.year}
                      onChange={set("year")}
                    />
                    <RadioGroup
                      name="economy"
                      title="Apakah kamu membutuhkan bantuan karena keterbatasan ekonomi?"
                      options={yesNo}
                      value={answers.economy}
                      onChange={set("economy")}
                    />
                  </>
                )}
                {answers.need === "kerja" && (
                  <>
                    <RadioGroup
                      name="age"
                      title="Apakah kamu sudah berusia 17 tahun?"
                      options={[
                        { value: "17plus", label: "Ya, 17 tahun atau lebih" },
                        { value: "under17", label: "Belum 17 tahun" },
                        { value: "unknown", label: "Lewati dahulu" },
                      ]}
                      value={answers.age}
                      onChange={set("age")}
                    />
                    <RadioGroup
                      name="education"
                      title="Apakah kamu lulusan SMA/SMK/MA atau sederajat?"
                      options={[
                        { value: "sma", label: "Ya" },
                        { value: "other", label: "Jenjang pendidikan lainnya" },
                        { value: "unknown", label: "Belum tahu" },
                      ]}
                      value={answers.education}
                      onChange={set("education")}
                    />
                  </>
                )}
                {answers.need === "sekolah" && (
                  <RadioGroup
                    name="student"
                    title="Apakah penerima yang kamu cari masih bersekolah atau akan kembali bersekolah?"
                    options={yesNo}
                    value={answers.student}
                    onChange={set("student")}
                  />
                )}
                {answers.need === "usaha" && (
                  <RadioGroup
                    name="business"
                    title="Apakah kamu sudah memiliki usaha produktif?"
                    options={yesNo}
                    value={answers.business}
                    onChange={set("business")}
                  />
                )}
              </>
            )}
            <div className="wizard-actions">
              {step > 0 ? (
                <button
                  className="text-button"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft /> Kembali
                </button>
              ) : (
                <span className="subtle">
                  <ShieldCheck size={16} /> Tanpa NIK atau data pribadi
                </span>
              )}
              <button
                className="button primary"
                disabled={!ready}
                onClick={() => {
                  setStep(step + 1);
                  window.scrollTo(0, 0);
                }}
              >
                {step === 0 ? "Lanjutkan" : "Lihat pilihan program"}
                <ArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="info-box">
              <Info size={24} />
              <p>
                Hasil ini membantu menyaring informasi berdasarkan jawabanmu.
                Penetapan penerima tetap dilakukan oleh penyelenggara program.
              </p>
            </div>
            {results.map(({ item, issues, checks, status }) => (
              <div className="match-result" key={item.id}>
                <span
                  className={
                    issues.length ? "match-status attention" : "match-status"
                  }
                >
                  {status}
                </span>
                <h2>{item.name}</h2>
                <p>{item.summary}</p>
                <h3>Yang perlu kamu ketahui</h3>
                <ul>
                  {[...issues, ...checks].map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <a href={detailUrl(item)} className="button primary">
                  Pelajari persyaratan <ArrowRight />
                </a>
              </div>
            ))}
            <div className="wizard-actions">
              <button className="text-button" onClick={() => setStep(1)}>
                <ArrowLeft /> Ubah jawaban
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                }}
              >
                Mulai lagi <ArrowCounterClockwise />
              </button>
            </div>
            <p className="subtle">
              Butuh pilihan lain? <a href="/program">Lihat seluruh program</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
export function Budget() {
  const [year, setYear] = useState("2026"),
    [scope, setScope] = useState("daerah"),
    [view, setView] = useState("chart"),
    [region, setRegion] = useState("nasional"),
    [category, setCategory] = useState("");
  const data = selectBudget(year, scope, region, category);
  const max = data ? Math.max(1, ...data.rows.map((r) => r.budget || 0)) : 1;
  return (
    <div className="container page">
      <Breadcrumb items={[{ label: "Telusuri Anggaran" }]} />
      <PageIntro
        eyebrow="TRANSPARANSI PUBLIK"
        title="Pahami anggaran untuk kehidupan kita."
        subtitle="Telusuri informasi anggaran dari sumber pemerintah dan kenali peruntukannya."
      />
      <div className="budget-controls">
        <label>
          Tahun anggaran
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option>2026</option>
            <option>2025</option>
          </select>
        </label>
        <label>
          Cakupan
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="daerah">APBD agregat nasional</option>
            <option value="nasional">APBN</option>
          </select>
        </label>
        <label>
          Wilayah
          <select
            aria-label="Wilayah anggaran"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="nasional">Agregat nasional</option>
            {provinces.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Kelompok belanja
          <select
            aria-label="Kelompok belanja"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua kelompok</option>
            {budgetSnapshot.rows.map((r) => (
              <option key={r.name}>{r.name}</option>
            ))}
          </select>
        </label>
        <div className="segmented" role="group" aria-label="Tampilan anggaran">
          <button
            aria-pressed={view === "chart"}
            className={view === "chart" ? "selected" : ""}
            onClick={() => setView("chart")}
          >
            <ChartBar /> Grafik
          </button>
          <button
            aria-pressed={view === "table"}
            className={view === "table" ? "selected" : ""}
            onClick={() => setView("table")}
          >
            <List /> Tabel
          </button>
        </div>
      </div>
      {data && (
        <>
          <div className="budget-summary">
            <div>
              <span>Alokasi belanja yang ditampilkan</span>
              <strong>
                Rp{formatBudget(data.totalBudget / 1000)} <small>triliun</small>
              </strong>
            </div>
            <div>
              <span>Realisasi sampai Oktober 2026</span>
              <strong>
                Rp
                {formatBudget(
                  data.totalRealized === null
                    ? null
                    : data.totalRealized / 1000,
                )}{" "}
                <small>triliun</small>
              </strong>
            </div>
            <div>
              <span>Cakupan pelaporan SIKD</span>
              <strong>
                {data.reportingGovernments} <small>pemerintah daerah</small>
              </strong>
            </div>
          </div>
          <p className="budget-caption">
            APBD Murni/Perubahan · Agregat nasional · Data diterima SIKD per{" "}
            {data.receivedAt}
          </p>
        </>
      )}
      <div className="budget-panel">
        <div className="budget-panel-title">
          <h2>
            {scope === "nasional"
              ? "Anggaran Pendapatan dan Belanja Negara"
              : "Komposisi belanja daerah"}{" "}
            {year}
          </h2>
          <span>
            {data
              ? "Dalam miliar rupiah (M)"
              : view === "chart"
                ? "Ringkasan grafik"
                : "Rincian tabel"}
          </span>
        </div>
        {data ? (
          view === "chart" ? (
            <>
              <div className="chart-legend">
                <span>Alokasi</span>
                <span>Realisasi</span>
              </div>
              <div
                className="budget-chart"
                role="img"
                aria-label="Perbandingan alokasi dan realisasi empat kelompok belanja daerah. Nilai rinci juga tersedia pada tampilan tabel."
              >
                {data.rows.map((r) => (
                  <div className="chart-row" key={r.name}>
                    <h3>{r.name}</h3>
                    <div className="chart-line">
                      <meter
                        aria-label={`Alokasi ${r.name}`}
                        value={r.budget}
                        max={max}
                      />
                      <span>{formatBudget(r.budget)}</span>
                    </div>
                    <div className="chart-line realized">
                      <meter
                        aria-label={`Realisasi ${r.name}`}
                        value={
                          typeof r.realized === "number"
                            ? r.realized
                            : undefined
                        }
                        max={max}
                        hidden={typeof r.realized !== "number"}
                      />
                      <span>{formatBudget(r.realized)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="table-scroll">
              <table className="budget-table">
                <caption>
                  Belanja APBD 2026, agregat nasional dari{" "}
                  {data.reportingGovernments} pemerintah daerah
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Kelompok belanja</th>
                    <th scope="col">Alokasi (M)</th>
                    <th scope="col">Realisasi (M)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.name}>
                      <th scope="row">{r.name}</th>
                      <td>{formatBudget(r.budget)}</td>
                      <td>{formatBudget(r.realized)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <Empty icon={ChartBar} title="Data anggaran belum tersedia">
            <p>
              Belum ada data terverifikasi untuk pilihan ini.
              <br />
              Telusuri dokumen anggaran melalui sumber resmi.
            </p>
            <External
              className="button secondary"
              href={
                scope === "nasional"
                  ? "https://anggaran.kemenkeu.go.id/in/page/ebookdanemagazine"
                  : "https://djpk.kemenkeu.go.id/portal/data/apbd"
              }
            >
              Buka sumber anggaran
            </External>
          </Empty>
        )}
        {data && (
          <div className="budget-source">
            <External href={data.source}>
              Sumber: Portal Data SIKD, DJPK Kementerian Keuangan
            </External>
            <span>
              Diperiksa {data.verifiedAt}. Angka merupakan snapshot; pembaruan
              tersedia pada sumber resmi.
            </span>
          </div>
        )}
      </div>
      <div className="budget-explainer">
        <div>
          <h2>Membaca anggaran dengan lebih mudah</h2>
          <p>
            <strong>Alokasi</strong> adalah dana yang direncanakan.{" "}
            <strong>Realisasi</strong> adalah dana yang telah digunakan. Data
            APBD di atas merupakan gabungan pelaporan daerah, bukan anggaran
            pemerintah pusat (APBN).
          </p>
        </div>
        <a className="button secondary" href="/sumber">
          Kenali sumber informasi <ArrowRight />
        </a>
      </div>
    </div>
  );
}
export function Information({ path }) {
  if (path === "/sumber")
    return (
      <div className="container page">
        <Breadcrumb items={[{ label: "Sumber informasi" }]} />
        <PageIntro
          title="Informasi yang jelas asalnya."
          subtitle="Kami merangkum informasi publik dan menghubungkanmu langsung ke penyelenggaranya."
        />
        <div className="info-box">
          <ShieldCheck size={25} />
          <p>
            Setiap panduan memuat sumber dan tanggal pemeriksaan. Ketentuan
            dapat berubah; periksa kanal resmi sebelum mengajukan permohonan.
          </p>
        </div>
        <div className="source-list">
          {catalog.map((item) => (
            <article key={item.id}>
              <div>
                <h2>{item.name}</h2>
                <p>{item.agency}</p>
                <span>Diperiksa {VERIFIED}</span>
              </div>
              <External href={item.sources[0].url}>Lihat sumber resmi</External>
            </article>
          ))}
        </div>
        <div className="prose">
          <h2>Bagaimana informasi dipilih?</h2>
          <p>
            Kami mengutamakan sumber instansi pemerintah dan penyelenggara
            resmi. Rincian daerah diberi cakupan wilayah. Informasi jadwal,
            biaya, dan status hanya ditampilkan jika didukung sumber yang
            diperiksa.
          </p>
          <h2>Informasi anggaran</h2>
          <p>
            Ringkasan APBD 2026 bersumber dari Portal Data SIKD, DJPK
            Kementerian Keuangan, dengan data diterima per 30 Oktober 2026.
            Angka merupakan agregat pelaporan 546 pemerintah daerah. Untuk
            pilihan lain yang belum tersedia, tidak adanya data bukan berarti
            anggaran bernilai nol.
          </p>
        </div>
      </div>
    );
  if (path === "/bantuan") return <FAQPage />;
  return (
    <div className="container page narrow">
      <Breadcrumb
        items={[{ label: path === "/privasi" ? "Privasi" : "Tentang Hakkita" }]}
      />
      <PageIntro
        title={
          path === "/privasi"
            ? "Pilihanmu tetap dalam kendalimu."
            : "Hakmu, lebih dekat."
        }
        subtitle={
          path === "/privasi"
            ? "Cara Hakkita memperlakukan informasi yang kamu gunakan."
            : "Membantu masyarakat Indonesia memahami hak, program, dan layanan publik."
        }
      />
      <div className="prose">
        {path === "/privasi" ? (
          <>
            <h2>Data di perangkatmu</h2>
            <p>
              Rencanaku menyimpan pilihan program dan checklist di penyimpanan
              browser perangkat ini. Kamu dapat menghapus setiap rencana dari
              halaman Rencanaku. Profil pilihan dan simpanan dipisahkan untuk
              setiap identitas contoh pada perangkat ini. Jawaban tambahan
              tentang ekonomi dan kondisi hunian hanya digunakan selama sesi
              berjalan, serta dihapus saat keluar atau memuat ulang halaman.
            </p>
            <h2>Tanpa dokumen pribadi</h2>
            <p>
              Hakkita tidak meminta NIK, nomor rekening, foto identitas, atau
              unggahan dokumen. Persyaratan ditampilkan sebagai panduan
              persiapan.
            </p>
            <h2>Tautan ke situs lain</h2>
            <p>
              Tautan resmi terbuka di tab baru. Kebijakan privasi dan
              pengelolaan data pada situs tersebut mengikuti masing-masing
              penyelenggara.
            </p>
          </>
        ) : (
          <>
            <h2>Dari informasi menjadi langkah yang jelas</h2>
            <p>
              Informasi publik seharusnya mudah ditemukan dan dipahami. Hakkita
              menyatukan panduan program dan layanan agar kamu dapat mengetahui
              pilihan, mempersiapkan dokumen, lalu melanjutkan ke kanal yang
              tepat.
            </p>
            <h2>Independen dan terbuka tentang sumber</h2>
            <p>
              Hakkita bukan instansi pemerintah dan tidak menetapkan penerima
              program. Setiap ringkasan dilengkapi tautan ke sumber resmi serta
              cakupan panduan.
            </p>
            <h2>Mulai dengan kebutuhanmu</h2>
            <p>
              Jelajahi katalog, cocokkan kebutuhan, atau simpan panduan ke
              Rencanaku. Tidak diperlukan akun untuk memulai.
            </p>
            <a href="/program" className="button primary">
              Kenali Hakmu <ArrowRight />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
