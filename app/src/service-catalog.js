import { serviceCategories } from "./taxonomy.ts";

export const serviceChannelOptions = [
  ["online", "Online"],
  ["offline", "Offline"],
  ["mixed", "Online & offline"],
];
export const SERVICE_PAGE_SIZE = 12;

export function serviceReturnPath(search) {
  const value = new URLSearchParams(search).get("from");
  if (!value || !value.startsWith("/layanan")) return "/layanan";
  const parsed = new URL(value, "https://hakkita.invalid");
  return parsed.origin === "https://hakkita.invalid" &&
    parsed.pathname === "/layanan"
    ? parsed.pathname + parsed.search + parsed.hash
    : "/layanan";
}

export function normalizeSearchText(value = "") {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("id")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\b(?:e ktp|ktp el|ktpel|ektp)\b/g, "ktp")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesServiceChannel(item, channel) {
  if (!channel) return true;
  const channels = item.serviceChannels || [];
  return channel === "mixed"
    ? channels.includes("online") && channels.includes("offline")
    : channels.includes(channel);
}

export function matchesServiceRegion(item, region) {
  if (!region) return true;
  const coverage = item.regionCoverage;
  if (region === "belum-diketahui") return !coverage;
  if (!coverage) return false;
  if (region === "nasional") return coverage.level === "national";
  const [kind, province, city] = region.split(":");
  if (coverage.level === "national") return true;
  if (kind === "kota")
    return (
      coverage.provinces.includes(province) &&
      (coverage.level === "province" || coverage.cities.includes(city))
    );
  return coverage.provinces.includes(
    region === "jakarta" ? "DKI Jakarta" : region,
  );
}

// Only expose region choices backed by the guides' explicit coverage.
export function serviceRegionOptions(items) {
  const choices = new Map();
  for (const item of items) {
    const coverage = item.regionCoverage;
    if (!coverage) choices.set("belum-diketahui", "Cakupan belum diketahui");
    else if (coverage.level === "national") choices.set("nasional", "Nasional");
    else
      for (const province of coverage.provinces) {
        choices.set(province, province);
        if (coverage.level === "city")
          for (const city of coverage.cities)
            choices.set(`kota:${province}:${city}`, `${city}, ${province}`);
      }
  }
  return [...choices].sort((a, b) => a[1].localeCompare(b[1], "id"));
}

export function resolveServiceCategory(id, items) {
  if (serviceCategories.some((category) => category.id === id)) return id;
  // Mixed legacy groups are resolved from their actual records, never by
  // treating every legal or local-government service as a personal document.
  const mapped = [
    ...new Set(
      items
        .filter((item) => item.serviceSubcategory === id)
        .map((item) => item.category),
    ),
  ];
  if (mapped.length === 1) return mapped[0];
  const unambiguous = {
    imigrasi: "kependudukan",
    perizinan: "pekerjaan-usaha",
    ketenagakerjaan: "pekerjaan-usaha",
  };
  return unambiguous[id] || "";
}

export function readServiceState(search, initialCategory, items) {
  const params = new URLSearchParams(search);
  const rawCategory = params.get("kategori") ?? initialCategory ?? "";
  const category = resolveServiceCategory(rawCategory, items);
  const rawPage = params.get("halaman") || "1";
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  return {
    values: {
      q: (params.get("q") || "").trim().replace(/\s+/g, " ").slice(0, 200),
      kategori: category,
      urutan: "curated",
      halaman: Number.isSafeInteger(page) && page > 0 ? page : 1,
    },
    invalid: Boolean(rawCategory && !category),
  };
}

// Editorial priority, not a popularity ranking. Other guides retain catalog order.
const curatedPriority = new Map([
  "ktp-el", "paspor", "perpanjangan-sim", "npwp", "kartu-keluarga",
  "mobile-jkn", "skck", "sim-baru", "akta-kelahiran", "nib",
  "pajak-kendaraan-tahunan", "data-peserta-jkn",
].map((id, index) => [id, index]));

export function servicePage(items, values) {
  const sorted = [...items].sort(
    (a, b) => values.urutan === "az" || values.urutan === "za"
      ? (values.urutan === "za" ? -1 : 1) * a.name.localeCompare(b.name, "id")
      : (curatedPriority.get(a.id) ?? Infinity) - (curatedPriority.get(b.id) ?? Infinity),
  );
  const pages = Math.max(1, Math.ceil(sorted.length / SERVICE_PAGE_SIZE));
  const page = Math.min(Math.max(1, values.halaman), pages);
  return {
    items: sorted.slice(
      (page - 1) * SERVICE_PAGE_SIZE,
      page * SERVICE_PAGE_SIZE,
    ),
    page,
    pages,
  };
}
