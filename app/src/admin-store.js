import { catalog, replacePublishedContent, programCategories, serviceCategories } from "./data.js";
import { programDetailConfigs } from "./program-detail-config.ts";
import { isIsoDate, todayInJakarta } from "./program-timeline.js";
import { preparationItems } from "./preparation-model.js";
import { getAdminSession } from "./admin-auth-client.js";

// Frontend-only admin workspace. No production identity or authorization is implied.
const STORE_KEY = "hakkita-admin-workflow-demo:v1";
const listeners = new Set();
const copy = (value) => JSON.parse(JSON.stringify(value));
const equal = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const notify = () => listeners.forEach((listener) => listener());
export const subscribeAdmin = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const fieldDefinitions = [
  ["name", "Nama", "text"], ["category", "Kategori", "category"],
  ["summary", "Deskripsi singkat", "textarea"], ["about", "Ringkasan informasi", "textarea"],
  ["agency", "Instansi / penyelenggara", "text"], ["region", "Wilayah", "text"],
  ["benefits", "Manfaat atau tujuan", "list"], ["requirements", "Persyaratan", "list"],
  ["documents", "Dokumen", "list"], ["steps", "Langkah / prosedur", "list"],
  ["timeline", "Jadwal pendaftaran", "timeline"], ["fee", "Biaya", "text"],
  ["official", "Tautan resmi", "url"],
];
export const categoriesFor = (type) => type === "program" ? programCategories : serviceCategories;
export function validSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && url.hostname.includes(".") && !/localhost|example\.(com|org|test)|\.invalid$/.test(url.hostname);
  } catch { return false; }
}
export function valueLines(value) {
  return (Array.isArray(value) ? value : []).map((entry) => typeof entry === "string" ? entry : [entry.name || entry.title, entry.condition].filter(Boolean).join(" — ")).join("\n");
}
export function displayValue(value) {
  if (value == null || value === "" || (Array.isArray(value) && !value.length)) return "Belum tersedia";
  if (Array.isArray(value)) return valueLines(value);
  if (typeof value === "object" && "periods" in value) return (value.periods || []).map((period) => `${period.label}: ${period.opensOn} – ${period.closesOn}`).join("\n") || "Belum tersedia";
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
}
function seedState() {
  return { version: 1, published: {}, history: [], proposals: [] };
}
function addPendingProgramSamples(stored) {
  if (stored.programSamplesVersion === 1) return stored;
  const foundAt = now();
  const existingIds = new Set(stored.proposals.map((entry) => entry.id));
  const samples = ["kip-kuliah", "pip", "pelatihan-vokasi"].flatMap((contentId) => {
    const item = stored.published[contentId] || catalog.find((entry) => entry.id === contentId && entry.type === "program");
    const proposalId = `review-program-${contentId}-v1`;
    if (!item || existingIds.has(proposalId) || stored.proposals.some((entry) => entry.contentId === contentId && entry.status === "pending")) return [];
    const summary = [...new Set([item.summary, item.about].filter(Boolean))].join(" ");
    if (summary === item.summary) return [];
    return [{
      id: proposalId, contentId, contentType: "program", kind: "update",
      origin: "sample_program", sample: true, status: "pending",
      title: "Pembaruan ringkasan program", foundAt,
      fields: { summary }, before: copy(item),
      sources: (item.sources || []).map((source) => ({ ...copy(source), foundAt })),
    }];
  });
  return { ...stored, programSamplesVersion: 1, proposals: [...samples, ...stored.proposals] };
}
function archiveBuiltInExamples(stored) {
  const exampleIds = new Set(["demo-new-program", "demo-program-schedule", "demo-service-requirements", ...stored.proposals.filter((entry) => entry.origin === "agent_demo").map((entry) => entry.id)]);
  const isExampleProposal = (entry) => exampleIds.has(entry.id) || entry.contentId === "demo-program-pendidikan";
  const proposals = stored.proposals.filter(isExampleProposal);
  const history = stored.history.filter((entry) => exampleIds.has(entry.proposalId) || entry.contentId === "demo-program-pendidikan");
  const published = Object.fromEntries(Object.entries(stored.published).filter(([contentId]) => {
    const latest = stored.history.find((entry) => entry.contentId === contentId && ["published", "manual"].includes(entry.activity));
    return contentId === "demo-program-pendidikan" || (latest && exampleIds.has(latest.proposalId));
  }));
  if (!proposals.length && !history.length && !Object.keys(published).length) return stored;
  // Retain original records in a separate archive rather than relabeling invented facts.
  return {
    ...stored,
    proposals: stored.proposals.filter((entry) => !isExampleProposal(entry)),
    history: stored.history.filter((entry) => !history.includes(entry)),
    published: Object.fromEntries(Object.entries(stored.published).filter(([key]) => !(key in published))),
    archivedExamples: {
      proposals: [...(stored.archivedExamples?.proposals || []), ...proposals],
      history: [...(stored.archivedExamples?.history || []), ...history],
      published: { ...(stored.archivedExamples?.published || {}), ...published },
    },
  };
}
let storageError = "";
let state = { version: 1, published: {}, history: [], proposals: [] };
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    const parsed = stored ? JSON.parse(stored) : seedState();
    if (parsed.version !== 1 || !Array.isArray(parsed.proposals) || !Array.isArray(parsed.history) || !parsed.published || typeof parsed.published !== "object") throw new Error("Format data tidak sesuai.");
    state = addPendingProgramSamples(archiveBuiltInExamples(parsed));
    if (!stored || state !== parsed) localStorage.setItem(STORE_KEY, JSON.stringify(state));
    replacePublishedContent(state.published);
  } catch {
    storageError = "Data belum dapat dimuat. Periksa ketersediaan penyimpanan, lalu coba muat ulang halaman.";
  }
}
export const getAdminSnapshot = () => state;
export const getAdminStorageError = () => storageError;
function requireAdminWorkspace() {
  if (!getAdminSession()) throw new Error("Buka halaman admin untuk melanjutkan.");
  if (storageError) throw new Error(storageError);
}
function commit(next) {
  requireAdminWorkspace();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); }
  catch { throw new Error("Perubahan belum disimpan. Penyimpanan perangkat penuh atau tidak tersedia. Coba lagi."); }
  state = next;
  replacePublishedContent(state.published);
  notify();
}
function proposalById(proposalId) {
  requireAdminWorkspace();
  const proposal = state.proposals.find((entry) => entry.id === proposalId);
  if (!proposal || proposal.status !== "pending") throw new Error("Usulan sudah diproses atau tidak ditemukan. Kembali ke antrean.");
  return proposal;
}
function entryFor(proposal) {
  const current = catalog.find((item) => item.id === proposal.contentId);
  return proposal.kind === "new" ? { ...proposal.fields, id: proposal.contentId, type: proposal.contentType } : { ...current, ...proposal.fields };
}
export function validateCandidate(item, sources, { complete = false } = {}) {
  if (!item.name?.trim()) throw new Error("Nama informasi tidak boleh kosong.");
  if (!categoriesFor(item.type).some((category) => category.id === item.category)) throw new Error("Pilih kategori yang sesuai.");
  if (item.official && !validSourceUrl(item.official)) throw new Error("Tautan resmi harus menggunakan URL HTTPS yang valid.");
  if (!sources.length || sources.some((source) => !source.label?.trim() || !validSourceUrl(source.url))) throw new Error("Lengkapi nama instansi/situs dan URL HTTPS sumber yang dapat diperiksa.");
  if (complete && (!item.summary?.trim() || !item.agency?.trim())) throw new Error("Lengkapi nama, deskripsi, kategori, penyelenggara, dan sumber sebelum publikasi.");
  for (const period of item.timeline?.periods || []) {
    if (!period.label?.trim() || !isIsoDate(period.opensOn) || !isIsoDate(period.closesOn) || period.opensOn > period.closesOn || !validSourceUrl(period.sourceUrl)) throw new Error("Lengkapi label, tanggal mulai/akhir yang sesuai, dan sumber jadwal.");
  }
  // React renders text, and stored values must remain plain content.
  if (/<\/?[a-z][^>]*>|javascript:|data:text\/html/i.test(JSON.stringify({ item, sources }))) throw new Error("Gunakan teks biasa tanpa HTML atau script.");
}
export function publicationIssue(proposal) {
  try { validateCandidate(entryFor(proposal), proposal.sources, { complete: true }); return ""; }
  catch (error) { return error.message; }
}
function log(activity, proposal, before, after, extra = {}) {
  const session = getAdminSession();
  return { id: id(), activity, proposalId: proposal.id, contentId: proposal.contentId, contentType: proposal.contentType, name: entryFor(proposal).name, admin: session.email || session.name, at: now(), before: copy(before), after: copy(after), sources: copy(proposal.sources), ...extra };
}
export function updateProposal(proposalId, fields, sources) {
  const proposal = proposalById(proposalId);
  const updated = { ...proposal, fields: copy(fields), sources: copy(sources) };
  validateCandidate(entryFor(updated), sources);
  if (equal(proposal.fields, fields) && equal(proposal.sources, sources)) return;
  const next = copy(state);
  next.proposals = next.proposals.map((entry) => entry.id === proposalId ? updated : entry);
  next.history.unshift(log("corrected", updated, proposal.fields, fields, { previousSources: copy(proposal.sources) }));
  commit(next);
}
export function createManualProposal(itemId, fields, sources) {
  requireAdminWorkspace();
  const current = catalog.find((item) => item.id === itemId);
  if (!current) throw new Error("Informasi tidak ditemukan.");
  if (!Object.keys(fields).length && equal(current.sources, sources.map(({ label, url }) => ({ label, url })))) throw new Error("Belum ada perubahan untuk diajukan.");
  validateCandidate({ ...current, ...fields }, sources);
  const proposal = { id: id(), contentId: current.id, contentType: current.type, kind: "update", origin: "manual", status: "pending", title: "Usulan perbaikan manual", foundAt: now(), fields: copy(fields), before: copy(current), sources: sources.map((source) => ({ ...copy(source), foundAt: source.foundAt || now() })) };
  commit({ ...state, proposals: [...state.proposals, proposal] });
  return proposal.id;
}
function publishedItem(proposal, current) {
  const next = { ...(current || {}), ...copy(proposal.fields), id: proposal.contentId, type: proposal.contentType };
  next.sources = proposal.sources.map(({ label, url }) => ({ label, url }));
  if ("timeline" in proposal.fields && next.timeline) next.timeline = { ...next.timeline, scheduleVerifiedOn: next.timeline.periods?.length ? todayInJakarta() : null, contentReviewedOn: todayInJakarta() };
  if (next.type === "program") {
    const config = copy(current?.detail || programDetailConfigs[next.id] || { mechanisms: ["unknown"] });
    const sourced = (value) => ({ status: "conditional", value });
    if ("summary" in proposal.fields) config.overview = next.summary;
    if ("benefits" in proposal.fields) config.benefits = sourced(next.benefits);
    if ("requirements" in proposal.fields) config.requirements = sourced([{ title: "Ketentuan peserta", items: next.requirements }]);
    if ("documents" in proposal.fields) config.documents = sourced(next.documents.map((name) => {
      const previous = config.documents?.value?.find((document) => document.name.trim().toLocaleLowerCase("id") === name.trim().toLocaleLowerCase("id"));
      const existingChecklistItem = preparationItems(current).find((document) => document.name.toLocaleLowerCase("id") === name.trim().toLocaleLowerCase("id"));
      return { ...previous, id: existingChecklistItem?.id || preparationItems({ type: "program", documents: [name] })[0].id, name, requirement: previous?.requirement || "confirm" };
    }));
    if ("steps" in proposal.fields) config.access = sourced([{ id: "utama", label: "Langkah akses", steps: next.steps.map((title) => ({ title })) }]);
    if ("official" in proposal.fields) config.action = { ...config.action, url: next.official, kind: "information" };
    if (!equal(next.sources, current?.sources || [])) config.sources = next.sources.map((source, index) => ({ id: config.sources?.find((entry) => entry.url === source.url)?.id || `admin-source-${index}`, title: source.label, url: source.url, organization: next.agency, type: "page", status: "verified", checkedOn: todayInJakarta() }));
    next.detail = config;
  }
  return { ...next, slug: next.id, description: next.summary, organizer: next.agency, primaryCategory: next.category, officialUrl: next.official, sourceReferences: next.sources, requiredDocuments: next.documents || [], applicationSteps: next.steps || [], lastUpdatedAt: now() };
}
export function publishProposal(proposalId, reviewConfirmed = false) {
  const proposal = proposalById(proposalId);
  if (!reviewConfirmed) throw new Error("Konfirmasikan pemeriksaan sumber sebelum publikasi.");
  const current = catalog.find((entry) => entry.id === proposal.contentId);
  validateCandidate(entryFor(proposal), proposal.sources, { complete: true });
  if (proposal.kind === "new" && (current || catalog.some((entry) => entry.name.toLocaleLowerCase("id") === proposal.fields.name.toLocaleLowerCase("id")))) throw new Error("Informasi dengan identitas atau nama yang sama sudah tersedia.");
  if (proposal.kind === "update") {
    if (!current) throw new Error("Informasi asal tidak ditemukan.");
    if (Object.keys(proposal.fields).some((key) => !equal(current[key], proposal.before[key]))) throw new Error("Bagian informasi ini sudah berubah sejak usulan dibuat. Buat usulan baru dari Kelola Informasi agar perbandingan tetap sesuai.");
  }
  const item = publishedItem(proposal, current);
  const next = copy(state);
  next.published[item.id] = item;
  next.proposals = next.proposals.map((entry) => entry.id === proposalId ? { ...entry, status: "published", decision: { admin: getAdminSession().email || getAdminSession().name, at: now() } } : entry);
  next.history.unshift(log(proposal.origin === "manual" ? "manual" : "published", proposal, current || null, item, { previousSources: current?.sources || [] }));
  commit(next);
}
export function rejectProposal(proposalId, reason) {
  const proposal = proposalById(proposalId);
  if (!reason.trim()) throw new Error("Tuliskan alasan penolakan.");
  const next = copy(state);
  next.proposals = next.proposals.map((entry) => entry.id === proposalId ? { ...entry, status: "rejected", decision: { admin: getAdminSession().email || getAdminSession().name, at: now(), reason: reason.trim() } } : entry);
  next.history.unshift(log("rejected", proposal, proposal.before, entryFor(proposal), { reason: reason.trim() }));
  commit(next);
}
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
  if (event.key !== STORE_KEY || !event.newValue) return;
  try {
    const next = JSON.parse(event.newValue);
    if (next.version === 1 && next.published && Array.isArray(next.proposals) && Array.isArray(next.history)) {
      state = archiveBuiltInExamples(next);
      replacePublishedContent(state.published);
      notify();
    }
  } catch { /* Ignore invalid cross-tab writes; keep the last valid state. */ }
});
