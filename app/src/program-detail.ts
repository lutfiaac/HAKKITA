import type {
  AccessRoute,
  BenefitValue,
  DetailSection,
  DetailSource,
  Information,
  ProgramDetailConfig,
  ProgramDetailInput,
  ProgramMechanism,
} from "./program-detail-model";
import { programDetailConfigs } from "./program-detail-config.ts";
import {
  isIsoDate,
  registrationStatus,
  todayInJakarta,
} from "./program-timeline.js";

export const mechanismLabels: Record<ProgramMechanism, string> = {
  self_registration: "Pendaftaran mandiri",
  competitive_selection: "Seleksi peserta",
  recipient_assignment: "Penetapan penerima",
  financing: "Pembiayaan kredit",
  subsidy: "Subsidi",
  assessment_referral: "Asesmen dan rujukan",
  training: "Pelatihan dan sertifikasi",
  service_delivery: "Layanan dan pendampingan",
  hybrid: "Beberapa jalur akses",
  unknown: "Mekanisme perlu dikonfirmasi",
};
export const informationLabels = {
  verified: "Rujukan tersedia",
  unverified: "Belum diverifikasi",
  unknown: "Perlu dikonfirmasi",
  not_applicable: "Tidak berlaku",
  conditional: "Mengikuti ketentuan",
  outdated: "Informasi lama",
  conflicting: "Sumber perlu dikonfirmasi",
};
export function officialUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
export function formatBenefitAmount(benefit: BenefitValue) {
  if (!Number.isFinite(benefit.amount) || benefit.amount! < 0 || !benefit.unit)
    return null;
  try {
    const options: Intl.NumberFormatOptions = benefit.currency
      ? {
          style: "currency",
          currency: benefit.currency,
          maximumFractionDigits: 0,
        }
      : {};
    const format = new Intl.NumberFormat("id-ID", options);
    let value = format.format(benefit.amount!);
    if (benefit.kind === "range") {
      if (
        !Number.isFinite(benefit.maximum) ||
        benefit.maximum! < benefit.amount!
      )
        return null;
      value += `–${format.format(benefit.maximum!)}`;
    }
    if (benefit.kind === "percentage") value += "%";
    return `${value} ${benefit.unit}`;
  } catch {
    return null;
  }
}
const strings = (value?: string[]) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value
            .filter((text) => typeof text === "string" && text.trim())
            .map((text) => text.trim()),
        ),
      ]
    : [];
const textKey = (value?: string) =>
  value
    ?.trim()
    .toLocaleLowerCase("id")
    .replace(/[.\s]+$/g, "") || "";
const sourced = <T>(value: T): Information<T> => ({
  status: "verified",
  value,
});
const unknown = <T>(note: string): Information<T> => ({
  status: "unknown",
  note,
});
export function shouldRenderSection(section: DetailSection) {
  if (section.information.status === "not_applicable") return false;
  const value = section.information.value;
  return Boolean(
    section.information.note || (Array.isArray(value) ? value.length : value),
  );
}
export function programRegistration(
  item: ProgramDetailInput,
  config: ProgramDetailConfig,
  today = todayInJakarta(),
) {
  if (["legacy", "discontinued"].includes(config.lifecycle?.value || ""))
    return null;
  if (config.registration?.status === "not_applicable") return null;
  if (
    config.registration?.value === "none" &&
    config.registration.status === "verified"
  )
    return {
      status: "none",
      periods: [],
      label: "Tidak memiliki periode pendaftaran",
    };
  if (
    config.registration &&
    ["unverified", "outdated", "conflicting"].includes(
      config.registration.status,
    )
  )
    return { status: "unknown", periods: [], label: "Belum dapat dipastikan" };
  const periods = isIsoDate(item.timeline?.scheduleVerifiedOn)
    ? (item.timeline?.periods || []).filter(
        (period) =>
          isIsoDate(period.opensOn) &&
          isIsoDate(period.closesOn) &&
          period.opensOn <= period.closesOn &&
          officialUrl(period.sourceUrl),
      )
    : [];
  if (periods.length)
    return {
      status: registrationStatus(item, today),
      periods,
      label: {
        open: "Sedang dibuka",
        upcoming: "Akan dibuka",
        closed: "Sudah ditutup",
        unknown: "Belum dapat dipastikan",
      }[registrationStatus(item, today)],
    };
  // No guessed year, deadline, quota, or individual application status.
  return {
    status:
      config.registration?.value === "unannounced" ? "unannounced" : "unknown",
    periods: [],
    label:
      config.registration?.value === "unannounced"
        ? "Belum diumumkan"
        : "Belum dapat dipastikan",
  };
}
export function normalizeProgramDetail(
  item: ProgramDetailInput,
  override?: ProgramDetailConfig,
  today = todayInJakarta(),
) {
  const config = override ||
    item.detail ||
    programDetailConfigs[item.id] || { mechanisms: ["unknown"] };
  const mechanisms = [
    ...new Set(
      config.mechanisms.filter((mechanism) => mechanism in mechanismLabels),
    ),
  ];
  if (!mechanisms.length) mechanisms.push("unknown");
  const overview = config.overview || item.summary || "";
  const sources: DetailSource[] = (
    config.sources ||
    (item.sources || []).map((source, index) => ({
      id: `source-${index + 1}`,
      title: source.label,
      url: source.url,
      organization: item.agency,
      type: /\.pdf(?:[?#]|$)/i.test(source.url)
        ? ("pdf" as const)
        : ("page" as const),
      checkedOn: isIsoDate(item.timeline?.contentReviewedOn)
        ? item.timeline!.contentReviewedOn
        : undefined,
      // A stored review date is not a live link-availability check.
      status: "verified" as const,
    }))
  ).filter((source) => officialUrl(source.url));
  const sourceIds = sources.map((source) => source.id);
  const benefits = strings(item.benefits).filter(
    (text) =>
      textKey(text) !== textKey(overview) &&
      textKey(text) !== textKey(item.about),
  );
  const documents = strings(item.documents);
  const steps = strings(item.steps);
  const candidates: DetailSection[] = [
    {
      id: "tentang",
      title: "Tentang program",
      kind: "text",
      information:
        item.about && textKey(item.about) !== textKey(overview)
          ? sourced(item.about)
          : { status: "not_applicable" },
    },
    {
      id: "manfaat",
      title: "Manfaat dan bentuk dukungan",
      kind: "list",
      information:
        config.benefits ||
        (benefits.length
          ? sourced(benefits)
          : unknown(
              "Rincian manfaat perlu dikonfirmasi melalui penyelenggara.",
            )),
    },
    {
      id: "besaran",
      title: "Besaran dan ketentuan manfaat",
      kind: "values",
      information: config.benefitValues || { status: "not_applicable" },
    },
    {
      id: "sasaran",
      title: "Sasaran program",
      kind: "list",
      information:
        config.targets ||
        unknown("Kelompok sasaran perlu dikonfirmasi melalui sumber resmi."),
    },
    {
      id: "persyaratan",
      title: "Persyaratan dan ketentuan",
      kind: "requirements",
      information:
        config.requirements ||
        (strings(item.requirements).length
          ? sourced([
              { title: "Ketentuan peserta", items: strings(item.requirements) },
            ])
          : unknown(
              "Persyaratan rinci perlu dikonfirmasi melalui penyelenggara program.",
            )),
    },
    {
      id: "dokumen",
      title: "Dokumen yang perlu disiapkan",
      kind: "documents",
      information:
        config.documents ||
        (documents.length
          ? sourced(
              documents.map((name, index) => ({
                id: `document-${index}`,
                name,
                requirement: "confirm" as const,
              })),
            )
          : unknown(
              "Daftar dokumen perlu dikonfirmasi melalui penyelenggara program.",
            )),
    },
    {
      id: "cara-akses",
      title: "Cara mengakses program",
      kind: "access",
      information:
        config.access ||
        (steps.length
          ? sourced<AccessRoute[]>([
              {
                id: "utama",
                label: "Jalur akses program",
                steps: steps.map((title) => ({ title })),
              },
            ])
          : unknown(
              "Jalur akses belum dapat dipastikan. Konfirmasikan kepada penyelenggara sebelum menyiapkan pengajuan.",
            )),
    },
  ];
  const sections = candidates.filter(shouldRenderSection).map((section) => ({
    ...section,
    information: {
      ...section.information,
      sourceIds: section.information.sourceIds || sourceIds,
    },
  })) as DetailSection[];
  const registration = programRegistration(item, config, today);
  const configuredAction = config.action;
  let url = officialUrl(configuredAction?.url || item.official);
  const actionSource = sources.find((source) => source.url === url);
  if (
    configuredAction?.status === "outdated" ||
    configuredAction?.status === "conflicting" ||
    actionSource?.status === "outdated" ||
    actionSource?.status === "conflicting" ||
    actionSource?.availability === "unavailable"
  )
    url = null;
  const kind =
    configuredAction?.status === "unverified" ||
    actionSource?.status === "unverified"
      ? "information"
      : configuredAction?.kind || "information";
  const canRegister =
    kind === "registration" &&
    registration?.status === "open" &&
    config.lifecycle?.status !== "outdated" &&
    !["legacy", "discontinued"].includes(config.lifecycle?.value || "") &&
    (!configuredAction?.status || configuredAction.status === "verified") &&
    (!actionSource || actionSource.status === "verified");
  const actionLabel = {
    registration: canRegister
      ? "Buka pendaftaran resmi"
      : "Lihat informasi resmi",
    financing: "Lihat cara pengajuan",
    guide: "Lihat panduan resmi",
    information: "Lihat informasi resmi",
    status: "Cek melalui kanal resmi",
    contact: "Hubungi penyelenggara",
  }[kind];
  const notices = [...(config.notices || [])];
  if (config.lifecycle?.note)
    notices.unshift({
      status: config.lifecycle.status,
      text: config.lifecycle.note,
    });
  if (
    item.note &&
    !notices.some((notice) => textKey(notice.text) === textKey(item.note)) &&
    !["kur", "flpp", "kaltim-tuntas", "berau-cerdas"].includes(item.id)
  )
    notices.push({ status: "conditional", text: item.note });
  return {
    overview,
    mechanisms,
    metadata: [
      ...(config.metadata || [
        {
          label: "Mekanisme akses",
          value: mechanisms
            .map((mechanism) => mechanismLabels[mechanism])
            .join(" · "),
        },
      ]),
      ...(item.region
        ? [{ label: "Cakupan wilayah", value: item.region }]
        : []),
      ...(item.agency ? [{ label: "Penyelenggara", value: item.agency }] : []),
    ]
      .filter((entry) => entry.value?.trim())
      .slice(0, 4),
    sections,
    registration,
    sources,
    notices,
    action: {
      url,
      label: actionLabel,
      heading: configuredAction?.heading || "Lanjutkan melalui penyelenggara",
      description:
        configuredAction?.description ||
        "Periksa informasi dan jalur akses terbaru pada kanal resmi penyelenggara.",
    },
    relatedGuides: config.relatedGuides || [],
    renamedTo: config.renamedTo,
  };
}
