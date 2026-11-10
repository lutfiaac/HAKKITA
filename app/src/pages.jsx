import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowCounterClockwise,
  CaretDown,
  Info,
  ShieldCheck,
  ChartBar,
  ChartPieSlice,
  CalendarBlank,
  Wallet,
  ChartLineUp,
  GraduationCap,
  HandHeart,
  Bank,
  Shield,
  House,
  Leaf,
  Church,
  MapTrifold,
  Heart,
} from "@phosphor-icons/react";
import {
  catalog,
  matchPrograms,
  VERIFIED,
} from "./data.js";
import { selectBudget, formatBudget, listBudgetProvinces, listBudgetRegions } from "./budget.js";
import {
  Icon,
  Breadcrumb,
  PageIntro,
  External,
  Empty,
  detailUrl,
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
  const [year, setYear] = useState("2026");
  const [scope, setScope] = useState("nasional");
  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [period, setPeriod] = useState("Realisasi sampai 30 September 2026");
  const [selectedSector, setSelectedSector] = useState("ekonomi");
  const [showAllSectors, setShowAllSectors] = useState(false);
  const provinces = listBudgetProvinces();
  const regions = listBudgetRegions(province);
  const snapshot = selectBudget(year, scope, region);
  const data = snapshot && (!period || period === snapshot.period) ? snapshot : null;
  const allocationRows = data?.sectors?.length ? data.sectors : data?.rows ?? [];
  const denominator = data?.sectors?.length ? data.sectors.reduce((sum, sector) => sum + sector.budget, 0) : data?.totalBudget;
  const chosenSector = data?.sectors?.find((sector) => sector.id === selectedSector) ?? data?.sectors?.[0];
  const sortedSectors = allocationRows.slice().sort((a,b)=>b.budget-a.budget);
  const visibleSectors = showAllSectors ? sortedSectors : sortedSectors.slice(0,5);
  const sectorIcons = { ekonomi: ChartLineUp, umum: Bank, pendidikan: GraduationCap, pertahanan: Shield, sosial: HandHeart, keamanan: Shield, kesehatan: Heart, perumahan: House, agama: Church, lingkungan: Leaf, pariwisata: MapTrifold };
  const percent = (row) => row.percent ?? (row.budget ? row.realized / row.budget * 100 : null);
  const money = (value, digits = data?.unitShort === "T" ? 1 : 2) => `Rp${new Intl.NumberFormat("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)} ${data?.unitShort ?? ""}`;
  const fullMoney = (value) => data?.unitShort === "T"
    ? `${money(value, 1).replace(/ T$/, "")} triliun`
    : data?.unitShort === "M"
      ? `${money(value, 2).replace(/ M$/, "")} miliar`
      : money(value);
  return <div className="container page budget-page">
    <Breadcrumb items={[{ label: "Telusuri Anggaran" }]} />
    <PageIntro title="Telusuri Anggaran" subtitle="Jelajahi bagaimana anggaran pemerintah dialokasikan dan sejauh mana realisasinya berdasarkan data resmi." />
    <div className="budget-tabs" role="tablist" aria-label="Jenis anggaran">
      <button role="tab" aria-selected={scope === "nasional"} className={scope === "nasional" ? "active" : ""} onClick={() => { setScope("nasional"); setProvince(""); setRegion(""); setPeriod("Realisasi sampai 30 September 2026"); setSelectedSector("ekonomi"); setShowAllSectors(false); }}>Anggaran Nasional (APBN)</button>
      <button role="tab" aria-selected={scope === "daerah"} className={scope === "daerah" ? "active" : ""} onClick={() => { setScope("daerah"); setProvince(""); setRegion(""); setPeriod(""); setShowAllSectors(false); }}>Anggaran Daerah (APBD)</button>
    </div>
    <div className={`budget-filters${scope === "daerah" ? " apbd-filters" : ""}`}>
      <label>Tahun anggaran<select value={year} onChange={(e) => { const value = e.target.value; setYear(value); setPeriod(selectBudget(value, scope, region)?.period ?? ""); }}><option value="2026">2026</option><option value="2025">2025</option></select></label>
      {scope === "daerah" && <>
        <label>Provinsi<select value={province} onChange={(e) => { setProvince(e.target.value); setRegion(""); setPeriod(""); }}><option value="">Pilih provinsi</option>{provinces.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Wilayah<select value={region} disabled={!province} onChange={(e) => { const value = e.target.value; setRegion(value); setPeriod(value ? selectBudget(year, scope, value)?.period ?? "" : ""); }}><option value="">Pilih wilayah</option>{regions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      </>}
      {scope === "nasional" && <label>Periode<select value={data?.period ?? ""} disabled={!snapshot} onChange={(e) => setPeriod(e.target.value)}><option value="">{snapshot ? "Pilih periode" : "Data periode belum tersedia"}</option>{snapshot && <option value={snapshot.period}>{snapshot.period}</option>}</select></label>}
    </div>
    {!data ? <div className="budget-empty"><Empty icon={ChartBar} title="Data anggaran belum tersedia"><p>Kami belum memiliki data untuk pilihanmu saat ini. Coba pilih tahun atau wilayah lain, atau lihat informasi dari sumber resmi.</p></Empty></div> : <>
      <section className="budget-featured" aria-label="Gambaran umum anggaran">
        <div className="budget-featured-plan">
          <span className="budget-featured-icon" aria-hidden="true"><Wallet size={28} /></span>
          <div className="budget-featured-plan-copy">
            <span className="budget-kicker">Belanja yang direncanakan</span>
            <strong>{money(data.totalBudget, 1)}</strong>
            <p>Total belanja yang dialokasikan dalam anggaran tahun terpilih.</p>
          </div>
        </div>
        <div className="budget-featured-realized">
          <div className="budget-realized-heading">
            <div className="budget-realized-label"><span className="budget-featured-icon" aria-hidden="true"><ChartBar size={24} weight="fill" /></span><span>Sudah direalisasikan</span></div>
            <strong className="budget-realized-value">{money(data.totalRealized, 1)}</strong>
          </div>
          <div className="budget-progress-track" role="img" aria-label={`${formatBudget(data.realizationPercent)} persen dari pagu belanja telah terealisasi`}><span style={{width:`${Math.min(data.realizationPercent,100)}%`}} /></div>
          <div className="budget-realized-meta"><strong>{formatBudget(data.realizationPercent)}%</strong><span aria-hidden="true">·</span><span>{data.period}</span></div>
        </div>
      </section>
      <section className="budget-section budget-allocation"><h2>Ke mana anggaran dialokasikan?</h2><p>Lihat pembagian anggaran berdasarkan bidang penggunaannya. Pilih salah satu untuk mengetahui lebih lanjut.</p>
        {data.sectors?.length ? <>
          <div className="budget-allocation-panel"><div className="budget-allocation-context"><span>Klasifikasi · <strong>{data.allocationBasis}</strong></span><span>Persentase dari total Belanja Pemerintah Pusat <strong>{money(denominator,1)}</strong></span></div>
          <div className="budget-bars" role="group" aria-label={`Alokasi ${data.name} ${data.year} menurut fungsi`}>
            {visibleSectors.map((row) => { const share = row.budget / denominator * 100; const SectorIcon=sectorIcons[row.id] ?? ChartBar; return <button type="button" className={`budget-bar-row ${chosenSector?.id === row.id ? "selected" : ""}`} key={row.id} aria-pressed={chosenSector?.id === row.id} onClick={() => setSelectedSector(row.id)}><span className="budget-sector-icon"><SectorIcon size={18}/></span><span className="budget-sector-copy"><span className="budget-bar-label"><strong>{row.name}</strong><span>{money(row.budget, 1)} · {formatBudget(share)}%</span></span><span className="budget-bar-track"><span style={{ width: `${share}%` }} /></span></span></button>; })}
          </div><button className="budget-expand-button" type="button" aria-expanded={showAllSectors} onClick={() => setShowAllSectors((value)=>!value)}>{showAllSectors ? "Tampilkan lebih sedikit" : "Lihat seluruh bidang"} <CaretDown size={15}/></button>
          </div>
          {chosenSector && <aside className="budget-sector-detail">
            <div className="budget-sector-overview">
              <div className="budget-sector-primary">
                <div className="budget-sector-detail-header">{(()=>{const SectorIcon=sectorIcons[chosenSector.id] ?? ChartBar; return <span className="budget-sector-icon detail" aria-hidden="true"><SectorIcon size={30}/></span>;})()}<div className="budget-sector-detail-copy"><span className="budget-detail-eyebrow">Detail bidang anggaran</span><h3>{chosenSector.name}</h3></div></div>
              </div>
              <section className="budget-sector-summary" aria-label="Ringkasan bidang anggaran">
                <div className="budget-sector-summary-items">
                  <div className="budget-sector-summary-item"><span className="budget-sector-summary-icon" aria-hidden="true"><Wallet size={23}/></span><div><span>Nominal anggaran</span><strong>{money(chosenSector.budget, 1)}</strong></div></div>
                  <div className="budget-sector-summary-item"><span className="budget-sector-summary-icon" aria-hidden="true"><CalendarBlank size={23}/></span><div><span>Tahun anggaran</span><strong>{data.year}</strong></div></div>
                  <div className="budget-sector-summary-item"><span className="budget-sector-summary-icon" aria-hidden="true"><ChartPieSlice size={23}/></span><div><span>Porsi anggaran</span><strong>{formatBudget(chosenSector.budget / denominator * 100)}%</strong></div></div>
                </div>
              </section>
            </div>
            {chosenSector.purpose && <section className="budget-sector-purpose"><h4>Untuk apa anggaran ini dialokasikan?</h4><p>{chosenSector.purpose}</p></section>}{typeof chosenSector.realized === "number" && <small>Realisasi bidang: {fullMoney(chosenSector.realized)}.</small>}<div className="budget-detail-hint"><Info size={16}/><span>Pilih bidang anggaran lain pada daftar di atas untuk melihat rinciannya.</span></div>
          </aside>}
        </> : <div className="budget-no-sector"><strong>Rincian anggaran berdasarkan bidang belum tersedia pada sumber data yang digunakan.</strong><p>Data APBD yang tersedia di sini dikelompokkan berdasarkan jenis belanja. Jenis belanja tidak menunjukkan sektor seperti pendidikan atau kesehatan.</p></div>}
      </section>
      <section className="budget-section budget-secondary"><h2>Lihat rincian anggaran</h2><details><summary>{scope === "nasional" ? "Belanja Pemerintah Pusat dan Transfer ke Daerah" : "Rincian belanja daerah"}</summary><BudgetTable rows={data.rows} money={money} percent={percent} caption={`Komponen belanja ${data.name} ${year}`} /></details><details><summary>Rincian pendapatan</summary><div className="budget-revenue-total"><span>Total pendapatan · pagu {money(data.revenue.totalBudget,1)}</span><strong>Realisasi {money(data.revenue.totalRealized,1)} ({formatBudget(data.revenue.realizationPercent)}%)</strong></div><BudgetTable rows={data.revenue.rows} money={money} percent={percent} caption={`Komponen pendapatan ${data.name} ${year}`} /></details></section>
      <section className="budget-source-section budget-source-dropdown"><details><summary>Sumber informasi</summary><div className="budget-source-content"><p>{data.sourceNotes}</p><ul>{data.sources.map((source) => <li key={source.url}><External href={source.url}>{source.label}</External><span>{source.note}</span></li>)}</ul></div></details></section>
    </>}
  </div>;
}
function BudgetTable({ rows, money, percent, caption }) {
  return <div className="budget-table-wrap"><table className="budget-table"><caption>{caption} · rupiah</caption><thead><tr><th scope="col">Komponen</th><th scope="col">Anggaran</th><th scope="col">Realisasi</th><th scope="col">Realisasi (%)</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name}><th scope="row">{row.name}</th><td>{money(row.budget)}</td><td>{money(row.realized)}</td><td>{formatBudget(percent(row))}%</td></tr>)}</tbody></table></div>;
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
