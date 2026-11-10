import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BookmarkSimple,
  List,
  X,
  CheckCircle,
  GlobeHemisphereEast,
  CaretDown,
  SignOut,
} from "@phosphor-icons/react";
import {
  findItem,
  savedItemKey,
  legacySavedItemKey,
  subscribeCatalog,
  getCatalogRevision,
} from "./data.js";
import { AdminApp } from "./AdminPages.jsx";
import { getAdminSnapshot } from "./admin-store.js";
import { Budget, Information, Matching } from "./pages.jsx";
import { Plans, PlansGuest } from "./Plans.jsx";
import { Preparation } from "./Preparation.jsx";
import { ReminderDialog } from "./ReminderDialog.jsx";
import { hasUpcomingOfficialSchedule } from "./preparation-model.js";
import { Catalog, Detail, ServiceLocations } from "./discovery.jsx";
import { Home } from "./Home.jsx";
import { ProgramFinder } from "./ProgramFinder.jsx";
import { HakkitaAssistant } from "./HakkitaAssistant.jsx";
import { AccountProvider, useAccount } from "./AccountContext";
import {
  DemoAccountPage,
  AccountGate,
  Welcome,
  ProfilePage,
  ProfileEditor,
  Recommendations,
} from "./AccountPages.jsx";
import { safeReturnPath } from "./account-store";
import { AuthHeader, AuthPage } from "./AuthPage.jsx";
import { sessionDemoService } from "./auth-service";
import { AccountAvatar } from "./ProfilePages.jsx";
import { hrefWith, detailUrl, Modal, NotFound } from "./ui.jsx";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import "@fontsource/geist/latin-700.css";
import "@fontsource/geist/latin-800.css";
export function App() {
  return (
    <AccountProvider>
      <Shell />
    </AccountProvider>
  );
}
const aliases = {
  "/pencarian": "/cari",
  "/faq": "/bantuan",
  "/sumber-informasi": "/sumber",
};
function Shell() {
  useSyncExternalStore(subscribeCatalog, getCatalogRevision);
  const [finderOpen, setFinderOpen] = useState(false);
  const [route, setRoute] = useState(
      location.pathname + location.search + location.hash,
    ),
    [menu, setMenu] = useState(false),
    [notice, setNotice] = useState(""),
    [saveDialog, setSaveDialog] = useState(null),
    [reminderDialog, setReminderDialog] = useState(null),
    [reminderPrompt, setReminderPrompt] = useState(null),
    [pendingReminder, setPendingReminder] = useState(null),
    [pendingRemove, setPendingRemove] = useState(null);
  const {
    account,
    plans,
    setPlans,
    logout,
    storageUnavailable,
    storageLoadFailed,
    retryStorageLoad,
    sessionDemo,
    startSessionDemo,
  } = useAccount();
  const main = useRef(null),
    previousRoute = useRef(null),
    menuButton = useRef(null),
    navigation = useRef(null);
  const path = aliases[route.split(/[?#]/)[0]] || route.split(/[?#]/)[0];
  useEffect(() => setFinderOpen(false), [route]);
  const isAuthRoute = ["/masuk", "/daftar", "/lupa-kata-sandi"].includes(path);
  const navigationGuard = useRef(null),
    currentRoute = useRef(route),
    historyIndex = useRef(0),
    restoringHistory = useRef(false);
  const registerNavigationGuard = useCallback((guard) => {
    navigationGuard.current = guard;
    return () => {
      if (navigationGuard.current === guard) navigationGuard.current = null;
    };
  }, []);
  const navigate = useCallback((to, beforeNavigate) => {
    if (to === currentRoute.current && !beforeNavigate) return;
    const proceed = () => {
      const finish = () => {
        if (to !== location.pathname + location.search + location.hash)
          history.pushState({ hakkitaIndex: ++historyIndex.current }, "", to);
        currentRoute.current = to;
        setRoute(to);
      };
      const result = beforeNavigate?.();
      return result && typeof result.then === "function" ? result.then(finish) : finish();
    };
    if (navigationGuard.current) return navigationGuard.current(to, proceed);
    return proceed();
  }, []);
  useEffect(() => {
    history.replaceState(
      { ...history.state, hakkitaIndex: historyIndex.current },
      "",
      location.href,
    );
    const pop = (event) => {
      if (restoringHistory.current) {
        restoringHistory.current = false;
        return;
      }
      const to = location.pathname + location.search + location.hash;
      const targetIndex = event.state?.hakkitaIndex;
      const previousIndex = historyIndex.current;
      const proceed = () => {
        historyIndex.current = Number.isInteger(targetIndex)
          ? targetIndex
          : previousIndex + 1;
        currentRoute.current = to;
        setRoute(to);
      };
      const cancel = () => {
        if (Number.isInteger(targetIndex) && targetIndex !== previousIndex) {
          restoringHistory.current = true;
          history.go(previousIndex - targetIndex);
        } else
          history.replaceState(
            { ...history.state, hakkitaIndex: previousIndex },
            "",
            currentRoute.current,
          );
      };
      if (navigationGuard.current) navigationGuard.current(to, proceed, cancel);
      else proceed();
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    setMenu(false);
    setSaveDialog(null);
    const catalogPath = /^\/(program|layanan)(?:\/kategori\/[^/]+)?$/;
    const preserveCatalogFocus =
      previousRoute.current &&
      catalogPath.test(
        new URL(previousRoute.current, location.origin).pathname,
      ) &&
      catalogPath.test(location.pathname) &&
      new URL(previousRoute.current, location.origin).pathname.split("/")[1] ===
        location.pathname.split("/")[1];
    previousRoute.current = route;
    if (!preserveCatalogFocus) window.scrollTo(0, 0);
    const categoryTarget =
      location.pathname === "/layanan" && location.hash === "#kategori-layanan"
        ? document.getElementById("kategori-layanan")
        : null;
    if (
      (!preserveCatalogFocus || categoryTarget) &&
      !document.querySelector('[aria-modal="true"]')
    ) {
      (categoryTarget || main.current)?.focus({ preventScroll: true });
      categoryTarget?.scrollIntoView?.({ block: "start", behavior: "auto" });
    }
    document
      .querySelectorAll(".account-menu[open]")
      .forEach((x) => x.removeAttribute("open"));
  }, [route]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (
      !account ||
      new URLSearchParams(location.search).get("tab") === "admin" ||
      !(
        ["/demo/masuk", "/demo/daftar"].includes(path) ||
        (sessionDemo && ["/masuk", "/daftar"].includes(path))
      ) ||
      location.pathname !== path
    )
      return;
    const p = new URLSearchParams(location.search);
    const id = p.get("save"),
      item = id ? findItem(id) : null,
      variant = p.get("variant") || "";
    const validVariant =
      !variant || item?.variants?.some((v) => v.id === variant);
    if (item && validVariant) {
      const key = savedItemKey(item, variant);
      setPlans((previous) => ({
        ...previous,
        [key]: previous[key] || {
          done: [],
          variant,
          savedAt: Date.now(),
          goal: "",
          itemType: item.type,
        },
      }));
      setNotice(
        `${item.type === "program" ? "Program" : "Layanan"} disimpan ke Rencanaku.`,
      );
    }
    const reminderId = p.get("reminder");
    const reminderItem = reminderId ? findItem(reminderId) : null;
    const reminderVariant = p.get("reminderVariant") || "";
    if (
      reminderItem?.type === "program" &&
      (!reminderVariant ||
        reminderItem.variants?.some((v) => v.id === reminderVariant))
    ) {
      setPendingReminder({ item: reminderItem, variant: reminderVariant });
    }
    navigate(
      safeReturnPath(
        p.get("next"),
        path === "/demo/daftar"
          ? "/selamat-datang"
          : path === "/demo/masuk"
            ? "/rencanaku"
            : "/",
      ),
    );
  }, [account?.identity.id, path, route, navigate, sessionDemo]);
  useEffect(() => {
    if (!account || !pendingReminder) return;
    const expectedPath = `${detailUrl(pendingReminder.item)}${pendingReminder.variant ? `/${pendingReminder.variant}` : ""}`;
    if (path !== expectedPath) return;
    setReminderDialog(pendingReminder);
    setPendingReminder(null);
  }, [account?.identity.id, pendingReminder, path]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") {
        if (menu) {
          setMenu(false);
          menuButton.current?.focus();
        }
        document.querySelectorAll(".account-menu[open]").forEach((x) => {
          x.removeAttribute("open");
          x.querySelector("summary")?.focus();
        });
      }
      if (
        e.key === "Tab" &&
        menu &&
        window.matchMedia?.("(max-width:1150px)").matches
      ) {
        const list = [
          menuButton.current,
          ...[
            ...navigation.current.querySelectorAll("a,button,summary"),
          ].filter(
            (node) =>
              !node.closest("details:not([open])") ||
              node.tagName === "SUMMARY",
          ),
        ];
        const first = list[0],
          last = list.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menu]);
  useEffect(() => {
    const outside = (event) =>
      document.querySelectorAll(".account-menu[open]").forEach((element) => {
        if (!element.contains(event.target)) element.removeAttribute("open");
      });
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, []);
  function save(item, variant = "", returnTo = "") {
    variant = variant || item.variants?.[0]?.id || "";
    if (!account) {
      setSaveDialog({ item, variant, returnTo });
      return;
    }
    const key = savedItemKey(item, variant);
    const legacyKey = legacySavedItemKey(item, variant);
    const currentKey = plans[key] ? key : plans[legacyKey] ? legacyKey : "";
    if (currentKey) {
      const existing = plans[currentKey];
      if (item.type === "program" && existing?.reminder?.enabled) {
        setPendingRemove({ item, variant });
        return;
      }
      removeSavedItem(item, variant);
    } else {
      setPlans((p) => ({
        ...p,
        [key]: {
          done: [],
          variant,
          savedAt: Date.now(),
          goal: "",
          itemType: item.type,
        },
      }));
      setNotice(
        `${item.type === "program" ? "Program" : "Layanan"} disimpan ke Rencanaku.`,
      );
    }
  }
  function removeSavedItem(item, variant = "") {
    const key = savedItemKey(item, variant),
      legacyKey = legacySavedItemKey(item, variant);
    setPlans((p) => {
      const next = { ...p };
      delete next[key];
      delete next[legacyKey];
      return next;
    });
    setPendingRemove(null);
    setNotice("Dihapus dari Rencanaku.");
  }
  function openReminder(item, variant = "", returnTo = "") {
    const selectedVariant = variant || item.variants?.[0]?.id || "";
    const detailPath =
      returnTo ||
      `${detailUrl(item)}${selectedVariant ? `/${selectedVariant}` : ""}`;
    if (!account) {
      setReminderPrompt({ item, variant: selectedVariant, returnTo: detailPath });
      return;
    }
    setReminderDialog({ item, variant: selectedVariant });
  }
  function persistReminder(preferences) {
    if (!reminderDialog || !account) return;
    const { item, variant = "" } = reminderDialog;
    const key = savedItemKey(item, variant),
      legacyKey = legacySavedItemKey(item, variant);
    setPlans((previous) => {
      const existing = previous[key] || previous[legacyKey] || {
        done: [],
        variant,
        savedAt: Date.now(),
        goal: "",
      };
      const next = {
        ...previous,
        [key]: {
          ...existing,
          itemType: "program",
          variant,
          savedAt: existing.savedAt || Date.now(),
          checklist: existing.checklist || {},
          reminder: {
            enabled: true,
            schedule: Boolean(preferences.schedule),
            updates: Boolean(preferences.updates),
            updatedAt: Date.now(),
          },
        },
      };
      if (legacyKey !== key) delete next[legacyKey];
      return next;
    });
    setReminderDialog(null);
    setNotice("Pengaturan pengingat tersimpan.");
  }
  function disableReminder() {
    if (!reminderDialog) return;
    const { item, variant = "" } = reminderDialog;
    const key = savedItemKey(item, variant),
      legacyKey = legacySavedItemKey(item, variant);
    setPlans((previous) => {
      const existing = previous[key] || previous[legacyKey];
      if (!existing) return previous;
      const next = {
        ...previous,
        [key]: {
          ...existing,
          itemType: "program",
          variant,
          reminder: {
            ...existing.reminder,
            enabled: false,
            updatedAt: Date.now(),
          },
        },
      };
      if (legacyKey !== key) delete next[legacyKey];
      return next;
    });
    setReminderDialog(null);
    setNotice("Pengingat dinonaktifkan.");
  }
  const closeDialog = useCallback(() => setSaveDialog(null), []);
  function links(e) {
    const a = e.target.closest("a");
    if (
      !a ||
      e.defaultPrevented ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    )
      return;
    if (a.getAttribute("href")?.startsWith("/") && !a.target) {
      e.preventDefault();
      navigate(a.getAttribute("href"));
    }
  }
  const categoryMatch = path.match(/^\/(program|layanan)\/kategori\/([^/]+)$/),
    prepMatch = path.match(/^\/rencanaku\/(program|layanan)\/([^/]+)(?:\/([^/]+))?$/),
    detailMatch = path.match(/^\/(program|layanan)\/([^/]+)(?:\/([^/]+))?$/);
  let page;
  if (path === "/")
    page = <Home navigate={navigate} save={save} plans={plans} onOpenFinder={() => setFinderOpen(true)} />;
  else if (["/program", "/layanan", "/cari"].includes(path) || categoryMatch)
    page = (
      <Catalog
        type={categoryMatch?.[1] || (path === "/cari" ? "" : path.slice(1))}
        initialCategory={categoryMatch?.[2]}
        navigate={navigate}
        save={save}
        plans={plans}
      />
    );
  else if (path === "/program/rekomendasi")
    page = account ? (
      <Recommendations save={save} plans={plans} />
    ) : (
      <AccountGate
        title="Rekomendasi mengikuti informasi yang kamu pilih."
        next="/program/rekomendasi"
      />
    );
  else if (path === "/layanan/lokasi") page = <ServiceLocations />;
  else if (prepMatch) {
    const item = findItem(prepMatch[2]);
    const variant = prepMatch[3] || "";
    const key = item
      ? savedItemKey(item, variant)
      : `${prepMatch[1]}:${prepMatch[2]}${variant ? `:${variant}` : ""}`;
    const legacyKey = `${prepMatch[2]}${variant ? `:${variant}` : ""}`;
    const plan = plans[key] || plans[legacyKey];
    page = storageLoadFailed ? (
      <Plans
        plans={plans}
        setPlans={setPlans}
        setNotice={setNotice}
        loadError
        onRetry={retryStorageLoad}
      />
    ) : !account ? (
      <PlansGuest next={route} />
    ) : item && item.type === prepMatch[1] && plan ? (
      <Preparation
        key={`${account.identity.id}:${key}`}
        item={item}
        variantId={variant}
        plan={plan}
        setPlans={setPlans}
        onReminder={() => openReminder(item, variant)}
      />
    ) : (
      <NotFound />
    );
  } else if (detailMatch) {
    const item = findItem(detailMatch[2]);
    page =
      item && item.type === detailMatch[1] ? (
        <Detail
          key={route}
          item={item}
          variantId={detailMatch[3]}
          save={save}
          plans={plans}
          onReminder={openReminder}
          navigate={navigate}
        />
      ) : (
        <NotFound />
      );
  } else if (path === "/cocokkan") page = <Matching />;
  else if (path === "/rencanaku")
    page = storageLoadFailed ? (
      <Plans
        plans={plans}
        setPlans={setPlans}
        setNotice={setNotice}
        loadError
        onRetry={retryStorageLoad}
      />
    ) : account ? (
      <Plans
        key={account.identity.id}
        plans={plans}
        setPlans={setPlans}
        setNotice={setNotice}
      />
    ) : (
      <PlansGuest />
    );
  else if (path === "/anggaran") page = <Budget />;
  else if (["/masuk", "/daftar"].includes(path))
    page = (
      <AuthPage
        key={path}
        mode={path.slice(1)}
        service={sessionDemoService}
        onDemoAuthenticated={startSessionDemo}
        navigate={navigate}
      />
    );
  else if (path === "/lupa-kata-sandi")
    page = <AuthPage mode="pemulihan" service={sessionDemoService} />;
  else if (["/demo/masuk", "/demo/daftar"].includes(path))
    page = (
      <DemoAccountPage key={path} mode={path.split("/")[2]} />
    );
  else if (path === "/selamat-datang")
    page = account ? <Welcome /> : <AccountGate next="/selamat-datang" />;
  else if (path === "/profil")
    page = account ? (
      <ProfilePage navigate={navigate} />
    ) : (
      <AccountGate title="Profilmu membantu memberi arah." next="/profil" />
    );
  else if (path === "/profil/edit")
    page = account ? (
      <ProfileEditor
        key={account.identity.id}
        navigate={navigate}
        registerNavigationGuard={registerNavigationGuard}
      />
    ) : (
      <AccountGate
        title="Lengkapi profil sesuai kebutuhanmu."
        next="/profil/edit"
      />
    );
  else if (["/tentang", "/sumber", "/bantuan", "/privasi"].includes(path))
    page = <Information path={path} />;
  else page = <NotFound />;
  const hideFooter =
    isAuthRoute ||
    path.startsWith("/demo/") ||
    path.startsWith("/rencanaku") ||
    [
      "/masuk",
      "/daftar",
      "/selamat-datang",
      "/profil",
      "/profil/edit",
      "/program/rekomendasi",
    ].includes(path);
  useEffect(() => {
    document.title = `${document.querySelector("h1")?.textContent || "Membuka Akses, Menuntun Langkah."} | Hakkita`;
  }, [route]);
  if (path === "/admin" || path.startsWith("/admin/")) return <AdminApp path={path} navigate={navigate} onLinkClick={links} registerNavigationGuard={registerNavigationGuard} />;
  return (
    <div
      className={menu ? "has-open-mobile-nav" : undefined}
      onClick={links}
    >
      <a className="skip-link" href="#main-content">
        Langsung ke konten
      </a>
      {isAuthRoute ? (
        <AuthHeader />
      ) : (
        <header className="site-header">
          <div className="container nav-inner">
            <a href="/" className="brand" aria-label="Hakkita, beranda">
              <img
                src="/hakkita-logo.png"
                alt="Hakkita"
                width="1983"
                height="600"
              />
            </a>
            <button
              ref={menuButton}
              className="mobile-toggle icon-button"
              onClick={() => setMenu(!menu)}
              aria-label={menu ? "Tutup navigasi" : "Buka navigasi"}
              aria-expanded={menu}
              aria-controls="main-navigation"
            >
              {menu ? <X /> : <List />}
            </button>
            <nav
              ref={navigation}
              id="main-navigation"
              aria-label="Navigasi utama"
              className={menu ? "nav-links open" : "nav-links"}
            >
              <div className="header-main-nav">
                <a
                  className={path === "/" ? "active" : ""}
                  href="/"
                  aria-current={path === "/" ? "page" : undefined}
                >
                  Beranda
                </a>
                <a
                  className={
                    path.startsWith("/program") || path === "/cocokkan"
                      ? "active"
                      : ""
                  }
                  href="/program"
                >
                  Kenali Hakmu
                </a>
                <a
                  className={path.startsWith("/layanan") ? "active" : ""}
                  href="/layanan"
                >
                  Layanan Publik
                </a>
                <a
                  className={path === "/anggaran" ? "active" : ""}
                  href="/anggaran"
                >
                  Telusuri Anggaran
                </a>
              </div>
              <div className="header-account-actions">
                <a
                  href="/rencanaku"
                  className={`plan-nav${account ? " mobile-plan-hidden" : ""}`}
                >
                  <BookmarkSimple size={18} /> Rencanaku
                </a>
                {account ? (
                  <details
                    className="account-menu"
                    open={Boolean(menu && window.innerWidth <= 640)}
                  >
                    <summary aria-label="Menu profil">
                      <AccountAvatar
                        name={account.identity.displayName}
                        email={account.identity.email}
                      />
                      <CaretDown size={13} />
                    </summary>
                    <div>
                      <div className="account-dropdown-identity">
                        <AccountAvatar
                          name={account.identity.displayName}
                          email={account.identity.email}
                        />
                        <div>
                          <strong>
                            {account.identity.displayName ||
                              account.identity.email}
                          </strong>
                          <span>{account.identity.email}</span>
                        </div>
                      </div>
                      <div className="account-dropdown-nav">
                        <a href="/profil">Profil Saya</a>
                        <a href="/rencanaku">Rencanaku</a>
                      </div>
                      <button
                        className="account-dropdown-logout"
                        onClick={() => {
                          navigate("/", () => {
                            logout();
                            setNotice("Kamu sudah keluar dari akun.");
                          });
                        }}
                      >
                        Keluar <SignOut size={17} />
                      </button>
                    </div>
                  </details>
                ) : (
                  <a href="/masuk" className="button primary account-nav">
                    Masuk
                  </a>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}
      <main
        id="main-content"
        className={isAuthRoute ? "auth-main" : undefined}
        ref={main}
        tabIndex={-1}
      >
        {Object.keys(getAdminSnapshot().published).length > 0 && !isAuthRoute && <div className="public-admin-demo-note" role="status">Katalog simulasi lokal · Memuat perubahan yang dipublikasikan melalui menu admin di browser ini.</div>}
        {storageUnavailable && (
          <div className="container storage-warning" role="status">
            Penyimpanan perangkat tidak tersedia. Informasi akun dan rencana
            hanya bertahan selama halaman terbuka.
          </div>
        )}
        {page}
      </main>
      {!hideFooter && <Footer />}
      {finderOpen && (
        <ProgramFinder modal save={save} plans={plans} onClose={() => setFinderOpen(false)} />
      )}
      <HakkitaAssistant path={path} onOpenFinder={() => setFinderOpen(true)} />
      {notice && (
        <div role="status" className="toast">
          <CheckCircle size={22} weight="fill" />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Tutup notifikasi">
            <X />
          </button>
        </div>
      )}
      {saveDialog && (
        <Modal
          title="Simpan ke Rencanaku"
          onClose={closeDialog}
        >
          <p>
            Masuk atau buat akun untuk menyimpan program dan layanan agar mudah
            ditemukan kembali.
          </p>
          <div className="inline-actions">
            <a
              className="button primary"
              href={hrefWith("/masuk", {
                next:
                  saveDialog.returnTo ||
                  detailUrl(saveDialog.item) +
                    (saveDialog.variant ? `/${saveDialog.variant}` : ""),
                save: saveDialog.item.id,
                variant: saveDialog.variant,
              })}
            >
              Masuk / Daftar <ArrowRight size={18} />
            </a>
            <button className="button secondary" onClick={closeDialog}>
              Nanti saja
            </button>
          </div>
        </Modal>
      )}
      {reminderPrompt && (
        <Modal
          title="Masuk untuk mendapatkan pengingat"
          onClose={() => setReminderPrompt(null)}
          id="reminder-login-dialog"
        >
          <p>Masuk atau buat akun HAKKITA agar kamu bisa mendapatkan pengingat program melalui email.</p>
          <div className="inline-actions">
            <a
              className="button primary"
              href={hrefWith("/masuk", {
                next: reminderPrompt.returnTo,
                reminder: reminderPrompt.item.id,
                reminderVariant: reminderPrompt.variant,
              })}
            >
              Masuk / Daftar <ArrowRight size={18} />
            </a>
            <button className="button secondary" onClick={() => setReminderPrompt(null)}>
              Nanti saja
            </button>
          </div>
        </Modal>
      )}
      {reminderDialog && (
        <ReminderDialog
          key={`${reminderDialog.item.id}:${reminderDialog.variant}`}
          item={reminderDialog.item}
          email={account?.identity.email || ""}
          reminder={
            plans[savedItemKey(reminderDialog.item, reminderDialog.variant)]?.reminder ||
            plans[legacySavedItemKey(reminderDialog.item, reminderDialog.variant)]?.reminder
          }
          scheduleAvailable={hasUpcomingOfficialSchedule(reminderDialog.item)}
          onSave={persistReminder}
          onDisable={disableReminder}
          onClose={() => setReminderDialog(null)}
        />
      )}
      {pendingRemove && (
        <Modal
          title="Hapus program dari Rencanaku?"
          onClose={() => setPendingRemove(null)}
          id="remove-reminder-confirmation"
        >
          <p>Program ini akan dihapus dari daftar tersimpan dan pengingatnya akan dinonaktifkan.</p>
          <div className="inline-actions">
            <button className="button primary" onClick={() => removeSavedItem(pendingRemove.item, pendingRemove.variant)}>
              Hapus program
            </button>
            <button className="button secondary" onClick={() => setPendingRemove(null)}>
              Batal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Footer() {
  return (
    <footer>
      <div className="footer-body">
        <div className="container footer-grid">
          <div>
            <a className="brand" href="/">
              <img
                src="/hakkita-logo.png"
                alt="Hakkita"
                width="1983"
                height="600"
              />
            </a>
            <p>
              Membuka Akses,
              <br />
              Menuntun Langkah.
            </p>
          </div>
          <div>
            <h3>Jelajahi Hakkita</h3>
            <a href="/program">Kenali Hakmu</a>
            <a href="/layanan">Layanan Publik</a>
            <a href="/anggaran">Telusuri Anggaran</a>
          </div>
          <div>
            <h3>Untuk kamu</h3>
            <a href="/program/rekomendasi">Rekomendasi Untukmu</a>
            <a href="/rencanaku">Rencanaku</a>
            <a href="/bantuan">FAQ</a>
          </div>
          <div>
            <h3>Tentang Hakkita</h3>
            <a href="/tentang">Tentang kami</a>
            <a href="/sumber">Sumber Informasi</a>
            <a href="/privasi">Privasi</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>&copy; 2026 Hakkita.</span>
          <span>
            <GlobeHemisphereEast size={16} /> Bahasa Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
}
