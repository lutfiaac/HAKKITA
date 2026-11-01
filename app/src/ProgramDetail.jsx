import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkSimple,
  Check,
  Info,
  Signpost,
  MapPin,
  Buildings,
  GraduationCap,
  Gift,
  HandHeart,
} from "@phosphor-icons/react";
import { Breadcrumb, External, detailUrl } from "./ui.jsx";
import { categoryName, findItem } from "./data.js";
import { categoryImages } from "./category-images.js";
import {
  formatBenefitAmount,
  informationLabels,
  normalizeProgramDetail,
  officialUrl,
} from "./program-detail";

const documentLabels = {
  required: "Wajib",
  optional: "Opsional",
  conditional: "Kondisional",
  alternative: "Salah satu",
  confirm: "Konfirmasi ketentuan",
};
const modeLabels = {
  online: "Online",
  offline: "Langsung",
  mixed: "Online dan langsung",
};
const metadataIcons = {
  "Mekanisme akses": Signpost,
  "Jalur pengajuan": Signpost,
  "Cakupan wilayah": MapPin,
  Penyelenggara: Buildings,
  Pendidikan: GraduationCap,
  "Bentuk bantuan": Gift,
  "Bentuk dukungan": Gift,
  "Bentuk layanan": HandHeart,
};
export function displayDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    return null;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}
function BenefitValues({ values }) {
  return (
    <ul className="program-detail-list">
      {values.map((benefit, index) => {
        const amount = formatBenefitAmount(benefit);
        return (
          <li key={index}>
            <strong>{benefit.label}</strong>
            {amount && <p>{amount}</p>}
            {benefit.condition && <p>{benefit.condition}</p>}
          </li>
        );
      })}
    </ul>
  );
}
function DocumentList({ documents }) {
  return (
    <ul className="program-detail-documents">
      {documents.map((document) => (
        <li key={document.id}>
          <Check size={18} aria-hidden="true" />
          <div>
            <strong>{document.name}</strong>
            <span className="program-document-label">
              {documentLabels[document.requirement] || documentLabels.confirm}
            </span>
            {document.alternatives?.length > 0 && (
              <p>Pilih salah satu: {document.alternatives.join(" atau ")}.</p>
            )}
            {document.condition && <p>{document.condition}</p>}
            {document.route && <p>Jalur: {document.route}</p>}
            {document.region && <p>Wilayah: {document.region}</p>}
            {document.guide &&
              findItem(document.guide.id)?.type === "layanan" && (
                <a href={detailUrl(findItem(document.guide.id))}>
                  {document.guide.reason}
                </a>
              )}
          </div>
        </li>
      ))}
    </ul>
  );
}
function AccessRoutes({ routes }) {
  return (
    <div className="program-access-routes">
      {routes.map((route) => (
        <div key={route.id}>
          {routes.length > 1 && <h3>{route.label}</h3>}
          {route.description && <p>{route.description}</p>}
          {route.region && <p className="subtle">Wilayah: {route.region}</p>}
          {route.steps.length > 0 && (
            <ol className="program-detail-stepper">
              {route.steps.map((step, index) => (
                <li key={index}>
                  <span className="program-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <p>{step.title}</p>
                    {step.description && <p>{step.description}</p>}
                    {(step.mode || step.condition) && (
                      <p className="program-step-context">
                        {modeLabels[step.mode]}
                        {step.mode && step.condition ? " · " : ""}
                        {step.condition}
                      </p>
                    )}
                    {officialUrl(step.url) && (
                      <External href={step.url}>
                        Buka rujukan langkah ini
                      </External>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  );
}
const renderers = {
  text: (value) => <p>{value}</p>,
  list: (value) => (
    <ul className="program-detail-list">
      {value.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ul>
  ),
  requirements: (value) => (
    <>
      {value.map((group) => (
        <div className="program-requirement-group" key={group.title}>
          <h3>{group.title}</h3>
          <ul className="program-detail-list">
            {group.items.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  ),
  documents: (value) => <DocumentList documents={value} />,
  access: (value) => <AccessRoutes routes={value} />,
  values: (value) => <BenefitValues values={value} />,
};
export function ProgramSection({ section }) {
  const { status, value, note } = section.information;
  const uncertain = [
    "unknown",
    "unverified",
    "outdated",
    "conflicting",
  ].includes(status);
  return (
    <section
      className="program-detail-section"
      id={section.id}
      aria-labelledby={`${section.id}-title`}
    >
      <h2 id={`${section.id}-title`}>{section.title}</h2>
      {status !== "verified" && (
        <span className="program-information-status">
          {informationLabels[status]}
        </span>
      )}
      {note && <p className={uncertain ? "program-data-note" : ""}>{note}</p>}
      {uncertain && !note && (
        <p>Informasi ini perlu dikonfirmasi melalui penyelenggara.</p>
      )}
      {!uncertain && value && renderers[section.kind](value)}
    </section>
  );
}
function ProgramPeriods({ registration }) {
  if (!registration) return null;
  return (
    <section
      className="program-detail-section"
      id="periode"
      aria-labelledby="periode-title"
    >
      <h2 id="periode-title">Periode pendaftaran</h2>
      <span
        className={`program-period-status program-period-${registration.status}`}
      >
        {registration.label}
      </span>
      {registration.periods.length ? (
        <>
          <p>
            Status mengikuti jadwal per jalur; tidak menunjukkan ketersediaan
            kuota atau hasil pengajuan.
          </p>
          <ul className="program-periods">
            {registration.periods.map((period) => (
              <li key={period.label}>
                <strong>{period.label}</strong>
                <span>
                  {displayDate(period.opensOn)} – {displayDate(period.closesOn)}
                </span>
                <External href={period.sourceUrl}>
                  Periksa jadwal resmi
                </External>
              </li>
            ))}
          </ul>
        </>
      ) : registration.status === "none" ? (
        <p>
          Akses program mengikuti mekanisme penyelenggara, tanpa periode
          pendaftaran yang ditetapkan.
        </p>
      ) : (
        <p>
          Jadwal penerimaan terkini belum dapat dipastikan. Periksa pengumuman
          penyelenggara sebelum mengajukan.
        </p>
      )}
    </section>
  );
}
function ProgramSources({ sources, agency }) {
  const types = {
    pdf: "Dokumen PDF",
    page: "Halaman informasi",
    portal: "Portal resmi",
    regulation: "Peraturan",
  };
  return (
    <section
      className="program-detail-section program-official-sources"
      id="sumber"
      aria-labelledby="program-sources-title"
    >
      <h2 id="program-sources-title">Sumber Informasi</h2>
      {agency && <p>{agency}</p>}
      {sources.length ? (
        <ol>
          {sources.map((source) => (
            <li id={source.id} key={source.id}>
              <External href={source.url}>{source.title}</External>
              <div className="program-source-meta">
                <span>{types[source.type] || "Rujukan resmi"}</span>
                {source.organization && source.organization !== agency && (
                  <span>{source.organization}</span>
                )}
                {displayDate(source.publishedOn) && (
                  <span>Diterbitkan {displayDate(source.publishedOn)}</span>
                )}
                {displayDate(source.updatedOn) && (
                  <span>Diperbarui sumber {displayDate(source.updatedOn)}</span>
                )}
                {displayDate(source.checkedOn) && (
                  <span>Diperiksa HAKKITA {displayDate(source.checkedOn)}</span>
                )}
                {source.status !== "verified" && (
                  <span>{informationLabels[source.status]}</span>
                )}
                {source.availability === "unavailable" && (
                  <span>
                    Sumber tidak dapat diakses; perlu pemeriksaan ulang.
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p>
          Rujukan resmi belum tersedia. Informasi dan jalur akses perlu
          dikonfirmasi sebelum digunakan.
        </p>
      )}
    </section>
  );
}
function ProgramActions({ model, item, saved, save }) {
  return (
    <aside className="program-detail-actions" aria-label="Tindakan program">
      <div className="program-action-panel">
        <h2>{model.action.heading}</h2>
        <p>{model.action.description}</p>
        {model.action.url ? (
          <External className="button primary" href={model.action.url}>
            {model.action.label}
          </External>
        ) : (
          <p className="program-data-note">
            Kanal tindakan belum dapat dipastikan. Periksa sumber atau
            konfirmasikan kepada penyelenggara.
          </p>
        )}
        <button
          className="button secondary"
          aria-pressed={saved}
          onClick={() => save(item)}
        >
          <BookmarkSimple size={19} weight={saved ? "fill" : "regular"} />
          {saved ? "Hapus dari Rencanaku" : "Simpan ke Rencanaku"}
        </button>
        {saved && (
          <a className="text-link" href="/rencanaku">
            Buka Rencanaku <ArrowRight size={16} />
          </a>
        )}
        <p className="program-action-note">
          HAKKITA menyediakan informasi, bukan tempat pengajuan. Penetapan
          penerima dilakukan penyelenggara.
        </p>
      </div>
    </aside>
  );
}
export function ProgramDetail({
  item,
  requirementsView = false,
  save,
  saved,
  evaluation,
}) {
  const model = normalizeProgramDetail(item);
  const sections = requirementsView
    ? model.sections.filter((section) =>
        ["persyaratan", "dokumen"].includes(section.id),
      )
    : model.sections;
  const guides = [
    ...new Map(model.relatedGuides.map((guide) => [guide.id, guide])).values(),
  ].filter((guide) => guide.reason && findItem(guide.id)?.type === "layanan");
  return (
    <div className="container page program-detail-page">
      <Breadcrumb
        items={[
          { label: "Kenali Hakmu", href: "/program" },
          {
            label: item.name,
            ...(requirementsView ? { href: detailUrl(item) } : {}),
          },
          ...(requirementsView ? [{ label: "Persyaratan" }] : []),
        ]}
      />
      <div className="program-detail-layout">
        <header className="program-detail-overview">
          <div
            className={`program-detail-identity${categoryImages[item.category] ? " has-category-image" : ""}`}
          >
            <div>
              <a
                className="program-detail-category"
                href={`/program/kategori/${item.category}`}
              >
                {categoryName(item.category)}
              </a>
              <h1>{item.name}</h1>
              {model.overview && (
                <p className="program-detail-summary">{model.overview}</p>
              )}
              {model.renamedTo && <p>Nama terbaru: {model.renamedTo}</p>}
            </div>
            {categoryImages[item.category] && (
              <img
                className="program-detail-category-image"
                src={`/program-category-icons/${categoryImages[item.category]}`}
                width="104"
                height="104"
                alt=""
              />
            )}
          </div>
        </header>
        <dl className="program-overview-metadata">
          {model.metadata.map((entry) => {
            const MetadataIcon = metadataIcons[entry.label] || Info;
            return (
              <div className="program-metadata-item" key={entry.label}>
                <dt>
                  <span className="program-metadata-icon" aria-hidden="true">
                    <MetadataIcon size={22} weight="regular" />
                  </span>
                  {entry.label}
                </dt>
                <dd>{entry.value}</dd>
              </div>
            );
          })}
        </dl>
        <ProgramActions model={model} item={item} saved={saved} save={save} />
        <article className="program-detail-content">
          {model.notices.map((notice, index) => (
            <div
              className={`program-detail-notice program-notice-${notice.status}`}
              key={index}
            >
              <Info size={20} aria-hidden="true" />
              <div>
                <strong>{informationLabels[notice.status]}</strong>
                <p>{notice.text}</p>
              </div>
            </div>
          ))}
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <ProgramSection section={section} />
              {section.id === "persyaratan" && !requirementsView && (
                <a
                  className="program-requirements-link"
                  href={`${detailUrl(item)}/persyaratan`}
                >
                  Periksa persyaratan secara rinci <ArrowRight size={16} />
                </a>
              )}
            </React.Fragment>
          ))}
          {!requirementsView && (
            <ProgramPeriods registration={model.registration} />
          )}
          {evaluation && (
            <section className="program-detail-section personal-rule-check">
              <h2>Berdasarkan informasi profilmu</h2>
              <p>{evaluation.status}</p>
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
              <p>Hasil ini bukan penetapan kelayakan atau penerimaan.</p>
              <a href="/profil/edit">Perbarui informasi profil</a>
            </section>
          )}
          <ProgramSources sources={model.sources} agency={item.agency} />
          {guides.length > 0 && (
            <section className="program-detail-section program-related-guides">
              <h2>Panduan terkait</h2>
              {guides.map((guide) => (
                <div key={guide.id}>
                  <a href={detailUrl(findItem(guide.id))}>
                    {findItem(guide.id).name} <ArrowRight size={16} />
                  </a>
                  <p>{guide.reason}</p>
                </div>
              ))}
            </section>
          )}
          <a
            className="text-link program-detail-back"
            href={requirementsView ? detailUrl(item) : "/program"}
          >
            <ArrowLeft size={17} />
            {requirementsView
              ? "Kembali ke informasi program"
              : "Kembali ke Kenali Hakmu"}
          </a>
        </article>
      </div>
    </div>
  );
}
