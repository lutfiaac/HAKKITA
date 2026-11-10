import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ArrowCounterClockwise, ChatCircleText, ChatsCircle, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { catalog, findItem } from "./data.js";
import { assistantPageContext, assistantSuggestions, respondToAssistant } from "./assistant-model.js";
import { detailUrl } from "./ui.jsx";

const allowedPath = (path) => path === "/" || /^\/(program|layanan|anggaran|rencanaku)(?:\/|$)/.test(path);
const externalDialogSelector = '[aria-modal="true"]:not([data-assistant-panel]),dialog[open]';

function AssistantResultCard({ item, variantId }) {
  const variant = item.variants?.find((option) => option.id === variantId);
  const href = `${detailUrl(item)}${variant ? `/${variant.id}` : ""}`;
  return (
    <article className="assistant-result-card">
      <span className="assistant-result-type">{item.type === "program" ? "Program" : "Layanan publik"}</span>
      <h3><a href={href}>{item.name}</a></h3>
      {item.summary && <p>{item.summary}</p>}
      <a className="assistant-result-link" href={href}>
        {item.type === "program" ? "Lihat program" : "Lihat panduan"} <ArrowRight size={15} aria-hidden="true" />
      </a>
    </article>
  );
}

function AssistantMessage({ message, onSend, onOpenFinder, busy }) {
  return (
    <div className={`assistant-message assistant-message-${message.role}`}>
      <span className="sr-only">{message.role === "user" ? "Kamu" : "Asisten HAKKITA"}:</span>
      <div className="assistant-bubble">
        <p>{message.text}</p>
        {message.bullets?.length > 0 && <ul>{message.bullets.map((line, index) => <li key={index}>{line}</li>)}</ul>}
        {message.note && <p className="assistant-message-note">{message.note}</p>}
      </div>
      {message.itemIds?.length > 0 && <div className="assistant-result-list">
        {message.itemIds.slice(0, 3).map((id) => {
          const item = findItem(id);
          return item ? <AssistantResultCard key={id} item={item} variantId={message.variantId} /> : null;
        })}
      </div>}
      {(message.links?.length > 0 || message.wizard) && <div className="assistant-response-actions">
        {(message.links || []).map((link) => <a key={link.href} href={link.href} {...(link.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}
        {message.wizard && <button type="button" onClick={onOpenFinder}>Cari program untukmu <ArrowRight size={14} aria-hidden="true" /></button>}
      </div>}
      {message.quickReplies?.length > 0 && <div className="assistant-quick-replies" aria-label="Pilihan jawaban">
        {message.quickReplies.map((reply) => <button key={reply.value} type="button" disabled={busy} onClick={() => onSend(reply.value)}>{reply.label}</button>)}
      </div>}
    </div>
  );
}

export function HakkitaAssistant({ path, onOpenFinder }) {
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 640px)").matches);
  const [viewport, setViewport] = useState(() => ({ height: window.visualViewport?.height || window.innerHeight, top: window.visualViewport?.offsetTop || 0 }));
  const launcher = useRef(null);
  const panel = useRef(null);
  const composer = useRef(null);
  const transcript = useRef(null);
  const nearBottom = useRef(true);
  const sending = useRef(false);
  const timer = useRef(null);
  const serial = useRef(0);
  const lastItemIds = useRef([]);
  const allowed = allowedPath(path);
  const active = open && allowed && !blocked;
  const pageContext = useMemo(() => assistantPageContext(path, catalog), [path, catalog]);

  useEffect(() => {
    const sync = () => setBlocked(Boolean(document.querySelector(externalDialogSelector)));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-modal", "open"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const sync = () => {
      setMobile(media.matches);
      setViewport({ height: window.visualViewport?.height || window.innerHeight, top: window.visualViewport?.offsetTop || 0 });
    };
    media.addEventListener("change", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (mobile) panel.current?.querySelector("button")?.focus();
    else composer.current?.focus();
  }, [active, mobile]);

  useEffect(() => {
    if (active && nearBottom.current && transcript.current)
      transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, busy, active]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function closeChat() {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }

  function newConversation() {
    if (sending.current) return;
    setMessages([]);
    setDraft("");
    lastItemIds.current = [];
    nearBottom.current = true;
    composer.current?.focus();
  }

  function sendMessage(value = draft) {
    const text = value.trim().slice(0, 600);
    if (!text || sending.current) return;
    sending.current = true;
    setBusy(true);
    setDraft("");
    nearBottom.current = true;
    setMessages((current) => [...current, { id: ++serial.current, role: "user", text }]);
    composer.current?.focus();
    const context = { items: catalog, pageContext, lastItemIds: [...lastItemIds.current] };
    timer.current = setTimeout(() => {
      let response;
      try {
        response = respondToAssistant(text, context);
      } catch {
        response = { text: "Informasi belum dapat dimuat. Coba lagi atau jelajahi katalog program dan layanan.", links: [{ label: "Jelajahi program", href: "/program" }, { label: "Lihat layanan publik", href: "/layanan" }] };
      }
      if (response.itemIds?.length) lastItemIds.current = response.itemIds;
      setMessages((current) => [...current, { ...response, id: ++serial.current, role: "assistant" }]);
      sending.current = false;
      setBusy(false);
    }, 150);
  }

  function openFinder() {
    setOpen(false);
    onOpenFinder();
  }

  function panelKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeChat();
    }
    if (event.key !== "Tab") return;
    const controls = [...panel.current.querySelectorAll('button:not(:disabled),a[href],textarea')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  if (!allowed || blocked) return null;
  const explainPageSuggestion = { label: "Jelaskan halaman yang sedang dibuka", value: "Jelaskan halaman yang sedang dibuka" };
  const suggestions = pageContext.itemId ? [
    explainPageSuggestion,
    { label: "Apa persyaratannya?", value: `Persyaratan ${findItem(pageContext.itemId).name}` },
    { label: "Dokumen yang perlu disiapkan", value: `Dokumen ${findItem(pageContext.itemId).name}` },
    { label: "Bagaimana cara mengaksesnya?", value: `Cara mengurus ${findItem(pageContext.itemId).name}` },
  ] : [explainPageSuggestion, ...assistantSuggestions.map((label) => ({ label, value: label }))];

  return (
    <aside className={`hakkita-assistant${open ? " is-open" : ""}`} aria-label="Asisten HAKKITA" style={{ "--assistant-vh": `${viewport.height}px`, "--assistant-offset": `${viewport.top}px` }}>
      {open && (
        <button className="assistant-backdrop" type="button" aria-label="Tutup Asisten HAKKITA" onClick={closeChat} />
      )}
      {open && (
        <section id="hakkita-assistant-panel" className="assistant-panel" data-assistant-panel role="dialog" aria-modal="true" aria-labelledby="assistant-heading" ref={panel} onKeyDown={panelKeyDown}>
          <header className="assistant-header">
            <span className="assistant-header-icon"><ChatsCircle size={23} aria-hidden="true" /></span>
            <div><h2 id="assistant-heading">Asisten HAKKITA</h2><p>Bantu cari program dan layanan publik</p></div>
            <div className="assistant-header-actions">
              {messages.length > 0 && <button type="button" title="Percakapan baru" aria-label="Mulai percakapan baru" disabled={busy} onClick={newConversation}><ArrowCounterClockwise size={19} /></button>}
              <button type="button" title="Tutup asisten" aria-label="Tutup asisten" onClick={closeChat}><X size={21} /></button>
            </div>
          </header>
          <div className="assistant-transcript" ref={transcript} onScroll={() => {
            const area = transcript.current;
            nearBottom.current = area.scrollHeight - area.scrollTop - area.clientHeight < 100;
          }}>
            {!messages.length ? (
              <div className="assistant-welcome">
                <h3>Ada yang bisa kami bantu?</h3>
                <p>Tanyakan program, persyaratan, atau panduan layanan yang kamu butuhkan.</p>
                <p className="assistant-context-prompt">{pageContext.prompt}</p>
                <div className="assistant-suggestions">
                  {suggestions.map((question) => <button key={question.value} type="button" onClick={() => sendMessage(question.value)}>{question.label}<ArrowUpRight size={16} aria-hidden="true" /></button>)}
                </div>
              </div>
            ) : <div className="assistant-message-list" role="log" aria-live="polite" aria-relevant="additions" aria-label="Percakapan dengan Asisten HAKKITA">
              {messages.map((message) => <AssistantMessage key={message.id} message={message} onSend={sendMessage} onOpenFinder={openFinder} busy={busy} />)}
            </div>}
            {busy && <p className="assistant-loading" role="status">Mencari di HAKKITA<span aria-hidden="true">…</span></p>}
          </div>
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <label className="sr-only" htmlFor="assistant-input">Pertanyaan untuk Asisten HAKKITA</label>
            <textarea id="assistant-input" ref={composer} rows={2} maxLength={600} value={draft} placeholder="Tulis pertanyaanmu..." onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                sendMessage();
              }
            }} />
            <button className="assistant-send" type="submit" aria-label="Kirim pesan" title="Kirim pesan" disabled={!draft.trim() || busy}><PaperPlaneTilt size={20} aria-hidden="true" /></button>
          </form>
        </section>
      )}
      <button ref={launcher} className="assistant-launcher" type="button" aria-label={open ? "Tutup Asisten HAKKITA" : "Tanya HAKKITA"} aria-expanded={open} aria-controls="hakkita-assistant-panel" onClick={() => open ? closeChat() : setOpen(true)}>
        {open ? <X size={23} aria-hidden="true" /> : <ChatCircleText size={24} aria-hidden="true" />}<span>{open ? "Tutup asisten" : "Tanya HAKKITA"}</span>
      </button>
    </aside>
  );
}
