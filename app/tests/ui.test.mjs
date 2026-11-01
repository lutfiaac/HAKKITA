import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { ACCOUNT_KEY } from "../src/account-store.ts";
import { SESSION_DEMO_KEY } from "../src/session-demo.ts";
import { catalog, programs } from "../src/data.js";
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://localhost/" },
);
for (const key of [
  "window",
  "document",
  "location",
  "history",
  "localStorage",
  "HTMLElement",
  "Event",
  "MouseEvent",
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
let mobile = false,
  reducedMotion = false,
  pageHidden = false;
const mediaListeners = new Map();
const carouselTimers = new Map();
let intervalId = 0;
Object.defineProperty(document, "hidden", {
  configurable: true,
  get: () => pageHidden,
});
window.setInterval = (callback, delay) => {
  const id = ++intervalId;
  carouselTimers.set(id, { callback, delay });
  return id;
};
window.clearInterval = (id) => carouselTimers.delete(id);
window.matchMedia = (query) => ({
  get matches() {
    return query.includes("prefers-reduced-motion")
      ? reducedMotion
      : mobile && query.includes("max-width");
  },
  media: query,
  addEventListener(_event, callback) {
    if (!mediaListeners.has(query)) mediaListeners.set(query, new Set());
    mediaListeners.get(query).add(callback);
  },
  removeEventListener(_event, callback) {
    mediaListeners.get(query)?.delete(callback);
  },
});
const { createRoot } = await import("react-dom/client");
const { App } = await import("../.qa/app.mjs");
const { ProgramCarousel } = await import("../.qa/carousel.mjs");
const { ProgramDetail } = await import("../.qa/program-detail.mjs");
const { AuthPage } = await import("../.qa/auth-page.mjs");
const { AuthServiceError } = await import("../src/auth-service.ts");
const { detailFixtures } = await import("./program-detail-fixtures.mjs");
let root;
const consoleErrors = [];
const originalError = console.error;
const text = () => document.querySelector("main").textContent;
const button = (label) =>
  [...document.querySelectorAll("button")].find(
    (x) => x.textContent.trim() === label,
  );
const anchor = (label) =>
  [...document.querySelectorAll("a")].find(
    (x) => x.textContent.trim() === label,
  );
const account = (id = "one", profile = {}, plans = {}) => ({
  identity: {
    id,
    displayName: id === "one" ? "Sahabat Satu" : "Sahabat Dua",
    email: `${id}@example.test`,
  },
  profile,
  plans,
});
const seed = (active = "one", profile = {}, plans = {}) => ({
  activeId: active,
  accounts: { one: account("one", profile, plans), two: account("two") },
});
async function mount(path = "/", data = null) {
  history.replaceState({}, "", path);
  localStorage.clear();
  if (data !== null)
    localStorage.setItem(
      ACCOUNT_KEY,
      typeof data === "string" ? data : JSON.stringify(data),
    );
  root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(App)));
}
async function click(node) {
  assert.ok(node, "Expected interaction target");
  await act(async () => node.click());
}
async function select(node, value) {
  assert.ok(node, "Expected select target");
  const regionPanel = node.closest(".program-region-popover");
  if (regionPanel?.hidden)
    await click(regionPanel.parentElement.querySelector("button"));
  await act(async () => {
    node.value = value;
    node.dispatchEvent(new window.Event("change", { bubbles: true }));
  });
}
async function input(node, value) {
  assert.ok(node, "Expected input target");
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set.call(node, value);
    node.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}
async function visit(path) {
  await act(async () => {
    history.pushState({}, "", path);
    window.dispatchEvent(new window.PopStateEvent("popstate"));
  });
}
async function remount(path, data) {
  await act(async () => root.unmount());
  root = null;
  document.body.innerHTML = '<div id="root"></div>';
  await mount(path, data);
}
function snapshot() {
  return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
}
beforeEach(() => {
  window.sessionStorage.clear();
  document.body.innerHTML = '<div id="root"></div>';
  mobile = false;
  reducedMotion = false;
  pageHidden = false;
  carouselTimers.clear();
  mediaListeners.clear();
  consoleErrors.length = 0;
  console.error = (...args) => consoleErrors.push(args.join(" "));
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  console.error = originalError;
  assert.deepEqual(
    consoleErrors,
    [],
    "No React rendering or state consistency errors expected",
  );
});

async function mountCarousel(items = programs, props = {}) {
  root = createRoot(document.getElementById("root"));
  await act(async () =>
    root.render(
      React.createElement(ProgramCarousel, { items, save: () => {}, ...props }),
    ),
  );
}
async function measureCarousel({
  width = 1000,
  cardWidth = 300,
  contentWidth,
} = {}) {
  const element = document.querySelector(".program-carousel-viewport");
  assert.ok(element);
  const slides = element.querySelectorAll("[data-carousel-slide]");
  element.style.gap = "18px";
  Object.defineProperties(element, {
    clientWidth: { configurable: true, value: width },
    scrollWidth: {
      configurable: true,
      value: contentWidth ?? slides.length * (cardWidth + 18) - 18,
    },
  });
  for (const slide of slides)
    slide.getBoundingClientRect = () => ({
      width: cardWidth,
      height: 320,
      x: 0,
      y: 0,
      left: 0,
      right: cardWidth,
      top: 0,
      bottom: 320,
      toJSON() {
        return {};
      },
    });
  await act(async () => window.dispatchEvent(new window.Event("resize")));
  return element;
}
async function autoplayTick() {
  await act(async () => {
    for (const timer of [...carouselTimers.values()]) {
      assert.equal(timer.delay, 6000);
      timer.callback();
    }
  });
}
async function pointer(element, name, { x = 0, id = 1 } = {}) {
  await act(async () => {
    const event = new window.MouseEvent(name, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      button: 0,
    });
    Object.defineProperties(event, {
      pointerId: { value: id },
      pointerType: { value: "mouse" },
    });
    element.dispatchEvent(event);
  });
}

test("finite carousel advances one card per six-second tick and stops after manual controls", async () => {
  await mountCarousel();
  const viewport = await measureCarousel();
  assert.equal(carouselTimers.size, 1);
  assert.equal(document.querySelector(".carousel-control"), null);
  await autoplayTick();
  assert.equal(viewport.scrollLeft, 318);
  await act(async () =>
    viewport.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(viewport.scrollLeft, 636);
  assert.equal(carouselTimers.size, 0);
  await autoplayTick();
  assert.equal(viewport.scrollLeft, 636);
  await act(async () =>
    viewport.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "End",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(
    viewport.scrollLeft,
    viewport.scrollWidth - viewport.clientWidth,
  );
  await act(async () =>
    viewport.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Home",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(viewport.scrollLeft, 0);
});
test("carousel temporarily pauses on hover, focus and hidden tabs without a playback button", async () => {
  await mountCarousel();
  const viewport = await measureCarousel(),
    region = document.querySelector(".program-carousel");
  await act(async () =>
    region.dispatchEvent(
      new window.MouseEvent("mouseover", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    ),
  );
  assert.equal(carouselTimers.size, 0);
  await act(async () =>
    region.dispatchEvent(
      new window.MouseEvent("mouseout", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    ),
  );
  assert.equal(carouselTimers.size, 1);
  await act(async () => viewport.focus());
  assert.equal(carouselTimers.size, 0);
  await act(async () => viewport.blur());
  assert.equal(carouselTimers.size, 1);
  await act(async () => {
    pageHidden = true;
    document.dispatchEvent(new window.Event("visibilitychange"));
  });
  assert.equal(carouselTimers.size, 0);
  await act(async () => {
    pageHidden = false;
    document.dispatchEvent(new window.Event("visibilitychange"));
  });
  assert.equal(carouselTimers.size, 1);
  assert.equal(document.querySelector(".carousel-autoplay"), null);
});
test("reduced motion disables autoplay while arrows and keyboard remain usable", async () => {
  reducedMotion = true;
  await mountCarousel();
  const viewport = await measureCarousel();
  assert.equal(carouselTimers.size, 0);
  assert.equal(document.querySelector(".carousel-autoplay"), null);
  await act(async () =>
    viewport.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(viewport.scrollLeft, 318);
  await act(async () =>
    viewport.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(viewport.scrollLeft, 0);
});
test("carousel responds to reduced-motion changes and resizing without moving focus", async () => {
  await mountCarousel();
  const viewport = await measureCarousel();
  assert.equal(carouselTimers.size, 1);
  await act(async () => {
    reducedMotion = true;
    for (const listener of mediaListeners.get(
      "(prefers-reduced-motion: reduce)",
    ) || [])
      listener();
  });
  assert.equal(carouselTimers.size, 0);
  await measureCarousel({ width: 2400 });
  assert.equal(document.querySelector(".program-carousel-controls"), null);
  await measureCarousel({ width: 340 });
  await act(async () => viewport.focus());
  await act(async () =>
    viewport.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(document.activeElement, viewport);
});
test("mouse dragging and native touch pause autoplay and suppress accidental card navigation", async () => {
  await mount();
  const viewport = await measureCarousel();
  assert.equal(carouselTimers.size, 1);
  await pointer(viewport, "pointerdown", { x: 400 });
  await pointer(viewport, "pointermove", { x: 100 });
  assert.equal(viewport.scrollLeft, 300);
  assert.ok(viewport.classList.contains("is-dragging"));
  await pointer(viewport, "pointerup", { x: 100 });
  assert.equal(viewport.scrollLeft, 318);
  assert.equal(carouselTimers.size, 0);
  await click(viewport.querySelector("h2 a"));
  assert.equal(location.pathname, "/");
  await act(async () =>
    viewport.dispatchEvent(new window.Event("touchstart", { bubbles: true })),
  );
  assert.equal(carouselTimers.size, 0);
});
test("small and unavailable curated datasets avoid unnecessary controls or empty tracks", async () => {
  await mountCarousel([]);
  assert.equal(document.querySelector(".program-carousel"), null);
  assert.ok(
    document.querySelector('.curated-programs-empty a[href="/program"]'),
  );
  await act(async () =>
    root.render(React.createElement(ProgramCarousel, { items: [programs[0]] })),
  );
  await measureCarousel({ width: 340 });
  assert.equal(document.querySelector(".program-carousel-controls"), null);
  assert.equal(carouselTimers.size, 0);
  await measureCarousel({ width: 900 });
  assert.equal(document.querySelector(".program-carousel-controls"), null);
  assert.equal(carouselTimers.size, 0);
  await act(async () =>
    root.render(
      React.createElement(ProgramCarousel, { items: programs.slice(0, 2) }),
    ),
  );
  await measureCarousel({ width: 340 });
  assert.equal(document.querySelector(".program-carousel-controls"), null);
  assert.equal(carouselTimers.size, 1);
  await measureCarousel({ width: 900 });
  assert.equal(document.querySelector(".program-carousel-controls"), null);
  assert.equal(carouselTimers.size, 0);
  await act(async () =>
    root.render(
      React.createElement(ProgramCarousel, {
        items: [programs[0], programs[0], { ...programs[1], sources: [] }],
      }),
    ),
  );
  assert.equal(document.querySelectorAll(".program-carousel-slide").length, 1);
});
test("carousel handles autoplay disabled, missing organizer, long copy and canonical bookmark state", async () => {
  const long = {
    ...programs[0],
    name: "Program " + "pendidikan ".repeat(18),
    summary: "Dukungan ".repeat(70),
    agency: undefined,
  };
  await mountCarousel([long, ...programs.slice(1)], {
    autoplay: false,
    plans: { "kip-kuliah": { done: [], variant: "" } },
  });
  await measureCarousel();
  assert.equal(carouselTimers.size, 0);
  assert.equal(document.querySelector(".carousel-autoplay"), null);
  assert.ok(
    document.querySelector(".program-carousel-slide h2").textContent.length >
      100,
  );
  assert.equal(
    document.querySelector(".program-carousel-slide").querySelector(".agency"),
    null,
  );
  assert.equal(
    document.querySelector(".bookmark-action").getAttribute("aria-pressed"),
    "true",
  );
});
test("carousel bookmark resumes the existing guest flow and updates saved state for accounts", async () => {
  await mount("/");
  const viewport = await measureCarousel();
  await click(viewport.querySelector('[aria-label="Simpan KIP Kuliah"]'));
  assert.ok(document.querySelector('[role="dialog"]'));
  await click(button("Lanjut Jelajahi"));
  assert.equal(location.pathname, "/");
  assert.equal(carouselTimers.size, 0);
  await remount("/", seed());
  await measureCarousel();
  const save = document.querySelector(
    '.program-carousel [aria-label="Simpan KIP Kuliah"]',
  );
  await click(save);
  assert.ok(snapshot().accounts.one.plans["kip-kuliah"]);
  assert.equal(
    document
      .querySelector(".program-carousel .bookmark-action")
      .getAttribute("aria-pressed"),
    "true",
  );
  await click(
    document.querySelector(
      '.program-carousel [aria-label="Hapus simpanan KIP Kuliah"]',
    ),
  );
  assert.equal(Object.keys(snapshot().accounts.one.plans).length, 0);
});

test("guest homepage preserves brand choices, prioritizes programs, and exposes seven homepage FAQs", async () => {
  await mount();
  assert.match(
    text(),
    /Informasi Program dan Panduan Layanan Publik dalam Satu Tempat/,
  );
  assert.equal(
    document.querySelector(".hero-landscape").getAttribute("src"),
    "/hero-lakeside.png",
  );
  assert.equal(document.querySelector(".trustbar"), null);
  assert.equal(document.querySelector(".footer-art"), null);
  assert.equal(
    document.querySelectorAll(".program-carousel .catalog-card").length,
    6,
  );
  assert.equal(document.querySelectorAll(".topics-grid .topic").length, 7);
  assert.equal(document.querySelectorAll(".home-faq .faq").length, 7);
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.querySelector(".personalization"), null);
  assert.equal(document.querySelector(".how-section"), null);
  assert.equal(document.querySelector(".nav-search"), null);
  const sections = [...document.querySelectorAll(".homepage > section")];
  assert.deepEqual(
    sections.map((section) =>
      section.classList.contains("hero")
        ? "hero"
        : [...section.classList].find((name) =>
            [
              "home-introduction",
              "program-exploration",
              "featured-programs",
              "homepage-services",
              "homepage-transparency",
              "home-faq",
            ].includes(name),
          ),
    ),
    [
      "hero",
      "home-introduction",
      "program-exploration",
      "featured-programs",
      "homepage-services",
      "homepage-transparency",
      "home-faq",
    ],
  );
  assert.equal(document.querySelectorAll(".intro-feature").length, 2);
  assert.match(
    document.querySelector(".home-introduction").textContent,
    /Lebih Mudah Menemukan Informasi/,
  );
  await click(anchor("Lihat Semua Program"));
  assert.equal(location.pathname, "/program");
});
test("featured homepage updates guest, incomplete, personal and logout states using the unchanged carousel", async () => {
  await mount("/");
  const featured = () => document.querySelector(".featured-programs");
  assert.equal(
    document.querySelector("#featured-programs-title").textContent,
    "Program Unggulan",
  );
  assert.ok(featured().querySelector('a[href^="/daftar"]'));
  assert.equal(featured().querySelectorAll(".curated-program-card").length, 6);
  await visit("/masuk");
  await click(button("Lanjutkan dengan Google"));
  await visit("/");
  assert.equal(featured().querySelector('a[href^="/daftar"]'), null);
  assert.match(featured().textContent, /Lengkapi profilmu/);
  await visit("/profil/edit");
  for (const labelText of ["Memiliki usaha", "Usaha & Ekonomi"]) {
    const label = [...document.querySelectorAll(".choice-grid label")].find(
      (label) => label.textContent.trim() === labelText,
    );
    await click(label.querySelector("input"));
  }
  await click(button("Simpan profil"));
  await visit("/");
  assert.equal(
    document.querySelector("#featured-programs-title").textContent,
    "Rekomendasi untukmu",
  );
  assert.match(
    featured().textContent,
    /Temukan program yang relevan berdasarkan informasi profilmu/,
  );
  assert.equal(featured().querySelectorAll(".curated-program-card").length, 1);
  assert.ok(featured().querySelector('a[href="/program/kur"]'));
  assert.equal(featured().querySelector(".match-status"), null);
  assert.equal(
    featured().querySelector(".text-link").getAttribute("href"),
    "/program",
  );
  await click(button("Keluar"));
  assert.equal(
    document.querySelector("#featured-programs-title").textContent,
    "Program Unggulan",
  );
  assert.equal(featured().querySelectorAll(".curated-program-card").length, 6);
});

test("logged-in homepage with no eligible personal result falls back to clearly general programs", async () => {
  await mount(
    "/",
    seed("one", {
      interests: ["pendidikan"],
      activities: ["mahasiswa"],
      year: "2020",
      student: "no",
      province: "Jawa Timur",
    }),
  );
  const featured = document.querySelector(".featured-programs");
  assert.equal(
    document.querySelector("#featured-programs-title").textContent,
    "Program Unggulan",
  );
  assert.match(featured.textContent, /Jelajahi program pilihan yang tersedia/);
  assert.equal(featured.querySelectorAll(".curated-program-card").length, 6);
  assert.equal(featured.querySelector('a[href^="/daftar"]'), null);
});

test("homepage FAQ uses accessible single-open buttons and leaves the help page unchanged", async () => {
  await mount("/");
  const buttons = [...document.querySelectorAll(".minimal-faq h3 button")];
  assert.equal(buttons.length, 7);
  assert.ok(
    buttons.every((button) => button.getAttribute("aria-expanded") === "false"),
  );
  assert.ok(document.querySelector(".home-faq-help"));
  assert.equal(document.querySelector(".home-faq .faq-number"), null);
  assert.equal(anchor("Pusat Bantuan").getAttribute("href"), "/bantuan");
  await act(async () => buttons[0].focus());
  assert.equal(document.activeElement, buttons[0]);
  await click(buttons[0]);
  const first = document.getElementById(
    buttons[0].getAttribute("aria-controls"),
  );
  assert.equal(first.getAttribute("aria-hidden"), "false");
  assert.equal(first.hasAttribute("inert"), false);
  assert.equal(buttons[0].getAttribute("aria-expanded"), "true");
  await click(buttons[1]);
  assert.equal(buttons[0].getAttribute("aria-expanded"), "false");
  assert.equal(first.getAttribute("aria-hidden"), "true");
  assert.ok(first.hasAttribute("inert"));
  assert.equal(buttons[1].getAttribute("aria-expanded"), "true");
  await click(buttons[1]);
  assert.ok(
    buttons.every((button) => button.getAttribute("aria-expanded") === "false"),
  );
  await visit("/bantuan");
  assert.equal(document.querySelectorAll(".faq-list details.faq").length, 5);
  assert.equal(document.querySelectorAll("details.faq").length, 7);
  assert.equal(document.querySelector(".minimal-faq"), null);
});

test("dynamic detail fixture scenarios render without fake documents, duplicate guides or unsafe actions", async () => {
  await mount("/program");
  for (const [scenario, item] of Object.entries(detailFixtures)) {
    await act(async () =>
      root.render(
        React.createElement(
          "main",
          null,
          React.createElement(ProgramDetail, { item, save() {}, saved: false }),
        ),
      ),
    );
    assert.equal(document.querySelectorAll("h1").length, 1, scenario);
    assert.ok(document.querySelector(".program-action-panel"), scenario);
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    assert.equal(new Set(ids).size, ids.length, scenario);
    if (scenario === "assessment" || scenario === "sparse")
      assert.equal(document.querySelector(".program-detail-documents"), null);
    if (scenario === "sparse") {
      assert.equal(document.querySelector(".program-detail-stepper"), null);
      assert.equal(
        document.querySelector(".program-action-panel a[target=_blank]"),
        null,
      );
    }
    if (scenario === "conflicting") {
      assert.doesNotMatch(
        document.querySelector("#persyaratan").textContent,
        /Syarat yang belum dapat dipastikan/,
      );
      assert.equal(
        document.querySelector(".program-action-panel a[target=_blank]"),
        null,
      );
    }
    if (scenario === "multiRoute") {
      assert.equal(
        document.querySelectorAll(".program-detail-stepper").length,
        2,
      );
      assert.match(text(), /Pilih salah satu: Ijazah atau Surat kelulusan/);
      assert.match(text(), /Jika melalui jalur daerah/);
    }
    assert.equal(
      document.querySelectorAll(".program-related-guides").length,
      0,
      scenario,
    );
    assert.ok(button("Simpan ke Rencanaku"));
  }
});

test("program-specific document, financing and related-guide behavior preserves bookmarks and requirements routes", async () => {
  await mount("/program/atensi");
  assert.equal(document.querySelector(".program-detail-documents"), null);
  assert.match(
    document.querySelector("#dokumen").textContent,
    /Daftar dokumen perlu dikonfirmasi/,
  );
  assert.equal(document.querySelector(".program-related-guides"), null);
  assert.match(
    document.querySelector(".program-action-panel").textContent,
    /Lihat panduan resmi/,
  );
  await click(button("Simpan ke Rencanaku"));
  assert.match(
    document.querySelector('[role="dialog"]').textContent,
    /Masuk atau buat akun/,
  );
  await click(document.querySelector('[aria-label="Tutup dialog"]'));
  await visit("/program/kur");
  assert.match(text(), /kewajiban pengembalian/);
  assert.equal(document.querySelectorAll(".program-related-guides").length, 1);
  assert.ok(
    document.querySelector('.program-related-guides a[href="/layanan/npwp"]'),
  );
  await visit("/program/kip-kuliah/persyaratan");
  assert.equal(document.querySelector("#cara-akses"), null);
  assert.ok(document.querySelector(".program-detail-documents"));
  assert.ok(document.querySelector('a[href="/program/kip-kuliah"]'));
});

test("guest can read all details and official destinations without registering", async () => {
  await mount("/program/kip-kuliah");
  assert.match(text(), /Sumber Informasi/);
  const official = document.querySelector(
    '.program-action-panel a[target="_blank"]',
  );
  assert.equal(official.href, "https://kip-kuliah.kemdiktisaintek.go.id/");
  assert.equal(official.rel, "noopener noreferrer");
  for (const item of catalog) {
    await visit(`/${item.type}/${item.id}`);
    assert.ok(
      document.querySelector(
        item.type === "program"
          ? ".program-official-sources"
          : ".sources-block",
      ),
    );
    assert.ok(
      document.querySelector(
        item.type === "program"
          ? '.program-action-panel a[target="_blank"]'
          : '.action-panel a[target="_blank"]',
      ),
    );
  }
});
test("guest bookmark dialog preserves context, traps focus, and closes with Escape", async () => {
  await mount("/layanan/ktp-el/hilang");
  const save = button("Simpan ke Rencanaku");
  save.focus();
  await click(save);
  const dialog = document.querySelector('[role="dialog"]');
  assert.ok(dialog);
  assert.equal(dialog.getAttribute("aria-modal"), "true");
  const choices = [...dialog.querySelectorAll("button,a")];
  choices.at(-1).focus();
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(document.activeElement, choices[0]);
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(location.pathname, "/layanan/ktp-el/hilang");
  assert.equal(document.activeElement, save);
});
test("session-demo auth pages use focused layout, enabled demo controls and preserve old local data", async () => {
  await mount("/masuk?next=%2Fprogram%3Fq%3Dkip", seed());
  const existing = localStorage.getItem(ACCOUNT_KEY);
  for (const path of ["/masuk", "/daftar", "/lupa-kata-sandi"]) {
    await visit(path + "?next=%2Fprogram%3Fq%3Dkip");
    assert.ok(document.querySelector(".auth-header"));
    assert.equal(document.querySelector(".site-header"), null);
    assert.equal(document.querySelector(".breadcrumb"), null);
    assert.equal(document.querySelector("footer"), null);
    assert.equal(document.querySelector("#account-select"), null);
    assert.doesNotMatch(
      text(),
      /identitas contoh|@example.test|Nama tampilan contoh/,
    );
    for (const input of document.querySelectorAll(".auth-form input"))
      assert.equal(input.disabled, false);
    assert.equal(
      document.querySelector(".auth-submit").disabled,
      false,
    );
    assert.doesNotMatch(text(), /Mode demo\. Data tersimpan/);
    assert.equal(
      document.querySelector(".auth-guest").getAttribute("href"),
      "/program?q=kip",
    );
    await act(async () =>
      document
        .querySelector("form")
        .dispatchEvent(
          new window.Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    assert.equal(localStorage.getItem(ACCOUNT_KEY), existing);
  }
  await click(anchor("Lanjut tanpa akun"));
  assert.equal(location.pathname + location.search, "/program?q=kip");
  assert.ok(document.querySelector(".site-header"));
});

test("dummy email registration saves identity and plans only in sessionStorage, restores on reload and forgets passwords", async () => {
  const old = seed();
  old.activeId = null;
  await mount("/program/kur", old);
  const original = localStorage.getItem(ACCOUNT_KEY);
  await click(button("Simpan ke Rencanaku"));
  await click(anchor("Masuk atau Daftar"));
  await click(anchor("Daftar"));
  await input(document.querySelector("#auth-name"), "Pengguna Sesi");
  await input(document.querySelector("#auth-email"), "sesi@example.com");
  await input(
    document.querySelector("#auth-password"),
    "dummy-never-store-password",
  );
  await click(button("Buat akun"));
  assert.equal(location.pathname, "/program/kur");
  const session = JSON.parse(window.sessionStorage.getItem(SESSION_DEMO_KEY));
  assert.equal(
    session.accounts[session.activeId].identity.displayName,
    "Pengguna Sesi",
  );
  assert.ok(session.accounts[session.activeId].plans.kur);
  assert.equal(localStorage.getItem(ACCOUNT_KEY), original);
  assert.doesNotMatch(
    window.sessionStorage.getItem(SESSION_DEMO_KEY),
    /dummy-never-store-password|password|token/,
  );
  await remount("/rencanaku", old);
  assert.match(text(), /Kredit Usaha Rakyat/);
  await click(button("Keluar"));
  await visit("/masuk");
  await input(document.querySelector("#auth-email"), "sesi@example.com");
  await input(document.querySelector("#auth-password"), "another-example");
  await click(button("Masuk"));
  assert.equal(
    JSON.parse(window.sessionStorage.getItem(SESSION_DEMO_KEY)).activeId,
    session.activeId,
  );
  window.sessionStorage.clear();
  await remount("/rencanaku", old);
  assert.match(text(), /Masuk untuk membuka Rencanaku/);
});

test("password recovery accepts a valid email without sending mail or creating a session", async () => {
  await mount("/lupa-kata-sandi?next=%2Fprogram%2Fpip");
  const email = document.querySelector("#auth-email");
  assert.equal(email.disabled, false);
  const submit = button("Lanjutkan pemulihan");
  assert.equal(submit.disabled, false);
  await click(submit);
  assert.match(document.querySelector('[role="alert"]').textContent, /Masukkan alamat email/);
  await input(email, "invalid");
  await click(submit);
  assert.match(document.querySelector('[role="alert"]').textContent, /format alamat email/);
  const previous = window.sessionStorage.getItem(SESSION_DEMO_KEY);
  await input(email, "person@example.com");
  await click(submit);
  assert.match(document.querySelector('[role="status"]').textContent, /Tidak ada email yang dikirim atau kata sandi yang diubah/);
  assert.equal(window.sessionStorage.getItem(SESSION_DEMO_KEY), previous);
  assert.equal(document.querySelector(".auth-switch"), null);
  assert.equal(document.querySelector(".site-footer"), null);
});

test("ordinary email sign-in and registration return to the homepage", async () => {
  for (const mode of ["masuk", "daftar"]) {
    if (root) {
      await act(async () => root.unmount());
      root = null;
    }
    window.sessionStorage.clear();
    await mount(`/${mode}`);
    if (mode === "daftar")
      await input(document.querySelector("#auth-name"), "Pengguna Beranda");
    await input(document.querySelector("#auth-email"), "beranda@example.com");
    await input(document.querySelector("#auth-password"), "dummy-only");
    await click(button(mode === "daftar" ? "Buat akun" : "Masuk"));
    assert.equal(location.pathname, "/");
    assert.ok(document.querySelector(".homepage"));
  }
});

test("Google dummy button has the supplied logo and reuses one session identity without OAuth", async () => {
  await mount("/masuk?next=%2Fprogram%2Fpip&save=pip");
  const google = button("Lanjutkan dengan Google");
  assert.equal(google.disabled, false);
  assert.ok(google.querySelector('img[src="/google-g-logo.png"]'));
  await click(google);
  assert.equal(location.pathname, "/program/pip");
  const session = JSON.parse(window.sessionStorage.getItem(SESSION_DEMO_KEY));
  assert.equal(
    session.accounts[session.activeId].identity.email,
    "google.demo@example.test",
  );
  assert.deepEqual(Object.keys(session.accounts[session.activeId].plans), [
    "pip",
  ]);
  await click(button("Keluar"));
  await visit("/masuk?next=%2Fprogram%2Fpip&save=pip");
  await click(button("Lanjutkan dengan Google"));
  const next = JSON.parse(window.sessionStorage.getItem(SESSION_DEMO_KEY));
  assert.equal(next.activeId, session.activeId);
  assert.equal(Object.keys(next.accounts).length, 1);
  assert.deepEqual(Object.keys(next.accounts[next.activeId].plans), ["pip"]);
  assert.doesNotMatch(JSON.stringify(localStorage), /google.demo@example.test/);
});

test("auth UI validation, password visibility and pending verification use isolated service fixtures only", async () => {
  await mount("/program");
  let calls = 0,
    authenticated = 0;
  const service = {
    capabilities: { emailPassword: true, google: false, passwordReset: false },
    signUp: async () => {
      calls++;
      return { status: "verification_required" };
    },
  };
  await act(async () =>
    root.render(
      React.createElement(
        "main",
        null,
        React.createElement(AuthPage, {
          mode: "daftar",
          service,
          onAuthenticated() {
            authenticated++;
          },
        }),
      ),
    ),
  );
  await click(button("Buat akun"));
  assert.match(text(), /Masukkan nama tampilan/);
  assert.equal(
    document.querySelector("#auth-email").getAttribute("aria-invalid"),
    "true",
  );
  assert.equal(calls, 0);
  await input(document.querySelector("#auth-name"), "Nama");
  await input(document.querySelector("#auth-email"), "name@mail.com");
  await input(document.querySelector("#auth-password"), "Only-in-test-memory");
  await click(document.querySelector('[aria-label="Tampilkan kata sandi"]'));
  assert.equal(document.querySelector("#auth-password").type, "text");
  await click(document.querySelector('[aria-label="Sembunyikan kata sandi"]'));
  assert.equal(document.querySelector("#auth-password").type, "password");
  await click(button("Buat akun"));
  assert.equal(calls, 1);
  assert.equal(authenticated, 0);
  assert.match(text(), /Alamat email perlu diverifikasi/);
  assert.equal(document.querySelector("#auth-password").value, "");
  assert.doesNotMatch(JSON.stringify(localStorage), /Only-in-test-memory/);
});

test("auth UI prevents repeat requests and unverified success; fixtures do not claim provider integration", async () => {
  await mount("/program");
  let resolveRequest,
    calls = 0,
    completed = 0;
  const service = {
    capabilities: { emailPassword: true, google: true, passwordReset: false },
    signIn: () => {
      calls++;
      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    },
    signInWithGoogle: async () => {
      throw new Error("raw SDK token error");
    },
  };
  await act(async () =>
    root.render(
      React.createElement(
        "main",
        null,
        React.createElement(AuthPage, {
          mode: "masuk",
          service,
          onAuthenticated() {
            completed++;
          },
        }),
      ),
    ),
  );
  await input(document.querySelector("#auth-email"), "name@mail.com");
  await input(document.querySelector("#auth-password"), "test-only");
  await click(button("Masuk"));
  assert.equal(
    document.querySelector("form").getAttribute("aria-busy"),
    "true",
  );
  await act(async () =>
    document
      .querySelector("form")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
  assert.equal(calls, 1);
  await act(async () =>
    resolveRequest({
      status: "authenticated",
      user: { id: "fixture", email: "name@mail.com", emailVerified: false },
    }),
  );
  assert.equal(completed, 0);
  await click(button("Lanjutkan dengan Google"));
  assert.match(text(), /Permintaan belum berhasil/);
  assert.doesNotMatch(text(), /raw SDK token/);
});

test("explicit demo registration resumes service variant without forcing profile completion", async () => {
  await mount("/layanan/ktp-el/hilang");
  await click(button("Simpan ke Rencanaku"));
  await click(anchor("Masuk atau Daftar"));
  assert.equal(location.pathname, "/masuk");
  await click(anchor("Daftar"));
  assert.equal(location.pathname, "/daftar");
  await visit(`/demo/daftar${location.search}`);
  await input(document.querySelector("#account-name"), " Contoh Pengguna ");
  await input(document.querySelector("#account-email"), " demo@example.test ");
  await click(button("Buat Akun"));
  assert.equal(location.pathname, "/layanan/ktp-el/hilang");
  const state = snapshot();
  assert.equal(
    Object.keys(state.accounts[state.activeId].plans)[0],
    "ktp-el:hilang",
  );
  assert.deepEqual(state.accounts[state.activeId].profile, {});
  assert.equal(document.querySelector('input[type="password"]'), null);
});
test("isolated demo registration rejects personal email input and preserves optional profile", async () => {
  await mount("/demo/daftar");
  await click(button("Buat Akun"));
  assert.ok(document.querySelector('[role="alert"]'));
  assert.equal(snapshot().activeId, null);
  await input(document.querySelector("#account-name"), "Contoh");
  await input(document.querySelector("#account-email"), "private@gmail.com");
  await click(button("Buat Akun"));
  assert.match(
    document.querySelector('[role="alert"]').textContent,
    /@example.test/,
  );
  await input(document.querySelector("#account-email"), "contoh@example.test");
  await click(button("Buat Akun"));
  assert.equal(location.pathname, "/selamat-datang");
  await click(anchor("Jelajahi HAKKITA"));
  assert.equal(location.pathname, "/program");
});
test("personalization registration can be skipped and never prompts again automatically", async () => {
  await mount("/");
  await click(anchor("Buat akun dan lengkapi profilmu."));
  assert.equal(location.pathname, "/daftar");
  await visit(`/demo/daftar${location.search}`);
  await input(document.querySelector("#account-name"), "Personalisasi");
  await input(document.querySelector("#account-email"), "profile@example.test");
  await click(button("Buat Akun"));
  assert.equal(location.pathname, "/profil/edit");
  await click(button("Lewati untuk sekarang"));
  assert.equal(location.pathname, "/program");
  await visit("/");
  assert.equal(document.querySelector('[role="dialog"]'), null);
});
test("account-specific saving toggles, persists checklist, assigns goals, deletes and undoes", async () => {
  await mount("/program/kip-kuliah", seed());
  await click(button("Simpan ke Rencanaku"));
  assert.equal(Object.keys(snapshot().accounts.one.plans).length, 1);
  await click(button("Hapus dari Rencanaku"));
  assert.equal(Object.keys(snapshot().accounts.one.plans).length, 0);
  await click(button("Simpan ke Rencanaku"));
  await visit("/rencanaku");
  assert.match(text(), /0 dari 2 dokumen siap/);
  for (const check of document.querySelectorAll(".checklist input"))
    await click(check);
  assert.match(text(), /2 dari 2 dokumen siap/);
  await select(document.querySelector(".plan-goal select"), "pendidikan");
  assert.equal(snapshot().accounts.one.plans["kip-kuliah"].goal, "pendidikan");
  await click(button("Dokumen siap"));
  assert.ok(document.querySelector(".plan-card"));
  await click(document.querySelector('[aria-label="Hapus KIP Kuliah"]'));
  assert.equal(document.querySelectorAll(".plan-card").length, 0);
  await click(button("Urungkan"));
  assert.ok(document.querySelector(".plan-card"));
  const stored = snapshot();
  await remount("/rencanaku", stored);
  assert.match(text(), /2 dari 2 dokumen siap/);
});
test("logout and switching identities do not mix plans or expose protected areas", async () => {
  await mount("/program/kur", seed());
  await click(button("Simpan ke Rencanaku"));
  await click(button("Keluar"));
  assert.equal(snapshot().activeId, null);
  await visit("/rencanaku");
  assert.match(text(), /Masuk untuk membuka Rencanaku/);
  await visit("/demo/masuk");
  await select(document.querySelector("#account-select"), "two");
  await click(button("Masuk"));
  assert.equal(location.pathname, "/rencanaku");
  assert.match(text(), /Belum ada yang kamu simpan/);
  assert.deepEqual(snapshot().accounts.two.plans, {});
  await click(button("Keluar"));
  await visit("/demo/masuk");
  await select(document.querySelector("#account-select"), "one");
  await click(button("Masuk"));
  assert.match(text(), /Kredit Usaha Rakyat/);
});
test("unavailable saved item and corrupt storage render safe recovery states", async () => {
  await mount(
    "/rencanaku",
    seed("one", {}, { "retired-program": { done: [], variant: "" } }),
  );
  assert.match(text(), /Informasi tidak lagi tersedia/);
  await click(
    document.querySelector('[aria-label="Hapus simpanan tidak tersedia"]'),
  );
  assert.match(text(), /Belum ada yang kamu simpan/);
  await remount("/rencanaku", "not-json");
  assert.match(text(), /Masuk untuk membuka Rencanaku/);
});
test("KTP variants deep-link, switch distinct documents, and save separately", async () => {
  await mount("/layanan/ktp-el", seed());
  await click(button("Hilang"));
  assert.equal(location.pathname, "/layanan/ktp-el/hilang");
  assert.match(
    document.querySelector(".document-list").textContent,
    /kepolisian/,
  );
  await click(button("Simpan ke Rencanaku"));
  await click(button("Rusak"));
  assert.doesNotMatch(
    document.querySelector(".document-list").textContent,
    /kepolisian/,
  );
  await click(button("Simpan ke Rencanaku"));
  assert.deepEqual(Object.keys(snapshot().accounts.one.plans), [
    "ktp-el:hilang",
    "ktp-el:rusak",
  ]);
  await visit("/layanan/ktp-el/unknown");
  assert.match(text(), /Halaman ini belum ditemukan/);
});
test("one region control combines nationwide province and district selection, resets and dismisses accessibly", async () => {
  await mount("/program");
  const trigger = document.querySelector(
    '[aria-controls="program-region-options"]',
  );
  assert.equal(trigger.textContent, "Semua wilayah");
  assert.equal(document.querySelector("#program-region-options").hidden, true);
  await click(trigger);
  await select(document.querySelector("#region-filter"), "Papua Barat Daya");
  assert.ok(document.querySelector("#city-filter").options.length > 1);
  await select(document.querySelector("#city-filter"), "Kota Sorong");
  assert.equal(trigger.textContent, "Kota Sorong");
  assert.ok(
    document.querySelector(
      '[aria-label="Hapus filter Kota Sorong, Papua Barat Daya"]',
    ),
  );
  assert.match(
    document.querySelector(".program-region-empty").textContent,
    /Kota Sorong/,
  );
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, trigger);
  await click(trigger);
  await click(button("Hapus wilayah"));
  assert.equal(document.querySelector("#region-filter").value, "");
  assert.equal(document.querySelector("#city-filter").value, "");
  await click(button("Selesai"));
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  await visit(
    "/program?wilayah=Papua%20Barat%20Daya&kabupaten=Kota%20Sorong&q=berau",
  );
  assert.match(text(), /Belum ada program yang sesuai di Kota Sorong/);
  assert.equal(document.querySelectorAll(".catalog-card").length, 0);
});

test("account journeys omit the footer while public pages retain it", async () => {
  await mount("/masuk");
  for (const path of [
    "/masuk",
    "/daftar",
    "/rencanaku",
    "/selamat-datang",
    "/profil",
    "/profil/edit",
    "/program/rekomendasi",
  ]) {
    await visit(path);
    assert.equal(document.querySelector("footer"), null, path);
  }
  for (const path of ["/", "/program", "/layanan", "/anggaran", "/bantuan"]) {
    await visit(path);
    assert.ok(document.querySelector("footer"), path);
  }
});

test("district filtering persists in URLs, advanced previews and resets when province changes", async () => {
  await mount("/program");
  assert.equal(document.querySelector("#city-filter").disabled, true);
  await select(document.querySelector("#region-filter"), "Kalimantan Timur");
  await select(document.querySelector("#city-filter"), "Kabupaten Berau");
  assert.equal(
    new URLSearchParams(location.search).get("kabupaten"),
    "Kabupaten Berau",
  );
  assert.equal(document.querySelectorAll(".catalog-card").length, 8);
  await click(button("Filter lainnya"));
  assert.ok(button("Tampilkan 8 program"));
  await click(document.querySelector('[aria-label="Tutup dialog"]'));
  await select(document.querySelector("#region-filter"), "Jawa Timur");
  assert.equal(new URLSearchParams(location.search).get("kabupaten"), null);
  assert.equal(document.querySelector("#city-filter").disabled, false);
  assert.ok(
    document.querySelector(
      '#city-filter option[value="Kabupaten Banyuwangi"]',
    ) ||
      [...document.querySelector("#city-filter").options].some(
        (option) => option.value === "Kabupaten Banyuwangi",
      ),
  );
  assert.equal(document.querySelectorAll(".catalog-card").length, 6);
  assert.match(
    document.querySelector(".program-region-empty").textContent,
    /Belum ada program daerah.*Jawa Timur/,
  );
});

test("catalog combines query, recipients, regional filters, resets and browser navigation", async () => {
  await mount("/program?q=zzzz&kategori=pendidikan");
  assert.match(text(), /Tidak ada program yang sesuai/);
  await click(button("Hapus filter"));
  assert.equal(document.querySelectorAll(".catalog-card").length, 8);
  await select(document.querySelector("#category-filter"), "pendidikan");
  await select(document.querySelector("#region-filter"), "Jawa Timur");
  assert.equal(document.querySelectorAll(".catalog-card").length, 2);
  const previous = location.pathname + location.search;
  await click(button("Filter lainnya"));
  await select(document.querySelector("#education-filter"), "sarjana");
  assert.equal(document.querySelectorAll(".catalog-card").length, 2);
  await click(button("Tampilkan 0 program"));
  assert.equal(document.querySelectorAll(".catalog-card").length, 0);
  await visit(previous);
  assert.equal(document.querySelectorAll(".catalog-card").length, 2);
  assert.ok(document.querySelector(".active-filters"));
  await click(
    document.querySelector('[aria-label="Hapus filter Pendidikan & Beasiswa"]'),
  );
  assert.equal(new URLSearchParams(location.search).get("kategori"), null);
});
test("program search preserves category, region and sorting while recipient chips remain individually removable", async () => {
  await mount(
    "/program/kategori/pendidikan?wilayah=Jawa%20Timur&sasaran=pelajar,pelajar",
  );
  assert.equal(document.querySelector("aside.filters"), null);
  assert.equal(document.querySelector("#category-filter").value, "pendidikan");
  assert.equal(
    document.querySelectorAll('[aria-label="Hapus filter Pelajar"]').length,
    1,
  );
  await input(document.querySelector("#catalog-query"), "kIp");
  await act(async () =>
    document
      .querySelector("form[role=search]")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
  assert.equal(document.querySelectorAll(".catalog-card").length, 1);
  const query = new URLSearchParams(location.search);
  assert.equal(query.get("kategori"), "pendidikan");
  assert.equal(query.get("wilayah"), "Jawa Timur");
  assert.equal(query.get("q"), "kIp");
  await select(document.querySelector("#program-sort"), "za");
  assert.equal(new URLSearchParams(location.search).get("q"), "kIp");
  await click(document.querySelector('[aria-label="Hapus pencarian"]'));
  assert.equal(new URLSearchParams(location.search).get("q"), null);
  assert.equal(document.querySelector("#program-sort").value, "za");
  const names = [...document.querySelectorAll(".catalog-card h2")].map(
    (node) => node.textContent,
  );
  assert.deepEqual(
    names,
    [...names].sort((a, b) => -a.localeCompare(b, "id")),
  );
  const targetButton = document.querySelector(
    '[aria-controls="program-target-options"]',
  );
  await click(targetButton);
  const checkbox = document.querySelector(
    '.program-target-popover input[value="mahasiswa"]',
  );
  await act(async () => checkbox.focus());
  await click(checkbox);
  assert.equal(document.activeElement, checkbox);
  assert.equal(targetButton.getAttribute("aria-expanded"), "true");
  assert.ok(document.querySelector('[aria-label="Hapus filter Mahasiswa"]'));
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(targetButton.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, targetButton);
  await click(document.querySelector('[aria-label="Hapus filter Pelajar"]'));
  assert.equal(
    new URLSearchParams(location.search).get("sasaran"),
    "mahasiswa",
  );
  await click(button("Hapus semua"));
  assert.equal(document.querySelectorAll(".catalog-card").length, 8);
  assert.equal(document.querySelector(".active-filters"), null);
});

test("program advanced filters reset in place, restore focus on Escape and preserve existing catalog bookmarks", async () => {
  await mount("/program");
  const trigger = button("Filter lainnya");
  await act(async () => trigger.focus());
  await click(trigger);
  await act(async () => document.querySelector("#education-filter").focus());
  await select(document.querySelector("#education-filter"), "sarjana");
  assert.ok(document.querySelector('[role="dialog"]'));
  assert.equal(document.activeElement.id, "education-filter");
  await click(button("Reset filter tambahan"));
  assert.equal(document.querySelector("#education-filter").value, "");
  assert.match(text(), /8 program ditemukan/);
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.activeElement, trigger);
  await click(document.querySelector('[aria-label="Simpan KIP Kuliah"]'));
  assert.match(
    document.querySelector('[role="dialog"]').textContent,
    /Masuk atau buat akun/,
  );
});

test("advanced program filters preview benefits, cancel drafts, apply atomically and reset without clearing primary filters", async () => {
  await mount("/program?wilayah=Jawa%20Timur&urutan=za");
  const originalUrl = location.pathname + location.search;
  assert.equal(
    document.querySelectorAll(".compact-program-search .search-submit svg")
      .length,
    0,
  );
  assert.ok(document.querySelector(".compact-program-search .search-leading"));
  await click(button("Filter lainnya"));
  assert.equal(document.querySelector("#level-filter"), null);
  assert.equal(document.querySelector("#activity-filter"), null);
  assert.equal(document.querySelector("#period-filter"), null);
  assert.equal(
    document.querySelectorAll(".program-benefit-options input").length,
    7,
  );
  await click(
    document.querySelector(
      '.program-benefit-options input[value="pembiayaan"]',
    ),
  );
  await click(
    document.querySelector('.program-benefit-options input[value="subsidi"]'),
  );
  assert.ok(button("Tampilkan 2 program"));
  assert.equal(document.querySelectorAll(".catalog-card").length, 6);
  assert.equal(location.pathname + location.search, originalUrl);
  await click(document.querySelector('[aria-label="Tutup dialog"]'));
  await click(button("Filter lainnya"));
  assert.equal(
    document.querySelector('.program-benefit-options input[value="subsidi"]')
      .checked,
    false,
  );
  await click(
    document.querySelector(
      '.program-benefit-options input[value="pembiayaan"]',
    ),
  );
  await click(
    document.querySelector('.program-benefit-options input[value="subsidi"]'),
  );
  await click(button("Tampilkan 2 program"));
  assert.equal(document.querySelectorAll(".catalog-card").length, 2);
  assert.equal(
    new URLSearchParams(location.search).get("manfaat"),
    "pembiayaan,subsidi",
  );
  assert.ok(document.querySelector('[aria-label="Hapus filter Subsidi"]'));
  await click(button("Filter lainnya (2)"));
  await click(button("Reset filter tambahan"));
  assert.equal(document.querySelectorAll(".catalog-card").length, 2);
  assert.ok(button("Tampilkan 6 program"));
  await click(button("Tampilkan 6 program"));
  assert.equal(
    new URLSearchParams(location.search).get("wilayah"),
    "Jawa Timur",
  );
  assert.equal(new URLSearchParams(location.search).get("urutan"), "za");
  assert.equal(new URLSearchParams(location.search).get("manfaat"), null);
  await select(document.querySelector("#category-filter"), "usaha");
  await click(button("Filter lainnya"));
  assert.equal(document.querySelector("#education-filter"), null);
});

test("recipient clear resets only its multi-select and additional education drafts cancel on Escape", async () => {
  await mount("/program?kategori=pendidikan&sasaran=pelajar,mahasiswa&q=KIP");
  const trigger = document.querySelector(
    '[aria-controls="program-target-options"]',
  );
  await click(trigger);
  await click(button("Hapus pilihan"));
  assert.equal(new URLSearchParams(location.search).get("sasaran"), null);
  assert.equal(new URLSearchParams(location.search).get("q"), "KIP");
  await act(async () =>
    document.body.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    ),
  );
  assert.equal(document.querySelector(".program-target-popover"), null);
  await click(button("Filter lainnya"));
  assert.ok(document.querySelector("#education-filter"));
  const originalUrl = location.pathname + location.search;
  await select(document.querySelector("#education-filter"), "doktor");
  assert.ok(button("Tampilkan 0 program"));
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(location.pathname + location.search, originalUrl);
  assert.equal(document.querySelectorAll(".catalog-card").length, 1);
  await click(button("Filter lainnya"));
  assert.equal(document.querySelector("#education-filter").value, "");
});

test("time sorting is the catalog default and deadline sorting keeps filters without adding dates to cards", async () => {
  await mount("/program");
  assert.equal(document.querySelector("#program-sort").value, "latest");
  assert.equal(document.querySelector(".program-sort-note"), null);
  await select(document.querySelector("#category-filter"), "pendidikan");
  await select(document.querySelector("#program-sort"), "deadline");
  assert.equal(
    new URLSearchParams(location.search).get("kategori"),
    "pendidikan",
  );
  assert.equal(new URLSearchParams(location.search).get("urutan"), "deadline");
  assert.equal(document.querySelector(".program-card-time"), null);
  await visit("/program?urutan=latest");
  assert.equal(document.querySelector("#program-sort").value, "latest");
  assert.equal(document.querySelector(".program-card-time"), null);
});

test("History API back and forward restore catalog filters", async () => {
  await mount("/program");
  await select(document.querySelector("#category-filter"), "pendidikan");
  await select(document.querySelector("#region-filter"), "Jawa Timur");
  await act(async () => {
    await new Promise((resolve) => {
      window.addEventListener("popstate", resolve, { once: true });
      history.back();
    });
  });
  assert.equal(document.querySelector("#region-filter").value, "");
  assert.equal(document.querySelector("#category-filter").value, "pendidikan");
  await act(async () => {
    await new Promise((resolve) => {
      window.addEventListener("popstate", resolve, { once: true });
      history.forward();
    });
  });
  assert.equal(document.querySelector("#region-filter").value, "Jawa Timur");
});
test("storage failure retains in-memory identity and clearly reports its limited lifetime", async () => {
  const prototype = window.Storage.prototype,
    original = prototype.setItem;
  prototype.setItem = function () {
    throw new Error("Storage disabled");
  };
  try {
    await mount("/demo/daftar");
    assert.match(text(), /Penyimpanan perangkat tidak tersedia/);
    await input(document.querySelector("#account-name"), "Sementara");
    await input(
      document.querySelector("#account-email"),
      "session@example.test",
    );
    await click(button("Buat Akun"));
    assert.equal(location.pathname, "/selamat-datang");
    await visit("/program/kur");
    await click(button("Simpan ke Rencanaku"));
    await visit("/rencanaku");
    assert.match(text(), /Kredit Usaha Rakyat/);
  } finally {
    prototype.setItem = original;
  }
});
test("legacy device plans import only after explicit action and remain linked to that identity", async () => {
  await mount("/program", seed());
  localStorage.setItem(
    "hakkita-plans-v1",
    JSON.stringify({ pip: { done: [0], variant: "" } }),
  );
  await visit("/rencanaku");
  assert.match(text(), /Ada simpanan dari versi sebelumnya/);
  assert.deepEqual(snapshot().accounts.one.plans, {});
  await click(button("Impor simpanan sebelumnya"));
  assert.ok(snapshot().accounts.one.plans.pip);
  await click(button("Keluar"));
  await visit("/demo/masuk");
  await select(document.querySelector("#account-select"), "two");
  await click(button("Masuk"));
  assert.doesNotMatch(text(), /Ada simpanan dari versi sebelumnya/);
  assert.deepEqual(snapshot().accounts.two.plans, {});
});
test("homepage service cards open their guides and category CTA scrolls and focuses the catalog categories", async () => {
  const scrolls = [];
  const original = window.HTMLElement.prototype.scrollIntoView;
  window.HTMLElement.prototype.scrollIntoView = function () {
    scrolls.push(this.id);
  };
  try {
    await mount("/");
    assert.equal(document.querySelectorAll(".homepage-service-card").length, 6);
    assert.ok(document.querySelector(".service-selection-label"));
    const cards = [...document.querySelectorAll(".homepage-service-card")].map(
      (card) => card.getAttribute("href"),
    );
    for (const href of cards) {
      await click(
        document.querySelector(`.homepage-service-card[href="${href}"]`),
      );
      assert.equal(location.pathname, href);
      assert.ok(document.querySelector(".document-list"));
      await visit("/");
    }
    await click(anchor("Lihat kategori layanan"));
    assert.equal(location.pathname, "/layanan");
    assert.equal(location.hash, "#kategori-layanan");
    assert.equal(document.querySelectorAll("#kategori-layanan a").length, 12);
    assert.equal(document.activeElement.id, "kategori-layanan");
    assert.deepEqual(scrolls, ["kategori-layanan"]);
    await click(
      document.querySelector(
        '#kategori-layanan a[href="/layanan/kategori/pajak"]',
      ),
    );
    assert.equal(document.querySelector("#category-filter").value, "pajak");
    await click(button("Reset Semua"));
    assert.equal(document.querySelectorAll(".catalog-card").length, 8);
    await visit("/");
    assert.equal(anchor("Lihat semua layanan"), undefined);
    await visit("/layanan");
    assert.equal(location.pathname, "/layanan");
    assert.equal(location.hash, "");
    assert.equal(document.activeElement.id, "main-content");
    await visit("/layanan#kategori-layanan");
    assert.equal(document.activeElement.id, "kategori-layanan");
    assert.equal(scrolls.length, 2);
  } finally {
    if (original) window.HTMLElement.prototype.scrollIntoView = original;
    else delete window.HTMLElement.prototype.scrollIntoView;
  }
});

test("service categories and synonyms lead to correct records and direct variants", async () => {
  await mount("/layanan");
  assert.equal(
    document.querySelectorAll(".service-category-list a").length,
    12,
  );
  await visit("/cari?q=bikin%20NPWP");
  assert.equal(document.querySelectorAll(".catalog-card").length, 1);
  await click(document.querySelector(".catalog-card h2 a"));
  assert.equal(location.pathname, "/layanan/npwp");
  await visit("/cari?q=KTP%20hilang");
  await click(document.querySelector(".catalog-card h2 a"));
  assert.equal(location.pathname, "/layanan/ktp-el/hilang");
  await visit("/program/kategori/kesehatan");
  assert.match(text(), /Tidak ada program yang sesuai/);
  await visit("/layanan/kategori/pajak");
  assert.equal(document.querySelectorAll(".catalog-card").length, 1);
});
test("global search supports clear, query submission and safe text rendering", async () => {
  await mount("/cari?q=KIP");
  assert.equal(document.querySelectorAll(".catalog-card").length, 1);
  await click(document.querySelector('[aria-label="Hapus pencarian"]'));
  await act(async () =>
    document
      .querySelector("form")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
  assert.equal(document.querySelectorAll(".catalog-card").length, 16);
  await visit("/cari?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E");
  assert.equal(document.querySelectorAll("script").length, 0);
  assert.match(text(), /Belum ada hasil yang sesuai/);
});
test("profile stores region codes, recalculates recommendations and removes additional questions", async () => {
  await mount("/profil/edit", seed());
  assert.equal(document.querySelector("h1").textContent, "Lengkapi profilmu");
  assert.equal(document.querySelector("#profile-city").disabled, true);
  await select(document.querySelector("#profile-province"), "35");
  await select(document.querySelector("#profile-city"), "35.73");
  await click(
    document.querySelector('input[name="activities"][value="pelajar"]'),
  );
  await click(
    document.querySelector('input[name="interests"][value="pendidikan"]'),
  );
  assert.equal(document.querySelector("#profile-economy"), null);
  assert.doesNotMatch(text(), /Pemeriksaan tambahan/);
  await click(button("Simpan profil"));
  assert.equal(location.pathname, "/profil");
  assert.match(text(), /Profil berhasil disimpan/);
  const profile = snapshot().accounts.one.profile;
  assert.equal(profile.provinceCode, "35");
  assert.equal(profile.cityCode, "35.73");
  assert.equal(profile.city, "Kota Malang");
  assert.doesNotMatch(localStorage.getItem(ACCOUNT_KEY), /economy|firstHome/);
  await visit("/profil/edit");
  assert.equal(document.querySelector("h1").textContent, "Ubah profil");
  assert.ok(button("Simpan perubahan"));
  assert.ok(button("Batal"));
  assert.equal(document.querySelector("#profile-city").value, "35.73");
  await select(document.querySelector("#profile-province"), "64");
  assert.equal(document.querySelector("#profile-city").value, "");
  await select(document.querySelector("#profile-city"), "64.03");
  await click(button("Simpan perubahan"));
  await visit("/");
  assert.equal(
    document.querySelector("#featured-programs-title").textContent,
    "Rekomendasi untukmu",
  );
  assert.ok(
    document.querySelector(
      '.featured-programs a[href="/program/berau-cerdas"]',
    ),
  );
});

test("profile overview empty state and account dropdown separate identity, navigation and account actions", async () => {
  await mount("/profil", seed());
  assert.equal(document.querySelector("h1").textContent, "Profil Saya");
  assert.ok(document.querySelector(".profile-simple-empty"));
  assert.equal(document.querySelector(".profile-summary"), null);
  assert.ok(anchor("Lengkapi profil"));
  assert.doesNotMatch(
    text(),
    /Mode demo|sesi browser|identitas lokal|Reset seluruh identitas|Pengaturan informasi/,
  );
  assert.equal(
    document.querySelector('.profile-information-section a[href="/rencanaku"]'),
    null,
  );
  const summary = document.querySelector(".account-menu summary");
  await click(summary);
  assert.equal(summary.parentElement.open, true);
  assert.match(
    document.querySelector(".account-dropdown-identity").textContent,
    /one@example.test/,
  );
  assert.equal(document.querySelectorAll(".account-dropdown-nav a").length, 2);
  await act(async () =>
    document.body.dispatchEvent(
      new window.MouseEvent("pointerdown", { bubbles: true }),
    ),
  );
  assert.equal(summary.parentElement.open, false);
  await click(summary);
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(summary.parentElement.open, false);
  assert.equal(document.activeElement, summary);
});

test("profile validates name, supports other activity and updates identity everywhere after saving", async () => {
  await mount("/profil/edit", seed());
  await input(document.querySelector("#profile-name"), " ");
  await click(button("Simpan profil"));
  assert.equal(document.activeElement.id, "profile-name");
  assert.equal(
    document.querySelector("#profile-name").getAttribute("aria-invalid"),
    "true",
  );
  await input(document.querySelector("#profile-name"), "Nama Baru");
  await click(
    document.querySelector('input[name="activities"][value="lainnya"]'),
  );
  await input(
    document.querySelector("#profile-other"),
    "Merawat kebun keluarga",
  );
  await click(button("Simpan profil"));
  assert.match(text(), /Profil berhasil disimpan/);
  assert.match(
    document.querySelector(".profile-account-identity").textContent,
    /Nama Baru/,
  );
  assert.equal(
    document.querySelector(".account-dropdown-identity strong").textContent,
    "Nama Baru",
  );
  assert.equal(
    snapshot().accounts.one.profile.activitiesOther,
    "Merawat kebun keluarga",
  );
  assert.match(
    document.querySelector(".profile-summary").textContent,
    /Merawat kebun keluarga/,
  );
  await visit("/profil/edit");
  await click(
    document.querySelector('input[name="activities"][value="lainnya"]'),
  );
  assert.equal(document.querySelector("#profile-other"), null);
  await click(button("Simpan perubahan"));
  assert.equal(snapshot().accounts.one.profile.activitiesOther, "");
});

test("unchanged profile can cancel directly; dirty navigation and logout wait for confirmation", async () => {
  await mount("/profil/edit", seed("one", { province: "Jawa Timur" }));
  await click(button("Batal"));
  assert.equal(location.pathname, "/profil");
  assert.equal(document.querySelector('[role="dialog"]'), null);
  await click(anchor("Ubah profil"));
  await input(document.querySelector("#profile-name"), "Belum disimpan");
  await click(button("Batal"));
  assert.ok(document.querySelector("#profile-unsaved-title"));
  await click(button("Tetap mengedit"));
  assert.equal(document.querySelector("#profile-name").value, "Belum disimpan");
  await click(button("Keluar"));
  assert.ok(document.querySelector("#profile-unsaved-title"));
  assert.equal(snapshot().activeId, "one");
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(snapshot().activeId, "one");
  await click(button("Batal"));
  await click(button("Tinggalkan"));
  assert.equal(location.pathname, "/profil");
  assert.notEqual(
    snapshot().accounts.one.identity.displayName,
    "Belum disimpan",
  );
});

test("browser back and beforeunload guard unsaved edits without losing form data", async () => {
  await mount("/profil", seed("one", { province: "Jawa Timur" }));
  await click(anchor("Ubah profil"));
  await input(document.querySelector("#profile-name"), "Nama belum disimpan");
  const unload = new window.Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  assert.equal(unload.defaultPrevented, true);
  await act(
    async () =>
      new Promise((resolve) => {
        window.addEventListener("popstate", resolve, { once: true });
        history.back();
      }),
  );
  assert.ok(document.querySelector("#profile-unsaved-title"));
  await act(
    async () =>
      new Promise((resolve) => {
        window.addEventListener("popstate", resolve, { once: true });
        button("Tetap mengedit").click();
      }),
  );
  assert.equal(location.pathname, "/profil/edit");
  assert.equal(
    document.querySelector("#profile-name").value,
    "Nama belum disimpan",
  );
  await act(
    async () =>
      new Promise((resolve) => {
        window.addEventListener("popstate", resolve, { once: true });
        history.back();
      }),
  );
  await click(button("Tinggalkan"));
  assert.equal(location.pathname, "/profil");
});

test("failed profile write retains draft and old identity, then retry commits before success feedback", async () => {
  await mount("/profil/edit", seed("one", { province: "Jawa Timur" }));
  await input(document.querySelector("#profile-name"), "Nama disimpan nanti");
  const previous = localStorage.getItem(ACCOUNT_KEY);
  const prototype = window.Storage.prototype,
    original = prototype.setItem;
  try {
    prototype.setItem = () => {
      throw new Error("Storage quota exceeded");
    };
    await click(button("Simpan perubahan"));
    assert.equal(location.pathname, "/profil/edit");
    assert.match(text(), /Perubahan belum berhasil disimpan/);
    assert.equal(
      document.querySelector("#profile-name").value,
      "Nama disimpan nanti",
    );
    assert.equal(localStorage.getItem(ACCOUNT_KEY), previous);
    assert.doesNotMatch(text(), /Profil berhasil disimpan/);
  } finally {
    prototype.setItem = original;
  }
  await click(button("Simpan perubahan"));
  assert.equal(location.pathname, "/profil");
  assert.equal(
    snapshot().accounts.one.identity.displayName,
    "Nama disimpan nanti",
  );
  assert.match(text(), /Profil berhasil disimpan/);
});

test("profile deletion requires confirmation and preserves identity/bookmarks even after a failed attempt", async () => {
  const profile = {
    province: "Jawa Timur",
    activities: ["bekerja"],
    interests: ["usaha"],
  };
  const plans = { kur: { done: [0], variant: "" } };
  await mount("/profil", seed("one", profile, plans));
  await click(button("Hapus informasi profil"));
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.deepEqual(snapshot().accounts.one.profile, profile);
  await click(button("Hapus informasi profil"));
  const prototype = window.Storage.prototype,
    original = prototype.setItem;
  const priorIdentity = snapshot().accounts.one.identity,
    priorPlans = snapshot().accounts.one.plans;
  try {
    prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
    await click(button("Hapus informasi"));
    assert.ok(document.querySelector("#clear-profile-title"));
    assert.match(text(), /Informasi profil belum berhasil dihapus/);
    assert.deepEqual(snapshot().accounts.one.profile, profile);
  } finally {
    prototype.setItem = original;
  }
  await click(button("Hapus informasi"));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.deepEqual(snapshot().accounts.one.profile, {});
  assert.deepEqual(snapshot().accounts.one.identity, priorIdentity);
  assert.deepEqual(snapshot().accounts.one.plans, priorPlans);
  assert.ok(document.querySelector(".profile-simple-empty"));
});

test("profile logout preserves profile data and bookmarks but clears private views and homepage personal state", async () => {
  const profile = { activities: ["usaha"], interests: ["usaha"] };
  await mount(
    "/profil",
    seed("one", profile, { kur: { done: [], variant: "" } }),
  );
  const saved = snapshot().accounts.one;
  await click(button("Keluar dari akun"));
  assert.equal(location.pathname, "/");
  assert.equal(document.querySelector(".account-menu"), null);
  assert.equal(
    document.querySelector("#featured-programs-title").textContent,
    "Program Unggulan",
  );
  assert.deepEqual(snapshot().accounts.one, saved);
  await visit("/profil");
  assert.equal(document.querySelector(".profile-summary"), null);
});

test("recommendation empty and partial states provide manual alternatives", async () => {
  await mount("/program/rekomendasi", seed());
  assert.match(text(), /Belum ditemukan program/);
  assert.ok(anchor("Ubah Profil"));
  await visit("/");
  assert.ok(anchor("Lengkapi profilmu"));
  await remount("/", seed("one", { province: "Jawa Timur" }));
  assert.ok(anchor("Lengkapi profilmu"));
  await remount(
    "/program/rekomendasi",
    seed("one", { interests: ["kesehatan"], activities: ["bekerja"] }),
  );
  assert.match(text(), /Belum ditemukan program/);
  assert.ok(anchor("Jelajahi Semua Program"));
});
test("guest matching remains optional, validates steps, and explains conflicts", async () => {
  await mount("/cocokkan");
  assert.ok(button("Lanjutkan").disabled);
  await click(document.querySelector('input[value="kuliah"]'));
  await click(button("Lanjutkan"));
  assert.ok(button("Lihat pilihan program").disabled);
  await click(document.querySelector('input[name="year"][value="other"]'));
  await click(document.querySelector('input[name="economy"][value="unknown"]'));
  await click(button("Lihat pilihan program"));
  assert.match(text(), /Tahun kelulusan tidak sesuai/);
  await click(button("Ubah jawaban"));
  assert.ok(
    document.querySelector('input[name="year"][value="other"]').checked,
  );
  await click(document.querySelector('input[name="year"][value="unknown"]'));
  await click(button("Lihat pilihan program"));
  assert.match(text(), /Periksa tahun kelulusan/);
  await click(button("Mulai lagi"));
  assert.ok(button("Lanjutkan").disabled);
});
test("budget supports table/chart, category and regional empty states without stale totals", async () => {
  await mount("/anggaran");
  assert.equal(document.querySelectorAll("meter").length, 8);
  await click(button("Tabel"));
  assert.equal(document.querySelectorAll("tbody tr").length, 4);
  await select(
    document.querySelector('[aria-label="Kelompok belanja"]'),
    "Belanja Modal",
  );
  assert.equal(document.querySelectorAll("tbody tr").length, 1);
  await select(
    document.querySelector('[aria-label="Wilayah anggaran"]'),
    "Jawa Timur",
  );
  assert.match(text(), /Data anggaran belum tersedia/);
  assert.equal(document.querySelector(".budget-summary"), null);
  await select(
    document.querySelector('[aria-label="Wilayah anggaran"]'),
    "nasional",
  );
  assert.ok(document.querySelector(".budget-summary"));
  await select(document.querySelector(".budget-controls select"), "2025");
  assert.match(text(), /Data anggaran belum tersedia/);
});
test("mobile filter sheet and menu controls work with focus restoration", async () => {
  mobile = true;
  await mount("/program");
  await select(document.querySelector("#category-filter"), "pendidikan");
  await click(button("Filter lainnya"));
  assert.ok(document.querySelector("#program-advanced-title"));
  assert.ok(document.querySelector('[role="dialog"]'));
  await click(button("Tampilkan 4 program"));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  await click(document.querySelector('[aria-controls="main-navigation"]'));
  assert.equal(
    document
      .querySelector('[aria-controls="main-navigation"]')
      .getAttribute("aria-expanded"),
    "true",
  );
  await act(async () =>
    document.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(
    document
      .querySelector('[aria-controls="main-navigation"]')
      .getAttribute("aria-expanded"),
    "false",
  );
});
test("all visible internal links resolve and public page forms have labels without duplicate IDs", async () => {
  await mount("/");
  const paths = new Set([
    "/",
    "/program",
    "/layanan",
    "/anggaran",
    "/bantuan",
    "/sumber",
    "/tentang",
    "/privasi",
    "/masuk",
    "/daftar",
    "/layanan/lokasi?layanan=ktp-el",
  ]);
  for (const item of catalog) {
    paths.add(`/${item.type}/${item.id}`);
    if (item.variants)
      for (const variant of item.variants)
        paths.add(`/layanan/${item.id}/${variant.id}`);
  }
  for (const path of [...paths]) {
    await visit(path);
    for (const link of document.querySelectorAll('a[href^="/"]'))
      paths.add(link.getAttribute("href"));
    const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs on ${path}`);
    for (const input of document.querySelectorAll("main input,main select")) {
      assert.ok(
        input.getAttribute("aria-label") || input.labels?.length,
        `Missing label on ${path}`,
      );
    }
  }
  for (const path of paths) {
    await visit(path);
    assert.doesNotMatch(
      text(),
      /Halaman ini belum ditemukan/,
      `Broken internal destination ${path}`,
    );
  }
});
test("invalid deep links and missing location lists provide honest recovery", async () => {
  await mount("/program/unknown");
  assert.match(text(), /Halaman ini belum ditemukan/);
  await click(document.querySelector('.empty a[href="/"]'));
  assert.equal(location.pathname, "/");
  await visit("/layanan/lokasi?layanan=ktp-el");
  assert.match(text(), /Daftar lokasi yang sesuai belum tersedia/);
  assert.ok(document.querySelector('a[target="_blank"]'));
  await visit("/program/kip-kuliah/persyaratan");
  assert.ok(document.querySelector(".program-detail-documents"));
  assert.doesNotMatch(text(), /Halaman ini belum ditemukan/);
});
