import { ArrowRight, Info } from "@phosphor-icons/react";
import { Breadcrumb, External, Icon, detailUrl, hrefWith } from "./ui.jsx";
import { categoryName, findItem } from "./data.js";
import { DetailActionPanel } from "./DetailActionPanel.jsx";

const validOfficialUrl = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};

function ListSection({ id, title, items }) {
  if (!items?.length) return null;
  return <section className="program-detail-section" id={id}>
    <h2>{title}</h2>
    <ul className="program-detail-list">{items.map((item, index) =>
      <li key={`${index}-${typeof item === "string" ? item : item.name}`}>
        {typeof item === "string" ? item : <>
          <strong>{item.name}</strong>
          <span className="program-document-label">{item.requirement || "Periksa ketentuan"}</span>
          {item.condition && <p>{item.condition}</p>}
        </>}
      </li>
    )}</ul>
  </section>;
}

function ServiceSteps({ steps }) {
  if (!steps?.length) return null;
  return <section className="program-detail-section" id="langkah">
    <h2>Langkah pengurusan</h2>
    <ol className="program-detail-stepper">{steps.map((step, index) =>
      <li key={`${index}-${step}`}><span className="program-step-number" aria-hidden="true">{index + 1}</span><div><p>{step}</p></div></li>
    )}</ol>
  </section>;
}

export function ServiceDetail({ item, variant, navigate, saved, save, serviceReturn }) {
  const selected = variant || item;
  const hasVariants = Boolean(item.variants?.length);
  const officialUrl = validOfficialUrl(item.official);
  const sources = (item.sources || []).filter((source) => validOfficialUrl(source.url));
  const related = (item.relatedGuides || []).filter((guide) => guide.reason && findItem(guide.id)?.type === "layanan");
  const overview = item.about && item.about.trim() !== item.summary?.trim() ? item.about : "";
  const channels = selected.channel || item.channel || (item.serviceChannels || []).map((channel) => ({ online: "Online", offline: "Langsung", mixed: "Online dan langsung" }[channel] || channel)).join(" · ");
  const fee = selected.fee ?? item.fee;
  return <div className="container page program-detail-page service-detail-page">
    <Breadcrumb items={[
      { label: "Layanan Publik", href: serviceReturn || "/layanan" },
      { label: item.name, ...(variant ? { href: detailUrl(item) } : {}) },
      ...(variant ? [{ label: variant.name }] : []),
    ]} />
    <div className="program-detail-layout">
      <header className="program-detail-overview service-detail-overview">
        <div className="program-detail-identity">
          <div>
            <span className="program-detail-category">{categoryName(item.category)}</span>
            <h1>{item.name}</h1>
            {item.summary && <p className="program-detail-summary">{item.summary}</p>}
          </div>
          {item.icon && <span className="service-detail-icon"><Icon name={item.icon} size={38} weight="duotone" /></span>}
        </div>
      </header>
      <article className="program-detail-content service-detail-content">
        {overview && <section className="program-detail-section" id="ringkasan"><h2>Ringkasan layanan</h2><p>{overview}</p></section>}
        {hasVariants && <section className="program-detail-section" id="jenis-pengurusan">
          <h2>Jenis pengurusan</h2>
          <p>Pilih kondisi yang sesuai untuk melihat panduan terkait.</p>
          <div className="segmented service-variant-control" role="group" aria-label="Jenis pengurusan">
            {item.variants.map((option) => <button key={option.id} type="button" aria-pressed={variant?.id === option.id} className={variant?.id === option.id ? "selected" : ""} onClick={() => navigate(hrefWith(`${detailUrl(item)}/${option.id}`, { from: serviceReturn === "/layanan" ? "" : serviceReturn }))}>{option.name}</button>)}
          </div>
        </section>}
        <ListSection id="persyaratan" title="Persyaratan" items={[...(item.requirements || []), ...(selected !== item ? selected.requirements || [] : [])]} />
        <ListSection id="dokumen" title="Dokumen yang perlu disiapkan" items={[...(item.documents || []), ...(variant?.documents || [])].filter((document, index, all) => all.indexOf(document) === index)} />
        {fee && <section className="program-detail-section" id="biaya"><h2>Biaya resmi</h2><p>{fee}</p></section>}
        <ServiceSteps steps={selected.steps || item.steps} />
        {channels && (
          <section className="program-detail-section" id="kanal">
            <h2>Kanal pelayanan</h2>
            <p>{channels}</p>
            {item.locations?.length > 0 && (
              <a
                className="text-link"
                href={hrefWith("/layanan/lokasi", { layanan: item.id })}
              >
                Periksa kanal dan lokasi pelayanan <ArrowRight size={16} />
              </a>
            )}
          </section>
        )}
        <DetailActionPanel
          heading="Akses layanan resmi"
          description="Lanjutkan melalui kanal penyelenggara untuk memperoleh informasi terbaru atau mengakses layanan yang tersedia."
          url={officialUrl}
          label={item.actionLabel || "Lihat informasi resmi"}
          saved={saved}
          onSave={() => save(item, variant?.id || "")}
        />
        {item.note && <section className="program-detail-section"><h2>Informasi penting</h2><div className="program-detail-notice"><Info size={20} aria-hidden="true"/><p>{item.note}</p></div></section>}
        {sources.length > 0 && <section className="program-detail-section program-official-sources" id="sumber"><h2>Sumber informasi</h2>{item.agency && <p>{item.agency}</p>}<ol>{sources.map((source) => <li key={source.url}><External href={source.url}>{source.label}</External></li>)}</ol></section>}
        {related.length > 0 && <section className="program-detail-section program-related-guides"><h2>Panduan terkait</h2>{related.map((guide) => <div key={guide.id}><a href={detailUrl(findItem(guide.id))}>{findItem(guide.id).name} <ArrowRight size={16}/></a><p>{guide.reason}</p></div>)}</section>}
        {item.lifecycle?.status === "discontinued" && <div className="program-detail-notice program-notice-outdated"><Info size={20}/><p>Layanan ini sudah dihentikan. Periksa sumber resmi untuk informasi alternatif.</p></div>}
      </article>
    </div>
  </div>;
}
