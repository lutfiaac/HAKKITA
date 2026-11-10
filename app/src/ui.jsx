import React, { useEffect, useId, useRef, useState } from "react";
import {
  MagnifyingGlass,
  ArrowRight,
  ArrowUpRight,
  CaretRight,
  CaretDown,
  Plus,
  Minus,
  BookmarkSimple,
  X,
  GraduationCap,
  Heartbeat,
  IdentificationCard,
  Briefcase,
  Storefront,
  AirplaneTilt,
  Books,
  SteeringWheel,
  Compass,
  UsersThree,
  House,
  HandHeart,
  Receipt,
  Buildings,
  ChatText,
  ShieldCheck,
} from "@phosphor-icons/react";
import { categoryName, resultUrl, hasSavedItem } from "./data.js";
import { faqItems } from "./faq.js";
const icons = {
  GraduationCap,
  Heartbeat,
  IdentificationCard,
  Briefcase,
  Storefront,
  AirplaneTilt,
  Books,
  SteeringWheel,
  Compass,
  UsersThree,
  House,
  HandHeart,
  Receipt,
  Buildings,
  ChatText,
  ShieldCheck,
};
export function Icon({ name, ...props }) {
  const Component = icons[name] || Compass;
  return <Component aria-hidden="true" {...props} />;
}
export const detailUrl = (item) => `/${item.type}/${item.id}`;
export function hrefWith(path, values) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(values))
    if (Array.isArray(v)) {
      if (v.length) p.set(k, v.join(","));
    } else if (v) p.set(k, String(v));
  return path + (p.size ? `?${p}` : "");
}
export function Search({
  navigate,
  initial = "",
  hero = false,
  type = "",
  onSearch,
  compact = false,
}) {
  const [query, setQuery] = useState(initial);
  return (
    <form
      className={`search-form ${hero ? "hero-search" : ""}${compact ? " compact-program-search" : ""}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSearch) onSearch(query.trim());
        else
          navigate(hrefWith(type ? `/${type}` : "/cari", { q: query.trim() }));
      }}
    >
      <MagnifyingGlass
        className="search-leading"
        size={24}
        aria-hidden="true"
      />
      <label
        className="sr-only"
        htmlFor={hero ? "hero-query" : "catalog-query"}
      >
        {type === "program"
          ? "Cari nama program atau jenis bantuan"
          : type === "layanan"
            ? "Cari layanan publik"
            : "Cari program atau layanan"}
      </label>
      <input
        id={hero ? "hero-query" : "catalog-query"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          type === "program"
            ? "Temukan program yang sesuai"
            : type === "layanan"
              ? "Mau mengurus apa hari ini?"
              : "Cari program, bantuan, atau layanan publik..."
        }
        maxLength={200}
        autoComplete="off"
      />
      {query && (
        <button
          className="clear-search"
          type="button"
          onClick={() => {
            setQuery("");
            onSearch?.("");
          }}
          aria-label="Hapus pencarian"
        >
          <X />
        </button>
      )}
      <button
        className="button primary search-submit"
        type="submit"
        aria-label="Cari"
      >
        <MagnifyingGlass size={21} aria-hidden="true" />
        <span className="search-submit-label">Cari</span>
      </button>
    </form>
  );
}
export function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Jejak navigasi">
      <a href="/">Beranda</a>
      {items.map((x, i) => (
        <React.Fragment key={i}>
          <CaretRight size={13} />
          {x.href ? (
            <a href={x.href}>{x.label}</a>
          ) : (
            <span aria-current="page">{x.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
export function PageIntro({ title, subtitle, eyebrow, children }) {
  return (
    <div className="page-intro">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}
export function External({ href, children, className = "" }) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={18} aria-label="Buka tab baru" />
    </a>
  );
}
export function Empty({
  icon: Component = MagnifyingGlass,
  title,
  children,
  action,
  href,
  className = "",
  iconSize = 46,
  headingLevel = 2,
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className={`empty ${className}`.trim()}>
      <Component size={iconSize} weight="duotone" aria-hidden="true" />
      <Heading>{title}</Heading>
      <div>{children}</div>
      {action && (
        <a className="button primary" href={href}>
          {action}
          <ArrowRight size={18} />
        </a>
      )}
    </div>
  );
}
export function Card({
  item,
  save,
  plans = {},
  query = "",
  children,
  curated = false,
  summary,
  catalogCard = false,
  ctaLabel,
  serviceCatalog = false,
  returnTo = "",
}) {
  const detail = resultUrl(item, query),
    target = returnTo ? hrefWith(detail, { from: returnTo }) : detail,
    variant =
      item.variants?.find((v) => detail.endsWith(`/${v.id}`)) ||
      item.variants?.[0],
    saved = hasSavedItem(plans, item, variant?.id || "");
  if (item.type === "program") {
    const photo =
      item.category === "pendidikan"
        ? "education"
        : ["pekerjaan", "usaha"].includes(item.category)
          ? "opportunity"
          : "community";
    return (
      <article
        className={`catalog-card program-card${curated ? " curated-program-card" : ""}${catalogCard ? " catalog-program-card" : ""}`}
      >
        <img
          className="program-card-photo"
          src={`/program-${photo}.png`}
          alt=""
          loading="lazy"
          width="1200"
          height="450"
          draggable="false"
        />
        <div className="program-card-body">
          <span className="program-card-category">
            {categoryName(item.category)}
          </span>
          <h2>
            <a href={target} title={item.name}>
              {item.name}
            </a>
          </h2>
          <p className="program-card-summary">
            {summary ||
              item.summary ||
              "Lihat manfaat, persyaratan, dan panduan program di halaman detail."}
          </p>
          {children}
          <div className="card-actions">
            <a className="card-link program-card-cta" href={target}>
              {ctaLabel || (catalogCard ? "Lihat detail program" : "Lihat Program")}{" "}
              <ArrowRight size={18} />
            </a>
            {save && (
              <button
                className="icon-button bookmark-action"
                aria-label={
                  saved
                    ? `Hapus dari Rencanaku: ${item.name}`
                    : `Simpan ${item.name} ke Rencanaku`
                }
                title={saved ? "Hapus dari Rencanaku" : "Simpan ke Rencanaku"}
                aria-pressed={saved}
                onClick={() => save(item, variant?.id || "")}
              >
                <BookmarkSimple
                  size={23}
                  weight={saved ? "fill" : "regular"}
                />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }
  return (
    <article
      className={`catalog-card${serviceCatalog ? " service-catalog-card" : ""}`}
    >
      {!serviceCatalog && (
        <div className="card-meta">
          <span>{categoryName(item.category)}</span>
          <Icon name={item.icon} size={27} />
        </div>
      )}
      {!serviceCatalog && (
        <span className="information-type">
          {item.type === "program" ? "Program" : "Layanan"}
        </span>
      )}
      <h2>
        <a href={target}>{item.name}</a>
      </h2>
      {!serviceCatalog && item.agency && (
        <p className="agency">{item.agency}</p>
      )}
      <p className={serviceCatalog ? "service-card-summary" : undefined}>
        {item.summary}
      </p>
      {children}
      <div className="card-actions">
        <a className="text-link card-link" href={target}>
          {serviceCatalog
            ? "Lihat panduan"
            : item.type === "program"
              ? "Lihat Program"
              : "Lihat Panduan"}
          <ArrowRight size={19} />
        </a>
        {save && (
          <button
            className="icon-button bookmark-action"
            aria-label={
              saved
                ? `Hapus dari Rencanaku: ${item.name}`
                : `Simpan ${item.name} ke Rencanaku`
            }
            title={saved ? "Hapus dari Rencanaku" : "Simpan ke Rencanaku"}
            aria-pressed={saved}
            onClick={() => save(item, variant?.id || "", returnTo)}
          >
            <BookmarkSimple
              size={21}
              weight={saved ? "fill" : "regular"}
            />
          </button>
        )}
      </div>
    </article>
  );
}
export function FAQ({ numbered = false, minimal = false, items = faqItems }) {
  const [openIndex, setOpenIndex] = useState(null);
  const id = useId();
  if (minimal)
    return (
      <div className="faq-list minimal-faq">
        {items.map(([question, answer], index) => {
          const open = openIndex === index;
          return (
            <div
              className={`faq minimal-faq-item${open ? " is-open" : ""}`}
              key={question}
            >
              <h3>
                <button
                  id={`${id}-question-${index}`}
                  type="button"
                  aria-expanded={open}
                  aria-controls={`${id}-answer-${index}`}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span>{question}</span>
                  {open ? (
                    <Minus size={20} aria-hidden="true" />
                  ) : (
                    <Plus size={20} aria-hidden="true" />
                  )}
                </button>
              </h3>
              <div
                className="faq-answer"
                id={`${id}-answer-${index}`}
                role="region"
                aria-labelledby={`${id}-question-${index}`}
                aria-hidden={!open}
                inert={!open}
              >
                <div className="faq-answer-inner">
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  return (
    <div className="faq-list">
      {items.map(([q, a], index) => (
        <details className="faq" key={q}>
          <summary>
            {numbered ? (
              <>
                <span className="faq-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-question">{q}</span>
                <span className="faq-toggle" aria-hidden="true" />
              </>
            ) : (
              <>
                {q}
                <CaretDown size={18} />
              </>
            )}
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
export function Modal({ title, children, onClose, id = "hakkita-dialog", className = "" }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const element = ref.current;
    const focusable = () =>
      [
        ...element.querySelectorAll(
          'button,a[href],input:not([type="hidden"]),select,textarea,summary,[tabindex="0"]',
        ),
      ].filter((x) => !x.disabled && !x.closest('[hidden],[inert],[aria-hidden="true"]'));
    focusable()[0]?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function key(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key === "Tab") {
        const list = focusable(),
          first = list[0],
          last = list.at(-1);
        if (!element.contains(document.activeElement) || document.activeElement === element) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className={`modal-panel ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-label={title ? undefined : "Hasil pencarian program"}
      >
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Tutup dialog"
        >
          <X size={22} />
        </button>
        {title && <h2 id={`${id}-title`}>{title}</h2>}
        {children}
      </section>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="container page">
      <Empty
        icon={Compass}
        title="Halaman ini belum ditemukan."
        headingLevel={1}
        action="Kembali ke beranda"
        href="/"
      >
        <p>
          Periksa kembali alamatnya atau cari program dan layanan yang kamu
          butuhkan.
        </p>
        <a className="text-link" href="/cari">
          Buka pencarian <MagnifyingGlass />
        </a>
      </Empty>
    </div>
  );
}
