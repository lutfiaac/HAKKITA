import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CaretRight,
  SlidersHorizontal,
  BookmarkSimple,
  Check,
  Info,
  FileText,
  MapPin,
  X,
} from "@phosphor-icons/react";
import {
  catalog,
  programCategories,
  serviceCategories,
  filterCatalog,
  categoryName,
  findItem,
  VERIFIED,
} from "./data.js";
import { provinces, targetGroups } from "./taxonomy";
import { useAccount } from "./AccountContext";
import { recommendPrograms } from "./recommendations";
import { ProgramCatalog } from "./ProgramCatalog.jsx";
import { ProgramDetail } from "./ProgramDetail.jsx";
import { sortPrograms } from "./program-timeline.js";
import {
  Search,
  Breadcrumb,
  PageIntro,
  External,
  Empty,
  Card,
  Icon,
  Modal,
  NotFound,
  detailUrl,
  hrefWith,
} from "./ui.jsx";
function useMobile() {
  const [mobile, setMobile] = useState(
    () => window.matchMedia?.("(max-width:640px)").matches || false,
  );
  useEffect(() => {
    const media = window.matchMedia?.("(max-width:640px)");
    if (!media) return;
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}
export function Catalog({ type, navigate, initialCategory = "", save, plans }) {
  const p = new URLSearchParams(location.search),
    mobile = useMobile(),
    [filterOpen, setFilterOpen] = useState(false);
  const query = (p.get("q") || "").slice(0, 200),
    category = initialCategory || p.get("kategori") || "",
    region = p.get("wilayah") || "",
    city = type === "program" ? p.get("kabupaten") || "" : "",
    selectedType = type || p.get("jenis") || "",
    targets = [...new Set((p.get("sasaran") || "").split(",").filter(Boolean))],
    benefit =
      type === "program"
        ? [...new Set((p.get("manfaat") || "").split(",").filter(Boolean))]
        : p.get("manfaat") || "",
    level = p.get("tingkat") || "",
    education = p.get("pendidikan") || "",
    activity = p.get("kegiatan") || "",
    channel = p.get("kanal") || "",
    verifiedPeriod = p.get("periode") === "true";
  const periodStatus = ["open", "upcoming", "closed"].includes(p.get("periode"))
    ? p.get("periode")
    : "";
  const categories =
    selectedType === "program"
      ? programCategories
      : selectedType === "layanan"
        ? serviceCategories
        : [...programCategories, ...serviceCategories];
  const filteredItems = filterCatalog({
    query,
    category,
    type: selectedType,
    region,
    city,
    targets,
    benefit,
    level,
    education,
    activity,
    channel,
    verifiedPeriod,
    periodStatus,
  });
  const sort = ["latest", "deadline", "az", "za"].includes(p.get("urutan"))
    ? p.get("urutan")
    : "latest";
  const items =
    type === "program" ? sortPrograms(filteredItems, sort) : filteredItems;
  const values = {
    q: query,
    kategori: category,
    wilayah: region,
    ...(type === "program" ? { kabupaten: city } : {}),
    jenis: type ? "" : selectedType,
    sasaran: targets,
    manfaat: benefit,
    tingkat: level,
    pendidikan: education,
    kegiatan: activity,
    kanal: channel,
    periode: periodStatus || (verifiedPeriod ? "true" : ""),
    ...(type === "program" ? { urutan: sort === "latest" ? "" : sort } : {}),
  };
  function update(key, value) {
    updateFilters({ [key]: value });
  }
  function updateFilters(patch) {
    const next = { ...values, ...patch };
    if (type === "program" && "wilayah" in patch && patch.wilayah !== region)
      next.kabupaten = "";
    navigate(hrefWith(type ? `/${type}` : "/cari", next));
  }
  const reset = () => navigate(type ? `/${type}` : "/cari"),
    closeFilters = useCallback(() => setFilterOpen(false), []);
  const active = Object.entries(values).filter(
    ([key, value]) =>
      !["q", "urutan"].includes(key) &&
      value &&
      (Array.isArray(value) ? value.length : true),
  );
  const labels = {
    kategori: categories.find((c) => c.id === category)?.name || category,
    wilayah: region,
    sasaran: targets
      .map((t) => targetGroups.find(([id]) => id === t)?.[1] || t)
      .join(", "),
    jenis: selectedType === "program" ? "Program" : "Layanan",
    manfaat: benefit,
    tingkat: level === "pusat" ? "Penyelenggara pusat" : "Penyelenggara daerah",
    pendidikan: education.toUpperCase(),
    kegiatan: activity,
    kanal: channel === "online" ? "Tersedia online" : "Tersedia tatap muka",
    periode: "Periode terverifikasi",
  };
  if (initialCategory && !categories.some((c) => c.id === initialCategory))
    return <NotFound />;
  if (type === "program")
    return (
      <ProgramCatalog
        items={items}
        values={values}
        labels={labels}
        sort={sort}
        update={update}
        applyAdvanced={updateFilters}
        reset={reset}
        navigate={navigate}
        save={save}
        plans={plans}
      />
    );
  const filterContent = (
    <>
      <label htmlFor="category-filter">
        {selectedType === "program"
          ? "Kategori program"
          : selectedType === "layanan"
            ? "Kategori layanan"
            : "Kategori"}
      </label>
      <select
        id="category-filter"
        value={category}
        onChange={(e) => update("kategori", e.target.value)}
      >
        <option value="">Semua kategori</option>
        {categories.map((c) => (
          <option value={c.id} key={`${selectedType}-${c.id}`}>
            {c.name}
          </option>
        ))}
      </select>
      {!type && (
        <>
          <label htmlFor="type-filter">Jenis informasi</label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => {
              navigate(hrefWith("/cari", { q: query, jenis: e.target.value }));
            }}
          >
            <option value="">Semua informasi</option>
            <option value="program">Program</option>
            <option value="layanan">Layanan</option>
          </select>
        </>
      )}
      <label htmlFor="region-filter">Wilayah</label>
      <select
        id="region-filter"
        value={region}
        onChange={(e) => update("wilayah", e.target.value)}
      >
        <option value="">Semua wilayah</option>
        <option value="nasional">Nasional</option>
        {provinces.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <p className="field-help">
        Program atau kebijakan nasional tetap muncul saat kamu memilih provinsi.
        Periksa lokasi pelaksanaan pada panduan.
      </p>
      {selectedType !== "layanan" && (
        <fieldset className="target-filter">
          <legend>Sasaran penerima</legend>
          {targetGroups.map(([value, label]) => (
            <label key={value}>
              <input
                type="checkbox"
                value={value}
                checked={targets.includes(value)}
                onChange={() =>
                  update(
                    "sasaran",
                    targets.includes(value)
                      ? targets.filter((x) => x !== value)
                      : [...targets, value],
                  )
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
      )}
      {selectedType !== "program" && (
        <>
          <label htmlFor="channel-filter">Kanal pengurusan</label>
          <select
            id="channel-filter"
            value={channel}
            onChange={(e) => update("kanal", e.target.value)}
          >
            <option value="">Semua kanal</option>
            <option value="online">Tersedia online</option>
            <option value="offline">Tersedia tatap muka</option>
          </select>
        </>
      )}
      {selectedType !== "layanan" && (
        <details className="advanced-filters">
          <summary>Filter lanjutan</summary>
          <label htmlFor="benefit-filter">Jenis manfaat</label>
          <select
            id="benefit-filter"
            value={benefit}
            onChange={(e) => update("manfaat", e.target.value)}
          >
            <option value="">Semua manfaat</option>
            <option value="biaya-pendidikan">Biaya pendidikan</option>
            <option value="pelatihan">Pelatihan</option>
            <option value="pembiayaan">Pembiayaan</option>
            <option value="pendampingan">Pendampingan</option>
          </select>
          <label htmlFor="level-filter">Penyelenggara</label>
          <select
            id="level-filter"
            value={level}
            onChange={(e) => update("tingkat", e.target.value)}
          >
            <option value="">Semua tingkat</option>
            <option value="pusat">Pusat</option>
            <option value="daerah">Daerah</option>
          </select>
          <label htmlFor="education-filter">Jenjang pendidikan</label>
          <select
            id="education-filter"
            value={education}
            onChange={(e) => update("pendidikan", e.target.value)}
          >
            <option value="">Semua jenjang</option>
            {["sd", "smp", "sma", "diploma", "sarjana"].map((x) => (
              <option key={x} value={x}>
                {x.toUpperCase()}
              </option>
            ))}
          </select>
          <label htmlFor="activity-filter">Kegiatan saat ini</label>
          <select
            id="activity-filter"
            value={activity}
            onChange={(e) => update("kegiatan", e.target.value)}
          >
            <option value="">Semua kegiatan</option>
            <option value="mencari-kerja">Mencari kerja</option>
            <option value="bekerja">Bekerja</option>
            <option value="usaha">Memiliki usaha</option>
          </select>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={verifiedPeriod}
              onChange={(e) =>
                update("periode", e.target.checked ? "true" : "")
              }
            />
            Hanya periode pendaftaran terverifikasi
          </label>
        </details>
      )}
      {active.length > 0 && (
        <button className="text-button reset-filter" onClick={reset}>
          Reset Semua
        </button>
      )}
    </>
  );
  return (
    <div className="container page discovery-page">
      <Breadcrumb
        items={[
          {
            label:
              type === "program"
                ? "Kenali Hakmu"
                : type === "layanan"
                  ? "Jelajahi Layanan"
                  : "Pencarian",
          },
          ...(initialCategory
            ? [{ label: categoryName(initialCategory) }]
            : []),
        ]}
      />
      <PageIntro
        title={
          type === "program"
            ? "Kenali Hakmu"
            : type === "layanan"
              ? "Mau mengurus apa hari ini?"
              : "Apa yang kamu butuhkan?"
        }
        subtitle={
          type === "program"
            ? "Temukan program pemerintah, pahami persyaratannya, dan pilih langkah berikutnya."
            : type === "layanan"
              ? "Temukan persyaratan, prosedur, biaya, dan kanal resmi berbagai layanan publik."
              : "Cari program, layanan, dan jenis pengurusan dalam satu tempat."
        }
      />
      <Search key={query} navigate={navigate} initial={query} type={type} />
      {type === "program" && (
        <div className="small-callout">
          <Icon name="Compass" size={24} />
          <span>Ingin pilihan yang lebih terarah?</span>
          <a href="/program/rekomendasi">
            Lihat Rekomendasi Untukmu <ArrowRight size={17} />
          </a>
          <a href="/cocokkan">
            Cek kebutuhan tanpa akun <ArrowRight size={17} />
          </a>
        </div>
      )}
      {type === "layanan" && !query && !category && !active.length && (
        <>
          <section className="service-preview">
            <h2>Mulai dari Layanan Ini</h2>
            <div className="popular-grid">
              {[
                "ktp-el",
                "npwp",
                "perpanjangan-sim",
                "paspor",
                "skck",
                "mobile-jkn",
              ].map((id) => (
                <a key={id} href={detailUrl(findItem(id))}>
                  <Icon name={findItem(id).icon} size={22} />
                  <span>{findItem(id).name}</span>
                  <CaretRight size={17} />
                </a>
              ))}
            </div>
          </section>
          <section
            className="service-category-list"
            id="kategori-layanan"
            tabIndex={-1}
            aria-labelledby="service-category-title"
          >
            <h2 id="service-category-title">Jelajahi berdasarkan kategori</h2>
            <div>
              {serviceCategories.map((c) => (
                <a href={`/layanan/kategori/${c.id}`} key={c.id}>
                  <Icon name={c.icon} size={20} />
                  {c.name}
                  <CaretRight size={15} />
                </a>
              ))}
            </div>
          </section>
        </>
      )}
      <div className="catalog-layout">
        <aside className="filters revised-filters">
          {mobile ? (
            <>
              <button
                className="button secondary filter-open"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={18} />
                Filter pencarian{active.length > 0 && ` (${active.length})`}
              </button>
              {filterOpen && (
                <Modal
                  title="Filter pencarian"
                  id="filter-dialog"
                  onClose={closeFilters}
                >
                  <div className="filter-sheet-content">{filterContent}</div>
                  <button className="button primary" onClick={closeFilters}>
                    Tampilkan {items.length} hasil
                  </button>
                </Modal>
              )}
            </>
          ) : (
            <>
              <h2>
                <SlidersHorizontal size={20} />
                Filter pencarian
              </h2>
              {filterContent}
            </>
          )}
        </aside>
        <div>
          <div className="result-count" role="status">
            <strong>
              {items.length}{" "}
              {selectedType === "program"
                ? "program"
                : selectedType === "layanan"
                  ? "layanan"
                  : "hasil"}
            </strong>
            {query && <span>untuk “{query}”</span>}
          </div>
          {active.length > 0 && (
            <div className="active-filters" aria-label="Filter aktif">
              {active.map(([key]) => (
                <button
                  key={key}
                  onClick={() => update(key, "")}
                  aria-label={`Hapus filter ${labels[key]}`}
                >
                  {labels[key]}
                  <X size={13} />
                </button>
              ))}
              <button className="clear-all-filter" onClick={reset}>
                Hapus Filter
              </button>
            </div>
          )}
          {items.length ? (
            <div className="catalog-grid">
              {items.map((item) => (
                <Card
                  key={item.id}
                  item={item}
                  query={query}
                  save={save}
                  plans={plans}
                />
              ))}
            </div>
          ) : (
            <Empty
              title={
                selectedType === "program"
                  ? "Belum ada program yang sesuai dengan pencarianmu."
                  : selectedType === "layanan"
                    ? "Layanan belum ditemukan."
                    : "Belum ada hasil yang sesuai."
              }
            >
              <p>Coba gunakan kata kunci lain atau ubah filter yang dipilih.</p>
              <button className="button secondary" onClick={reset}>
                Reset Filter
              </button>
              <p className="empty-alternative">
                <a href={selectedType === "layanan" ? "/program" : "/layanan"}>
                  Jelajahi {selectedType === "layanan" ? "program" : "layanan"}{" "}
                  lainnya
                </a>
              </p>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
export function Detail({ item, variantId, save, plans, navigate }) {
  const { account, sensitiveAnswers } = useAccount();
  const requirementsView =
    item.type === "program" && variantId === "persyaratan";
  if (
    variantId &&
    !requirementsView &&
    !item.variants?.some((v) => v.id === variantId)
  )
    return <NotFound />;
  const variant = item.variants?.find(
    (v) => v.id === (variantId || item.variants[0].id),
  );
  const selected = variant || item;
  const key = item.id + (variant ? `:${variant.id}` : "");
  const saved = Boolean(plans[key]);
  const evaluation =
    account && item.type === "program"
      ? recommendPrograms(
          [item],
          { ...account.profile, interests: [item.primaryCategory] },
          sensitiveAnswers,
        )[0]
      : null;
  if (item.type === "program")
    return (
      <ProgramDetail
        item={item}
        requirementsView={requirementsView}
        save={save}
        saved={saved}
        evaluation={evaluation}
      />
    );
  return (
    <div className="container page detail-page">
      <Breadcrumb
        items={[
          {
            label:
              item.type === "program" ? "Kenali Hakmu" : "Jelajahi Layanan",
            href: `/${item.type}`,
          },
          { label: item.name, ...(variantId ? { href: detailUrl(item) } : {}) },
          ...(variantId
            ? [{ label: requirementsView ? "Persyaratan" : variant.name }]
            : []),
        ]}
      />
      <div className="detail-top">
        <div>
          <span className="category-label">{categoryName(item.category)}</span>
          <h1>{item.name}</h1>
          <p>{item.summary}</p>
          <div className="detail-meta">
            <span>
              <MapPin size={17} />
              {item.region}
            </span>
          </div>
        </div>
        <div className="detail-emblem">
          <Icon name={item.icon} size={56} weight="duotone" />
        </div>
      </div>
      <div className="detail-layout">
        <article className="detail-content">
          {!requirementsView && (
            <>
              <section>
                <h2>
                  {item.type === "program"
                    ? "Tentang program"
                    : "Ringkasan layanan"}
                </h2>
                <p>{item.about}</p>
              </section>
              {item.benefits && (
                <section>
                  <h2>Manfaat</h2>
                  <ul>
                    {item.benefits.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
          {item.variants && (
            <section>
              <h2>Jenis pengurusan</h2>
              <p>
                Pilih kondisi yang sesuai untuk melihat panduan dan dokumen yang
                dibutuhkan.
              </p>
              <div
                className="segmented"
                role="group"
                aria-label="Jenis pengurusan"
              >
                {item.variants.map((v) => (
                  <button
                    key={v.id}
                    aria-pressed={variant.id === v.id}
                    className={variant.id === v.id ? "selected" : ""}
                    onClick={() => navigate(`${detailUrl(item)}/${v.id}`)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section>
            <h2>
              {item.type === "program"
                ? "Sasaran dan persyaratan"
                : "Persyaratan"}
            </h2>
            <ul>
              {selected.requirements.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {item.type === "program" && !requirementsView && (
              <a className="text-link" href={`${detailUrl(item)}/persyaratan`}>
                Periksa persyaratan secara rinci <ArrowRight size={17} />
              </a>
            )}
          </section>
          {evaluation && (
            <section className="personal-rule-check">
              <h2>Berdasarkan informasi profilmu</h2>
              <span className="match-status">{evaluation.status}</span>
              <ul>
                {evaluation.rules.map((rule) => (
                  <li key={rule.id}>
                    <strong>
                      {rule.state === "met"
                        ? "Sesuai jawaban: "
                        : rule.state === "not-met"
                          ? "Belum sesuai: "
                          : "Perlu diperiksa: "}
                    </strong>
                    {rule.label}
                  </li>
                ))}
              </ul>
              <a className="text-link" href="/profil/edit">
                Perbarui informasi profil <ArrowRight size={16} />
              </a>
            </section>
          )}
          <section>
            <h2>Dokumen yang perlu disiapkan</h2>
            <ul className="document-list">
              {selected.documents.map((x) => (
                <li key={x}>
                  <FileText size={20} />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="subtle">
              Simpan ke Rencanaku untuk menandai persiapan dokumen.
            </p>
          </section>
          {item.fee && (
            <section>
              <h2>Biaya resmi</h2>
              <p>{item.fee}</p>
            </section>
          )}
          {!requirementsView && (
            <>
              <section>
                <h2>
                  {item.type === "program"
                    ? "Cara mengakses program"
                    : "Langkah pengurusan"}
                </h2>
                <ol className="steps">
                  {selected.steps.map((x, i) => (
                    <li key={x}>
                      <span>{i + 1}</span>
                      <p>{x}</p>
                    </li>
                  ))}
                </ol>
              </section>
              {item.channel && (
                <section>
                  <h2>Kanal pelayanan</h2>
                  <p>{item.channel}</p>
                  <a
                    className="text-link"
                    href={hrefWith("/layanan/lokasi", { layanan: item.id })}
                  >
                    Periksa kanal dan lokasi pelayanan <ArrowRight size={17} />
                  </a>
                </section>
              )}
            </>
          )}
          {item.note && (
            <div className="info-box">
              <Info size={23} />
              <div>
                <h3>Perlu diperhatikan</h3>
                <p>{item.note}</p>
                {item.id === "kip-kuliah" && (
                  <a href="/bantuan">
                    Cara memeriksa data kesejahteraan <ArrowRight size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
          <section className="sources-block">
            <h2>Sumber Informasi</h2>
            <p>{item.agency}</p>
            {item.sources.map((source) => (
              <External key={source.url} href={source.url}>
                {source.label}
              </External>
            ))}
            <span className="source-date">
              <Icon name="ShieldCheck" size={16} />
              Diperiksa {item.lastVerifiedAt || VERIFIED}
            </span>
          </section>
          {item.relatedServices?.length > 0 && (
            <section className="contextual-services">
              <h2>Perlu mengurus dokumen pendukung?</h2>
              <div>
                {item.relatedServices.map((id) => (
                  <a href={detailUrl(findItem(id))} key={id}>
                    {findItem(id).name}
                    <span>
                      Lihat Panduan Pengurusan <ArrowRight size={15} />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}
          {requirementsView && (
            <a href={detailUrl(item)} className="text-link">
              <ArrowLeft size={16} />
              Kembali ke informasi program
            </a>
          )}
        </article>
        <aside className="detail-sidebar">
          <div className="action-panel">
            <h2>Siap ambil langkah berikutnya?</h2>
            <p>
              Lanjutkan melalui kanal penyelenggara untuk informasi dan
              pengajuan resmi.
            </p>
            <External href={item.official} className="button primary">
              {item.type === "program"
                ? "Buka Situs Resmi"
                : "Buka Kanal Resmi"}
            </External>
            <button
              className="button secondary"
              aria-pressed={saved}
              onClick={() => save(item, variant?.id || "")}
            >
              <BookmarkSimple size={19} weight={saved ? "fill" : "regular"} />
              {saved ? "Hapus dari Rencanaku" : "Simpan ke Rencanaku"}
            </button>
            {saved && (
              <a className="text-link" href="/rencanaku">
                Buka Rencanaku <ArrowRight size={17} />
              </a>
            )}
            <p className="panel-note">
              Tidak perlu memasukkan NIK atau mengunggah dokumen di Hakkita.
            </p>
          </div>
          <div className="related">
            <h3>Mungkin kamu juga membutuhkan</h3>
            {item.related.map((id) => (
              <a key={id} href={detailUrl(findItem(id))}>
                {findItem(id).name}
                <CaretRight size={17} />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
export function ServiceLocations() {
  const item = findItem(new URLSearchParams(location.search).get("layanan"));
  if (!item || item.type !== "layanan")
    return (
      <div className="container page">
        <PageIntro
          title="Temukan kanal pelayanan yang tepat."
          subtitle="Pilih layanan terlebih dahulu agar kanal yang ditampilkan sesuai kebutuhanmu."
        />
        <a className="button primary" href="/layanan">
          Jelajahi Layanan <ArrowRight />
        </a>
      </div>
    );
  return (
    <div className="container page narrow">
      <Breadcrumb
        items={[
          { label: "Jelajahi Layanan", href: "/layanan" },
          { label: item.name, href: detailUrl(item) },
          { label: "Kanal pelayanan" },
        ]}
      />
      <PageIntro
        title={`Kanal pelayanan ${item.name}`}
        subtitle={item.region}
      />
      <div className="prose">
        <h2>Kanal resmi</h2>
        <p>{item.channel}</p>
        <External className="button primary" href={item.official}>
          Buka Kanal Resmi
        </External>
        <h2>Lokasi pelayanan</h2>
        {item.locations.length ? (
          item.locations.map((location) => (
            <External key={location.url} href={location.url}>
              {location.name}
            </External>
          ))
        ) : (
          <p>
            Daftar lokasi yang sesuai belum tersedia di Hakkita. Periksa kantor
            atau jadwal pada kanal penyelenggara; lokasi pelaksanaan dapat
            berbeda menurut wilayah dan jenis pengurusan.
          </p>
        )}
        <a href={detailUrl(item)} className="text-link">
          <ArrowLeft size={17} />
          Kembali ke panduan
        </a>
      </div>
    </div>
  );
}
