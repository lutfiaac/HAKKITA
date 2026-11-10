import { normalizeSearchText } from "./service-catalog.js";
import { normalizeProgramDetail } from "./program-detail.ts";
import { isIsoDate } from "./program-timeline.js";

const normalize = (text = "") => normalizeSearchText(String(text));
const words = (text) => normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
const contains = (text, phrase) => ` ${text} `.includes(` ${normalize(phrase)} `);
const stopWords = new Set(words("apa apakah ada aku saya kamu kami untuk yang dan atau di ke dari dengan mau ingin cari carikan tolong bantu bagaimana gimana cara membuat buat mengurus urus syarat persyaratan dokumen berapa biaya manfaat kapan jadwal daftar pendaftaran program layanan bantuan itu ini nya dong ya bisa tentang perlu adalah punya info informasi"));
const domain = /program|layanan|bantuan|beasiswa|pendidikan|syarat|dokumen|daftar|pengajuan|anggaran|pajak|pelajar|mahasiswa|kerja|usaha|kesehatan|rumah|npwp|paspor|ktp|skck|nib|pbg/;
const categories = [
  { pattern: /pendidikan|beasiswa|sekolah|kuliah|mahasiswa|pelajar/, id: "pendidikan" },
  { pattern: /pencari kerja|mencari kerja|mencari pekerjaan|karier|karir|pelatihan|vokasi|lowongan/, id: "pekerjaan" },
  { pattern: /usaha|umkm|modal|kredit/, id: "usaha" },
  { pattern: /bansos|bantuan sosial|keluarga miskin/, id: "sosial" },
  { pattern: /kesehatan|jaminan kesehatan/, id: "kesehatan" },
  { pattern: /perumahan|hunian|rumah|kpr/, id: "perumahan" },
  { pattern: /disabilitas|rentan|rehabilitasi sosial/, id: "rentan" },
];
const serviceTopics = [
  [/(?:\bktp\b|kartu tanda penduduk)/, ["ktp"]],
  [/(?:\bkk\b|kartu keluarga)/, ["kartu-keluarga"]],
  [/paspor|passport/, ["paspor"]],
  [/\bsim\b|surat izin mengemudi/, ["sim"]],
  [/npwp|wajib pajak/, ["npwp"]],
  [/\bnib\b|nomor induk berusaha/, ["nib"]],
  [/\bskck\b|catatan kepolisian/, ["skck"]],
  [/\bpbg\b|persetujuan bangunan/, ["pbg"]],
  [/bpjs|\bjkn\b/, ["jkn", "bpjs"]],
];
const missing = "Maaf, aku belum menemukan informasi tersebut di HAKKITA. Kamu bisa mencoba kata kunci lain atau melihat panduan yang tersedia.";
const outside = "Aku bisa membantu mencari informasi program dan layanan publik yang tersedia di HAKKITA. Ada program atau layanan yang ingin kamu ketahui?";
const generalLinks = [{ label: "Jelajahi program", href: "/program" }, { label: "Lihat layanan publik", href: "/layanan" }];
export const assistantSuggestions = ["Cari bantuan pendidikan", "Syarat mengurus paspor", "Cara membuat NPWP"];

export function assistantPageContext(path, items) {
  const match = path.match(/^\/(program|layanan)\/([^/]+)(?:\/([^/]+))?$/);
  const item = match && items.find((entry) => entry.id === match[2] && entry.type === match[1]);
  if (item) return { pageType: "detail", itemId: item.id, variantId: match[3] || "", prompt: `Ada yang ingin kamu tanyakan tentang ${item.name}?` };
  if (path.startsWith("/program")) return { pageType: "programs", prompt: "Butuh bantuan menemukan program yang sesuai?" };
  if (path.startsWith("/layanan")) return { pageType: "services", prompt: "Butuh bantuan mencari panduan layanan?" };
  if (path === "/anggaran") return { pageType: "budget", prompt: "Butuh bantuan memahami informasi anggaran?" };
  if (path.startsWith("/rencanaku")) return { pageType: "saved", prompt: "Butuh bantuan menemukan kembali informasi yang kamu simpan?" };
  return { pageType: "home", prompt: "Ada program atau layanan yang ingin kamu cari?" };
}

function explainPage(pageContext, items) {
  const item = pageContext.itemId && items.find((entry) => entry.id === pageContext.itemId);
  if (item) return {
    text: [item.summary, item.about].filter(Boolean).join(" ") || `Halaman ini memuat informasi HAKKITA tentang ${item.name}. Buka halaman detail untuk meninjau informasi yang tersedia dan sumber resminya.`,
    itemIds: [item.id],
  };
  const descriptions = {
    programs: { text: "Halaman ini membantu menelusuri program yang tersedia di HAKKITA dan membuka panduan detail setiap program.", links: [{ label: "Lihat program", href: "/program" }] },
    services: { text: "Halaman ini berisi panduan layanan publik. Kamu bisa mencari layanan dan membuka detail persyaratan, dokumen, atau langkah pengurusannya jika informasinya tersedia.", links: [{ label: "Lihat layanan publik", href: "/layanan" }] },
    budget: { text: "Halaman ini digunakan untuk menelusuri informasi anggaran yang tersedia. Pilih jenis anggaran, tahun, atau wilayah untuk melihat data dan sumber yang tercatat.", links: [{ label: "Telusuri anggaran", href: "/anggaran" }] },
    saved: { text: "Halaman Rencanaku mengumpulkan program dan panduan layanan yang kamu simpan agar mudah ditemukan kembali.", links: [{ label: "Buka Rencanaku", href: "/rencanaku" }] },
    home: { text: "Ini halaman utama HAKKITA. Dari sini kamu bisa menjelajahi program, mencari panduan layanan publik, dan menelusuri anggaran.", links: generalLinks },
  };
  return descriptions[pageContext.pageType] || descriptions.home;
}

function contentIntent(query) {
  if (/kelayakan|pasti (?:dapat|berhak|diterima|lolos)|memenuhi syarat|saya berhak|aku berhak|saya layak|aku layak/.test(query)) return "eligibility";
  if (/biaya|bayar|tarif|gratis/.test(query)) return "fee";
  if (/berapa lama|durasi|waktu penyelesaian/.test(query)) return "duration";
  if (/dokumen|berkas/.test(query)) return "documents";
  if (/syarat|persyaratan|ketentuan/.test(query)) return "requirements";
  if (/jadwal|kapan|tenggat|periode/.test(query)) return "schedule";
  if (/manfaat|dukungan/.test(query)) return "benefits";
  if (/kanal|resmi|sumber|link/.test(query)) return "official";
  if (/apa itu|artinya|singkatan|definisi|pengertian/.test(query)) return "definition";
  if (/cara|langkah|prosedur|bagaimana|gimana/.test(query)) return "steps";
  return "summary";
}

export function searchAssistantCatalog(query, items) {
  const text = normalize(query);
  const terms = words(text).filter((term) => term.length > 1 && !stopWords.has(term));
  const topic = serviceTopics.find(([pattern]) => pattern.test(text));
  const category = categories.find(({ pattern }) => pattern.test(text))?.id;
  const wantsService = Boolean(topic || /layanan|mengurus|urus|dokumen/.test(text));
  const target = /mahasiswa|kuliah/.test(text) ? "mahasiswa" : /pelajar|sekolah/.test(text) ? "pelajar" : /pencari kerja|mencari (?:pekerjaan|kerja)/.test(text) ? "pencari-kerja" : /umkm|usaha|modal/.test(text) ? "umkm" : "";
  return items.map((item) => {
    const title = normalize(item.name);
    const aliases = (item.aliases || []).map(normalize);
    const idWords = words(item.id).join(" ");
    const titleTerms = new Set(words([item.name, item.id, ...(item.aliases || [])].join(" ")));
    const summary = normalize(item.summary || "");
    let score = contains(text, title) || contains(text, idWords) || aliases.some((alias) => alias.length > 2 && contains(text, alias)) ? 18 : 0;
    for (const term of terms) {
      if (titleTerms.has(term)) score += 5;
      else if (words(summary).includes(term)) score += 1;
    }
    if (topic) {
      if (item.type !== "layanan") return { item, score: 0 };
      if (topic[1].some((keyword) => item.id.includes(keyword))) score += 16;
      else return { item, score: 0 };
    } else if (category) {
      if (!wantsService && item.type !== "program") return { item, score: 0 };
      if (item.category === category || item.secondaryCategories?.includes(category)) score += 6;
      if (target && item.targetGroups?.includes(target)) score += 6;
      // A category alone must not make an unrelated record look relevant.
      if (item.category !== category && !item.secondaryCategories?.includes(category) && score < 10) score = 0;
    }
    return { item, score };
  }).filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "id"));
}

function plainList(value) {
  return (Array.isArray(value) ? value : []).flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (entry?.name) return [[entry.name, entry.requirement, entry.condition].filter(Boolean).join(" — ")];
    return [];
  });
}

function programContent(item, intent) {
  const model = normalizeProgramDetail(item);
  const id = { requirements: "persyaratan", documents: "dokumen", benefits: "manfaat", steps: "cara-akses" }[intent];
  const section = model.sections.find((entry) => entry.id === id);
  const info = section?.information;
  if (!info || !["verified", "conditional"].includes(info.status) || !info.value)
    return { bullets: [], note: info?.note || "" };
  let bullets = [];
  if (section.kind === "requirements") bullets = info.value.flatMap((group) => group.items.map((value) => `${group.title}: ${value}`));
  else if (section.kind === "documents") bullets = info.value.map((doc) => [doc.name, ({ optional: "Opsional", conditional: "Sesuai kondisi", alternative: "Dokumen alternatif", confirm: "Perlu dikonfirmasi" })[doc.requirement], doc.condition, doc.alternatives?.length ? `Alternatif: ${doc.alternatives.join(" atau ")}` : "", doc.route, doc.region].filter(Boolean).join(" — "));
  else if (section.kind === "access") bullets = info.value.flatMap((route) => route.steps.map((step) => [route.label, step.title, step.description, step.condition].filter(Boolean).join(" — ")));
  else if (Array.isArray(info.value)) bullets = info.value.filter((value) => typeof value === "string");
  return { bullets, note: info.note || "" };
}

function answerAbout(item, query, intent, variantId) {
  const variant = item.variants?.find((option) => option.id === variantId || contains(query, option.id.replaceAll("-", " ")) || contains(query, option.name));
  const selected = variant || item;
  const result = { itemIds: [item.id], variantId: variant?.id || "", text: "", bullets: [], links: [] };
  if (intent === "summary") return { ...result, text: item.summary || `Lihat informasi ${item.name} melalui halaman detail.` };
  if (intent === "definition") {
    const definition = /\badalah\b|\bmerupakan\b/.test(item.about || "") ? item.about : "";
    const fullName = /\([A-Z]{2,}\)/.test(item.name) ? `Nama lengkap yang tercatat di HAKKITA: ${item.name}. Penjelasan lebih lanjut tersedia di panduan dan sumber resminya.` : "";
    return { ...result, text: definition || fullName || `Penjelasan istilah ini belum tersedia secara khusus di HAKKITA. Kamu bisa membaca panduan ${item.name} dan sumber resminya.` };
  }
  if (intent === "official") {
    result.text = `Periksa kanal dan sumber resmi untuk ${item.name}. Tujuan tautan dapat berupa informasi atau layanan sesuai penyelenggara.`;
    if (/^https:\/\//.test(item.official || "")) result.links.push({ label: "Buka kanal resmi", href: item.official });
    return result;
  }
  if (intent === "fee" || intent === "duration") {
    const value = intent === "fee" ? selected.fee ?? item.fee : item.processingTime;
    const field = intent === "fee" ? "biaya" : "waktu penyelesaian";
    return { ...result, text: typeof value === "string" && value ? `${item.name}: ${value}` : `Informasi ${field} untuk ${item.name} belum tersedia di HAKKITA. Kamu bisa memeriksa panduan dan sumber resminya.` };
  }
  if (intent === "schedule") {
    const periods = isIsoDate(item.timeline?.scheduleVerifiedOn) ? (item.timeline.periods || []).filter((period) => isIsoDate(period.opensOn) && isIsoDate(period.closesOn) && /^https:\/\//.test(period.sourceUrl || "")) : [];
    return { ...result, text: periods.length ? `Jadwal yang tercatat untuk ${item.name} (bukan konfirmasi pendaftaran sedang dibuka):` : `Jadwal terverifikasi untuk ${item.name} belum tersedia di HAKKITA. Periksa informasi terbaru melalui sumber resmi.`, bullets: periods.slice(0, 3).map((period) => `${period.label}: ${period.opensOn} sampai ${period.closesOn}.`) };
  }
  const labels = { requirements: "Persyaratan", documents: "Dokumen", benefits: "Manfaat", steps: "Langkah pengurusan" };
  if (item.type === "layanan" && item.variants?.length && !variant && ["requirements", "documents", "steps"].includes(intent))
    return { ...result, text: `Pilih jenis pengurusan ${item.name} agar informasinya sesuai dengan kondisimu.`, quickReplies: item.variants.map((option) => ({ label: option.name, value: `${labels[intent]} ${item.name} ${option.name}` })) };
  const content = item.type === "program" ? programContent(item, intent) : {
    bullets: plainList([...(item[intent] || []), ...(variant?.[intent] || [])]), note: "",
  };
  const unique = [...new Set(content.bullets)];
  result.text = unique.length ? `${labels[intent]} ${item.name}${variant ? ` — ${variant.name}` : ""} yang tercantum di HAKKITA:` : `Informasi ${labels[intent]?.toLowerCase() || "ini"} untuk ${item.name} belum lengkap di HAKKITA. Periksa detail dan sumber resminya.`;
  result.bullets = unique.slice(0, 3);
  result.note = [content.note, item.type === "layanan" && item.variants?.length && !variant ? "Ketentuan berbeda menurut jenis pengurusan. Pilih kondisi yang sesuai di halaman panduan." : "", unique.length > 3 ? "Daftar lengkap tersedia pada halaman detail." : ""].filter(Boolean).join(" ");
  return result;
}

export function respondToAssistant(message, { items, pageContext = {}, lastItemIds = [] } = {}) {
  if (!Array.isArray(items) || !items.length) return { text: "Katalog HAKKITA belum dapat dimuat. Coba lagi atau jelajahi halaman program dan layanan.", links: generalLinks };
  const query = normalize(message);
  if (/^(jelaskan halaman( yang sedang dibuka| ini)?|apa isi halaman ini|ringkas halaman ini)$/.test(query))
    return explainPage(pageContext, items);
  const intent = contentIntent(query);
  if (intent === "eligibility") {
    const named = searchAssistantCatalog(query, items).find(({ score }) => score >= 15);
    return { text: "Aku belum bisa memastikan apakah kamu memenuhi seluruh persyaratan program. Kamu bisa memeriksa ketentuannya melalui halaman detail dan sumber resmi.", itemIds: named ? [named.item.id] : lastItemIds.length ? lastItemIds.slice(0, 1) : pageContext.itemId ? [pageContext.itemId] : [], wizard: true };
  }
  if (/^(halo|hai|hi|selamat (pagi|siang|sore|malam))$/.test(query)) return { text: "Halo! Ada program atau panduan layanan yang ingin kamu cari?", quickReplies: assistantSuggestions.map((label) => ({ label, value: label })) };
  if (/^(terima kasih|makasih|thanks)$/.test(query)) return { text: "Sama-sama. Kalau ada program atau layanan lain yang ingin kamu ketahui, tanyakan di sini." };
  if (/belum tahu|bingung|program (?:apa|mana) yang (?:cocok|sesuai)|rekomendasi (?:untuk|program)|cari program untuk/.test(query)) return { text: "Kalau kamu belum tahu program yang sesuai, coba jawab beberapa pertanyaan singkat.", wizard: true };
  if (/\banggaran\b|\bapbn\b|\bapbd\b|\brealisasi\b/.test(query)) return { text: "Kamu bisa melihat data anggaran yang tersedia beserta periode dan sumber informasinya di Telusuri Anggaran. Pilih jenis anggaran, tahun, dan wilayah untuk memeriksa data yang tercatat.", links: [{ label: "Telusuri anggaran", href: "/anggaran" }] };
  if (/bantuan pendidikan/.test(query) && !/pelajar|mahasiswa|kuliah|sekolah/.test(query)) return { text: "Bantuannya untuk pelajar sekolah atau mahasiswa?", quickReplies: [{ label: "Pelajar", value: "Cari bantuan pendidikan untuk pelajar" }, { label: "Mahasiswa", value: "Cari bantuan pendidikan untuk mahasiswa" }] };

  let matches = searchAssistantCatalog(message, items);
  const meaningful = words(query).filter((word) => word.length > 1 && !stopWords.has(word));
  const referenceQuestion = /\b(ini|itu|tersebut|nya)\b/.test(query) || /biayanya|syaratnya|dokumennya|caranya|jadwalnya|manfaatnya/.test(query) || meaningful.every((word) => ["lengkap", "dibutuhkan", "disiapkan", "resminya", "diperlukan", "saja", "berapa", "lama"].includes(word));
  if ((!matches.length || matches[0].score < 10) && intent !== "summary" && referenceQuestion) {
    const contextual = (lastItemIds.length ? lastItemIds : [pageContext.itemId]).filter(Boolean);
    matches = contextual.map((id) => ({ item: items.find((item) => item.id === id), score: 20 })).filter(({ item }) => item);
  }
  if (!matches.length) return { text: domain.test(query) ? missing : outside, links: generalLinks, wizard: true };

  const selected = matches.slice(0, 3).map(({ item }) => item);
  const top = matches[0];
  const isSpecific = top.score >= 15 && (!matches[1] || top.score > matches[1].score + 3);
  if (intent !== "summary" && (isSpecific || selected.length === 1))
    return answerAbout(top.item, query, intent, pageContext.itemId === top.item.id ? pageContext.variantId : "");
  if (intent !== "summary" && selected.length > 1) return { text: "Informasi program atau layanan yang mana yang ingin kamu periksa?", itemIds: selected.map((item) => item.id), quickReplies: selected.map((item) => ({ label: item.name, value: `${({ requirements: "Persyaratan", documents: "Dokumen", steps: "Cara mengurus", fee: "Biaya", duration: "Waktu penyelesaian", benefits: "Manfaat", schedule: "Jadwal", official: "Kanal resmi", definition: "Apa itu" })[intent]} ${item.name}` })) };
  return { text: selected.length === 1 ? selected[0].summary : "Berikut beberapa informasi yang bisa kamu telusuri di HAKKITA:", itemIds: selected.map((item) => item.id), links: matches.length > 3 ? [{ label: selected.every((item) => item.type === "program") ? "Lihat semua program" : "Lihat layanan publik", href: selected.every((item) => item.type === "program") ? "/program" : "/layanan" }] : [] };
}
