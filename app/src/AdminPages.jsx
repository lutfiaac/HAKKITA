import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowSquareOut, CheckCircle, ClipboardText, Files, ClockCounterClockwise, List, MagnifyingGlass, ShieldCheck, SignOut, WarningCircle } from "@phosphor-icons/react";
import { catalog } from "./data.js";
import { detailUrl, Modal } from "./ui.jsx";
import {
  subscribeAdmin, getAdminSnapshot, getAdminStorageError,
  fieldDefinitions, categoriesFor, displayValue, valueLines, publicationIssue,
  updateProposal, createManualProposal, publishProposal, rejectProposal,
} from "./admin-store.js";
import { subscribeAdminAuth, getAdminAuthSnapshot, refreshAdminSession, endAdminSession } from "./admin-auth-client.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const typeLabel = (type) => type === "program" ? "Program" : "Layanan";
const statusLabel = (status) => ({ pending: "Perlu diperiksa", published: "Dipublikasikan", rejected: "Ditolak" })[status] || status;
const activityLabel = { published: "Disetujui dan dipublikasikan", rejected: "Ditolak", corrected: "Diperbaiki", manual: "Pembaruan manual" };
const formatTime = (value) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB" : "Belum tersedia";
const pages = [
  ["/admin", "Validasi Informasi", ClipboardText],
  ["/admin/informasi", "Kelola Informasi", Files],
  ["/admin/riwayat", "Riwayat Aktivitas", ClockCounterClockwise],
];
function Badge({ children, tone = "" }) { return <span className={`admin-badge ${tone}`}>{children}</span>; }
function TypeChip({ type }) { return <span className={`admin-type-chip ${type === "program" ? "program" : "service"}`}>{typeLabel(type)}</span>; }
function Heading({ title, description, back }) {
  return <div className="admin-page-heading">{back && <a className="admin-back" href={back}><ArrowLeft size={17} /> Kembali</a>}<h1>{title}</h1>{description && <p>{description}</p>}</div>;
}
function Empty({ title, children }) { return <div className="admin-empty"><CheckCircle size={34} aria-hidden="true" /><h2>{title}</h2><p>{children}</p></div>; }
function Filters({ query, setQuery, type, setType, finding, setFinding, activity, setActivity }) {
  return <div className="admin-filters">
    <label className="admin-search"><span className="sr-only">Cari nama program atau layanan</span><MagnifyingGlass size={19} aria-hidden="true" /><input type="search" placeholder="Cari nama program atau layanan" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    {setType && <label><span className="sr-only">Jenis informasi</span><select aria-label="Jenis informasi" value={type} onChange={(event) => setType(event.target.value)}><option value="">Semua jenis</option><option value="program">Program</option><option value="layanan">Layanan</option></select></label>}
    {setFinding && <label><span className="sr-only">Jenis temuan</span><select aria-label="Jenis temuan" value={finding} onChange={(event) => setFinding(event.target.value)}><option value="">Semua temuan</option><option value="new">Informasi baru</option><option value="update">Pembaruan</option></select></label>}
    {setActivity && <label><span className="sr-only">Aktivitas</span><select aria-label="Aktivitas" value={activity} onChange={(event) => setActivity(event.target.value)}><option value="">Semua aktivitas</option>{Object.entries(activityLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>}
  </div>;
}
function DataTable({ headings, rows }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{rows.map(({ id, cells }) => <tr key={id}>{cells.map((cell, index) => <td key={headings[index]} data-label={headings[index]}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
function PaginatedTable({ headings, rows }) {
  const [page, setPage] = useState(1);
  const signature = rows.map((row) => row.id).join("|");
  useEffect(() => setPage(1), [signature]);
  const total = Math.ceil(rows.length / 10);
  const current = Math.max(1, Math.min(page, total));
  return <><DataTable headings={headings} rows={rows.slice((current - 1) * 10, current * 10)} />{total > 1 && <div className="admin-pagination"><button className="button secondary" disabled={current === 1} onClick={() => setPage(current - 1)}>Sebelumnya</button><span>Halaman {current} dari {total}</span><button className="button secondary" disabled={current === total} onClick={() => setPage(current + 1)}>Berikutnya</button></div>}</>;
}
function useFilters() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  return { query, setQuery, type, setType, matches: (name, itemType) => (!type || type === itemType) && name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")) };
}
function ValidationQueue({ state }) {
  const filters = useFilters();
  const [finding, setFinding] = useState("");
  const queue = state.proposals.filter((proposal) => proposal.status === "pending");
  const filtered = queue.filter((proposal) => filters.matches(proposal.fields.name || proposal.before?.name || "", proposal.contentType) && (!finding || finding === proposal.kind));
  return <>
    <Heading title="Validasi Informasi" description="Periksa informasi yang ditemukan sebelum ditampilkan di HAKKITA." />
    <div className="admin-metrics">{[["Perlu diperiksa", queue.length], ["Informasi baru", queue.filter((entry) => entry.kind === "new").length], ["Pembaruan", queue.filter((entry) => entry.kind === "update").length]].map(([label, count]) => <div key={label}><span>{label}</span><strong>{count}</strong></div>)}</div>
    <Filters {...filters} finding={finding} setFinding={setFinding} />
    {!queue.length ? <Empty title="Semua informasi sudah diperiksa">Belum ada temuan baru yang memerlukan validasi.</Empty> : !filtered.length ? <Empty title="Tidak ada hasil yang sesuai">Coba ubah kata kunci atau filter pilihanmu.</Empty> : <PaginatedTable headings={["Nama informasi", "Jenis", "Temuan", "Ringkasan temuan", "Waktu ditemukan", "Aksi"]} rows={filtered.map((proposal) => ({ id: proposal.id, cells: [<strong>{proposal.fields.name || proposal.before?.name}</strong>, <TypeChip type={proposal.contentType} />, <Badge>{proposal.kind === "new" ? "Informasi baru" : "Pembaruan"}</Badge>, <><span>{proposal.title}</span>{["timeline", "requirements", "fee", "official"].some((key) => key in proposal.fields) && <small className="admin-priority"><WarningCircle size={14} /> Perubahan penting</small>}</>, formatTime(proposal.foundAt), <a className="admin-link" href={`/admin/validasi/${proposal.id}`}>Periksa</a>] }))} />}
  </>;
}
function Sources({ sources }) {
  return <section className="admin-section"><h2>Sumber Informasi</h2>
    {!sources?.length ? <p className="admin-error">Sumber belum tersedia. Lengkapi sumber sebelum menyetujui informasi.</p> : sources.map((source, index) => <article className="admin-source" key={`${source.url}-${index}`}>
      <div><strong>{source.label || "Nama sumber belum tersedia"}</strong><p className="admin-source-url">{source.url || "URL sumber belum tersedia"}</p><small>Ditemukan: {formatTime(source.foundAt)}</small></div>
      {/^https:\/\//.test(source.url || "") && <a className="button secondary" href={source.url} target="_blank" rel="noopener noreferrer">Buka sumber resmi <ArrowSquareOut size={17} /></a>}
      <p className="admin-source-evidence">{source.evidence ? `Bukti / kutipan: “${source.evidence}”` : "Kutipan pendukung belum tersedia. Periksa informasi pada sumber asli."}</p>
      {source.note && <p className="admin-muted">{source.note}</p>}
    </article>)}
  </section>;
}
function Value({ value, other, side }) {
  if (Array.isArray(value)) return value.length ? <ul>{value.map((entry, index) => {
    const changed = !Array.isArray(other) || !other.some((old) => same(entry, old));
    return <li key={index}>{displayValue(typeof entry === "string" ? entry : [entry])}{changed && <span className={`admin-diff-label ${side}`}>{side === "before" ? "Dihapus" : "Ditambahkan"}</span>}</li>;
  })}</ul> : <p>Belum tersedia</p>;
  return <p className="admin-value">{displayValue(value)}</p>;
}
function Comparison({ before, after, fields }) {
  const changed = fieldDefinitions.filter(([key]) => fields ? fields.includes(key) : !same(before?.[key], after?.[key]));
  return <div className="admin-comparison">{changed.map(([key, label]) => <section className="admin-diff-field" key={key}><h3>{label}</h3><div className="admin-diff-columns"><div><h4>Informasi Saat Ini</h4><Value value={before?.[key]} other={after?.[key]} side="before" /></div><div><h4>Usulan Pembaruan</h4><Value value={after?.[key]} other={before?.[key]} side="after" /></div></div></section>)}{!changed.length && <p>Tidak ada perubahan pada isi informasi. Periksa perubahan sumber di bawah.</p>}</div>;
}
function Preview({ item }) {
  return <dl className="admin-preview">{fieldDefinitions.filter(([key]) => item.type === "program" || key !== "timeline").map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{key === "category" ? categoriesFor(item.type).find((entry) => entry.id === item[key])?.name || "Belum tersedia" : displayValue(item[key])}</dd></div>)}</dl>;
}
function useUnsavedGuard(dirty, registerNavigationGuard) {
  useEffect(() => {
    if (!dirty) return;
    const unload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", unload);
    const removeGuard = registerNavigationGuard?.((_to, proceed, cancel) => {
      if (window.confirm("Perubahan belum disimpan. Tinggalkan halaman ini?")) {
        return proceed();
      }
      return cancel?.();
    });
    return () => {
      window.removeEventListener("beforeunload", unload);
      removeGuard?.();
    };
  }, [dirty, registerNavigationGuard]);
}
function Editor({ item, sources: initialSources, onSave, onCancel, registerNavigationGuard }) {
  const [draft, setDraft] = useState(() => clone(item));
  const [sources, setSources] = useState(() => clone(initialSources));
  const [error, setError] = useState("");
  const dirty = !same(draft, item) || !same(sources, initialSources);
  useUnsavedGuard(dirty, registerNavigationGuard);
  const change = (key, value) => setDraft((previous) => ({ ...previous, [key]: value }));
  const sourceChange = (index, key, value) => setSources((previous) => previous.map((source, i) => i === index ? { ...source, [key]: value } : source));
  return <form className="admin-editor" onSubmit={(event) => {
    event.preventDefault(); setError("");
    const cleanDraft = { ...draft };
    fieldDefinitions.filter(([, , kind]) => kind === "list").forEach(([key]) => {
      if (Array.isArray(draft[key]) && draft[key].every((entry) => typeof entry === "string")) cleanDraft[key] = draft[key].map((entry) => entry.trim()).filter(Boolean);
    });
    try { onSave(cleanDraft, sources); } catch (failure) { setError(failure.message); }
  }}>
    <h2>Perbaiki informasi usulan</h2><p className="admin-muted">Perbaikan disimpan sebagai usulan. Publikasi tetap memerlukan pemeriksaan dan konfirmasi.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-editor-grid">{fieldDefinitions.filter(([key]) => item.type === "program" || key !== "timeline").map(([key, label, kind]) => <div key={key} className={`admin-field ${["list", "textarea", "timeline"].includes(kind) ? "wide" : ""}`}>
      {kind === "timeline" ? <fieldset><legend>{label}</legend>{!(draft.timeline?.periods || []).length && <p className="admin-muted">Belum tersedia</p>}{(draft.timeline?.periods || []).map((period, index) => <div className="admin-period" key={index}>
        {[["label", "Label jadwal", "text"], ["opensOn", "Mulai", "date"], ["closesOn", "Berakhir", "date"], ["sourceUrl", "URL sumber jadwal", "url"]].map(([name, text, type]) => <label key={name}>{text}<input type={type} value={period[name] || ""} onChange={(event) => change("timeline", { ...draft.timeline, periods: draft.timeline.periods.map((entry, i) => i === index ? { ...entry, [name]: event.target.value } : entry) })} /></label>)}
        <button className="admin-link admin-danger" type="button" onClick={() => change("timeline", { ...draft.timeline, periods: draft.timeline.periods.filter((_, i) => i !== index) })}>Hapus jadwal</button>
      </div>)}<button className="button secondary" type="button" onClick={() => change("timeline", { ...draft.timeline, periods: [...(draft.timeline?.periods || []), { label: "", opensOn: "", closesOn: "", sourceUrl: sources[0]?.url || "" }] })}>Tambah jadwal</button></fieldset> : <>
        <label htmlFor={`admin-edit-${key}`}>{label}{["name", "summary", "agency", "category"].includes(key) ? " *" : ""}</label>
        {kind === "category" ? <select id={`admin-edit-${key}`} value={draft[key] || ""} onChange={(event) => change(key, event.target.value)}><option value="">Pilih kategori</option>{categoriesFor(item.type).map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select> : ["list", "textarea"].includes(kind) ? <textarea id={`admin-edit-${key}`} rows={3} value={kind === "list" ? valueLines(draft[key]) : draft[key] || ""} onChange={(event) => change(key, kind === "list" ? event.target.value.split("\n") : event.target.value)} /> : <input id={`admin-edit-${key}`} type={kind === "url" ? "url" : "text"} required={key === "name"} value={draft[key] || ""} onChange={(event) => change(key, event.target.value)} />}
        {kind === "list" && <small>Satu butir per baris.</small>}
      </>}
    </div>)}</div>
    <fieldset className="admin-source-editor"><legend>Sumber Informasi</legend>{sources.map((source, index) => <div className="admin-source-fields" key={index}>
      {[["label", "Nama instansi / situs", "text"], ["url", "URL sumber asli", "url"]].map(([key, label, type]) => <label key={key}>{label}<input type={type} value={source[key] || ""} required onChange={(event) => sourceChange(index, key, event.target.value)} /></label>)}
      <label>Bukti / kutipan (jika tersedia)<textarea rows={2} value={source.evidence || ""} onChange={(event) => sourceChange(index, "evidence", event.target.value)} /></label>
      <button className="admin-link admin-danger" type="button" onClick={() => setSources((previous) => previous.filter((_, i) => i !== index))}>Hapus sumber</button>
    </div>)}<button className="button secondary" type="button" onClick={() => setSources([...sources, { label: "", url: "", foundAt: new Date().toISOString(), evidence: "" }])}>Tambah sumber</button></fieldset>
    <div className="admin-actions"><button className="button primary" type="submit">Simpan perbaikan</button><button className="button secondary" type="button" onClick={() => { if (!dirty || window.confirm("Buang perubahan yang belum disimpan?")) onCancel(); }}>Batal</button></div>
  </form>;
}
function ValidationDetail({ proposal, navigate, onNotice, registerNavigationGuard }) {
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState(false);
  const [dialog, setDialog] = useState("");
  const closeDialog = useCallback(() => setDialog(""), []);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  useEffect(() => setChecked(false), [proposal?.fields, proposal?.sources]);
  if (!proposal) return <Empty title="Usulan tidak ditemukan">Kembali ke Validasi Informasi untuk melihat antrean yang tersedia.</Empty>;
  const item = { ...(proposal.before || {}), ...proposal.fields };
  const issue = publicationIssue(proposal);
  const pending = proposal.status === "pending";
  const base = proposal.before || {};
  return <>
    <Heading title={item.name} description={proposal.title} back="/admin" />
    <div className="admin-detail-meta"><TypeChip type={proposal.contentType} /><Badge>{proposal.kind === "new" ? "Informasi baru" : "Pembaruan"}</Badge><Badge tone={proposal.status}>{statusLabel(proposal.status)}</Badge><span>Ditemukan {formatTime(proposal.foundAt)}</span></div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {editing ? <Editor item={item} sources={proposal.sources} registerNavigationGuard={registerNavigationGuard} onCancel={() => setEditing(false)} onSave={(draft, sources) => {
      const fields = proposal.kind === "new" ? draft : Object.fromEntries(fieldDefinitions.filter(([key]) => !same(draft[key], base[key])).map(([key]) => [key, draft[key]]));
      updateProposal(proposal.id, fields, sources); setEditing(false); setChecked(false); onNotice("Perbaikan usulan berhasil disimpan. Informasi belum dipublikasikan.");
    }} /> : <>
      <section className="admin-section"><h2>{proposal.kind === "new" ? "Pratinjau informasi baru" : "Ringkasan perubahan"}</h2>{proposal.kind === "new" ? <Preview item={item} /> : <><Comparison before={base} after={item} fields={Object.keys(proposal.fields)} /><details className="admin-full-info"><summary>Lihat keseluruhan informasi</summary><Preview item={item} /></details></>}</section>
      <Sources sources={proposal.sources} />
      {pending && <section className="admin-action-section"><h2>Tindakan validasi</h2>{issue && <p className="admin-error"><WarningCircle size={18} /> {issue}</p>}
        <label className="admin-check"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>Saya sudah memeriksa kesesuaian informasi dengan sumber yang tersedia.</span></label>
        <div className="admin-actions"><button className="button primary" disabled={!checked || Boolean(issue)} onClick={() => { setError(""); setDialog("publish"); }}>Setujui &amp; Publikasikan</button><button className="button secondary" onClick={() => { setError(""); setEditing(true); }}>Perbaiki</button><button className="button admin-destructive" onClick={() => { setError(""); setDialog("reject"); }}>Tolak</button></div>
      </section>}
      {!pending && <p className="admin-muted">Usulan ini telah selesai diproses. Catatan keputusan tersedia di <a className="admin-link" href="/admin/riwayat">Riwayat Aktivitas</a>.</p>}
    </>}
    {dialog && <Modal id="admin-decision" title={dialog === "publish" ? "Publikasikan informasi ini?" : "Tolak usulan informasi?"} onClose={closeDialog} className="admin-confirm-dialog">
      <p>{dialog === "publish" ? "Informasi yang disetujui akan digunakan untuk memperbarui konten HAKKITA." : "Usulan yang ditolak tidak akan mengubah informasi di portal HAKKITA."}</p>
      {dialog === "reject" && <label>Alasan penolakan<textarea autoFocus rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tuliskan alasan penolakan..." maxLength={1000} /></label>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-actions"><button className="button secondary" onClick={() => setDialog("")}>Batal</button><button className={`button ${dialog === "publish" ? "primary" : "admin-destructive"}`} disabled={dialog === "reject" ? !reason.trim() : !checked || Boolean(issue)} onClick={() => {
        try {
          if (dialog === "publish") { if (!checked) return; publishProposal(proposal.id, true); } else rejectProposal(proposal.id, reason);
          onNotice(dialog === "publish" ? "Informasi berhasil dipublikasikan." : "Usulan berhasil ditolak."); setDialog(""); navigate("/admin");
        } catch (failure) { setError(failure.message); }
      }}>{dialog === "publish" ? "Ya, publikasikan" : "Tolak usulan"}</button></div>
    </Modal>}
  </>;
}
function InformationList() {
  const filters = useFilters();
  const items = catalog.filter((item) => filters.matches(item.name, item.type));
  return <><Heading title="Kelola Informasi" description="Lihat dan perbarui informasi program serta layanan yang tersedia di HAKKITA." /><Filters {...filters} />{!items.length ? <Empty title="Informasi tidak ditemukan">Coba gunakan kata kunci atau jenis informasi lain.</Empty> : <PaginatedTable headings={["Nama informasi", "Jenis", "Instansi", "Terakhir diperbarui", "Aksi"]} rows={items.map((item) => ({ id: item.id, cells: [<strong>{item.name}</strong>, <TypeChip type={item.type} />, item.agency || "Belum tersedia", item.lastUpdatedAt ? formatTime(item.lastUpdatedAt) : item.lastVerifiedAt ? `Rujukan diperiksa: ${item.lastVerifiedAt}` : "Belum tersedia", <a className="admin-link" href={`/admin/informasi/${item.id}`}>Lihat detail</a>] }))} />}</>;
}
function InformationDetail({ item, navigate, onNotice, registerNavigationGuard }) {
  const [editing, setEditing] = useState(false);
  if (!item) return <Empty title="Informasi tidak ditemukan">Kembali ke Kelola Informasi untuk melihat katalog.</Empty>;
  const sources = item.sources || [];
  return <><Heading title={item.name} back="/admin/informasi" description={`${typeLabel(item.type)} · Terakhir diperbarui: ${item.lastUpdatedAt ? formatTime(item.lastUpdatedAt) : "Waktu perubahan belum tercatat"}`} />
    {editing ? <Editor item={item} sources={sources} registerNavigationGuard={registerNavigationGuard} onCancel={() => setEditing(false)} onSave={(draft, editedSources) => {
      const fields = Object.fromEntries(fieldDefinitions.filter(([key]) => !same(draft[key], item[key])).map(([key]) => [key, draft[key]]));
      const proposalId = createManualProposal(item.id, fields, editedSources);
      setEditing(false); registerNavigationGuard?.(null); onNotice("Usulan perbaikan disimpan. Periksa ringkasan perubahan sebelum publikasi."); navigate(`/admin/validasi/${proposalId}`);
    }} /> : <><div className="admin-actions"><a href={detailUrl(item)} className="button secondary" target="_blank" rel="noopener noreferrer">Lihat di Portal <ArrowSquareOut size={17} /></a><button className="button primary" onClick={() => setEditing(true)}>Ajukan Perbaikan</button></div><section className="admin-section"><h2>Informasi terpublikasi</h2><Preview item={item} /></section><Sources sources={sources} /></>}
  </>;
}
function HistoryList({ state }) {
  const filters = useFilters();
  const [activity, setActivity] = useState("");
  const history = state.history.filter((entry) => filters.matches(entry.name, entry.contentType) && (!activity || entry.activity === activity));
  return <><Heading title="Riwayat Aktivitas" description="Lihat catatan pemeriksaan dan pembaruan informasi HAKKITA." /><Filters query={filters.query} setQuery={filters.setQuery} activity={activity} setActivity={setActivity} />{!history.length ? <Empty title={state.history.length ? "Tidak ada aktivitas yang sesuai" : "Belum ada aktivitas"}>Catatan pemeriksaan dan keputusan akan muncul di sini.</Empty> : <PaginatedTable headings={["Nama informasi", "Jenis", "Aktivitas", "Admin", "Waktu", "Aksi"]} rows={history.map((entry) => ({ id: entry.id, cells: [<strong>{entry.name}</strong>, <TypeChip type={entry.contentType} />, activityLabel[entry.activity], entry.admin, formatTime(entry.at), <a className="admin-link" href={`/admin/riwayat/${entry.id}`}>Detail</a>] }))} />}</>;
}
function HistoryDetail({ entry }) {
  if (!entry) return <Empty title="Catatan tidak ditemukan">Kembali ke Riwayat Aktivitas untuk melihat catatan keputusan.</Empty>;
  return <><Heading title={entry.name} description={activityLabel[entry.activity]} back="/admin/riwayat" /><div className="admin-detail-meta"><TypeChip type={entry.contentType} /><span>{entry.admin}</span><span>{formatTime(entry.at)}</span></div>{entry.reason && <div className="admin-rejection"><strong>Alasan penolakan</strong><p>{entry.reason}</p></div>}<section className="admin-section"><h2>{entry.activity === "rejected" ? "Usulan yang ditolak — katalog tidak berubah" : "Catatan perubahan"}</h2><Comparison before={entry.before} after={entry.after} /></section>{entry.previousSources && <Sources sources={entry.previousSources.map((source) => ({ ...source, note: `Sumber sebelum perbaikan. ${source.note || ""}` }))} />}<Sources sources={entry.sources} /></>;
}
export function AdminApp({ path, navigate, onLinkClick, registerNavigationGuard }) {
  const state = useSyncExternalStore(subscribeAdmin, getAdminSnapshot);
  const auth = useSyncExternalStore(subscribeAdminAuth, getAdminAuthSnapshot);
  const session = auth.session;
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const [notice, setNotice] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [verifiedHere, setVerifiedHere] = useState(false);
  useEffect(() => {
    let mounted = true;
    refreshAdminSession({ enter: true }).finally(() => { if (mounted) setVerifiedHere(true); });
    const refresh = () => { if (document.visibilityState !== "hidden") refreshAdminSession(); };
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { mounted = false; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  useEffect(() => {
    if (verifiedHere && auth.status === "anonymous") navigate("/masuk?tab=admin");
  }, [auth.status, verifiedHere, navigate]);
  useEffect(() => { setDrawer(false); document.getElementById("admin-main")?.focus({ preventScroll: true }); }, [path]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 4500); return () => clearTimeout(timer); }, [notice]);
  if (auth.status === "error") return <div className="admin-opening"><p role="alert">{auth.error}</p><button className="button secondary" onClick={refreshAdminSession}>Coba lagi</button><a href="/masuk?tab=admin">Kembali ke Masuk</a></div>;
  if (!session) return <div className="admin-opening" role="status">Membuka halaman admin…</div>;
  const area = path.startsWith("/admin/informasi") ? "informasi" : path.startsWith("/admin/riwayat") ? "riwayat" : "validasi";
  const navigation = <nav aria-label="Navigasi admin">{pages.map(([href, label, Icon], index) => <a key={href} href={href} aria-current={area === ["validasi", "informasi", "riwayat"][index] ? "page" : undefined}><Icon size={20} aria-hidden="true" />{label}</a>)}</nav>;
  let content;
  const proposalId = path.match(/^\/admin\/validasi\/([^/]+)$/)?.[1];
  const informationId = path.match(/^\/admin\/informasi\/([^/]+)$/)?.[1];
  const historyId = path.match(/^\/admin\/riwayat\/([^/]+)$/)?.[1];
  if (proposalId) content = <ValidationDetail key={proposalId} proposal={state.proposals.find((entry) => entry.id === proposalId)} navigate={navigate} onNotice={setNotice} registerNavigationGuard={registerNavigationGuard} />;
  else if (informationId) content = <InformationDetail key={informationId} item={catalog.find((entry) => entry.id === informationId)} navigate={navigate} onNotice={setNotice} registerNavigationGuard={registerNavigationGuard} />;
  else if (historyId) content = <HistoryDetail entry={state.history.find((entry) => entry.id === historyId)} />;
  else if (path === "/admin/informasi") content = <InformationList />;
  else if (path === "/admin/riwayat") content = <HistoryList state={state} />;
  else if (path === "/admin") content = <ValidationQueue state={state} />;
  else content = <Empty title="Halaman admin tidak ditemukan">Pilih menu di sidebar untuk melanjutkan.</Empty>;
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true); setLogoutError("");
    // Route navigation goes through the shared unsaved-edit guard.
    try { await navigate("/masuk?tab=admin", endAdminSession); } catch { setLogoutError("Sesi belum dapat ditutup. Coba lagi."); } finally { setLoggingOut(false); }
  }
  return <div className="admin-app" onClick={onLinkClick}>
    <a className="skip-link" href="#admin-main">Langsung ke konten admin</a>
    <aside className="admin-sidebar"><a href="/admin" className="admin-logo"><img src="/hakkita-logo.png" alt="HAKKITA" width="152" /></a>{navigation}<div className="admin-sidebar-account"><ShieldCheck size={27} /><strong>{session.name || "Admin HAKKITA"}</strong>{session.email && <span>{session.email}</span>}<button onClick={logout} disabled={loggingOut}><SignOut size={19} />{loggingOut ? "Keluar…" : "Keluar"}</button>{logoutError && <p role="alert">{logoutError}</p>}</div></aside>
    <div className="admin-workspace"><header className="admin-topbar"><button className="admin-menu-toggle" aria-label="Buka menu admin" onClick={() => setDrawer(true)}><List size={23} /></button><span>{pages.find((_, index) => area === ["validasi", "informasi", "riwayat"][index])?.[1]}</span><div><ShieldCheck size={19} /><span>{session.email || session.name}</span></div></header>
      <main id="admin-main" className="admin-content" tabIndex={-1}>{getAdminStorageError() ? <div className="admin-empty"><h1>Data belum dapat dimuat</h1><p className="admin-error" role="alert">{getAdminStorageError()}</p><button className="button secondary" onClick={() => window.location.reload()}>Coba muat ulang</button></div> : content}</main>
    </div>
    {drawer && <Modal id="admin-menu" title="Menu admin" onClose={closeDrawer} className="admin-mobile-menu">{navigation}<p>{session.email}</p><button className="button admin-destructive" onClick={logout} disabled={loggingOut}><SignOut size={18} />{loggingOut ? "Keluar…" : "Keluar"}</button>{logoutError && <p role="alert">{logoutError}</p>}</Modal>}
    {notice && <div className="toast" role="status">{notice}</div>}
  </div>;
}
