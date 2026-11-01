# Prototype Instructions

Latest user typography preference: use `font-family: 'Geist', Arial, sans-serif;` throughout Hakkita. Keep the font self-hosted.

User header preference: omit the top information strip containing "Informasi publik, bersumber dari kanal resmi" and "Kenali sumber kami". Start the page with the main navigation header.

Omit the search icon/link from the header navigation. Keep search available in the hero and catalog pages.

Use the user-supplied geometric blue/red Hakkita logo (`public/hakkita-logo.png`) in the header and footer instead of the text wordmark. Preserve its original artwork and transparency.

User prefers a smaller logo: 152px wide on desktop and 132px on mobile, in both header and footer.

Do not show an illustration above the footer. The footer copyright should read only "Ã‚Â© 2026 Hakkita."; omit "Dibuat untuk membantu memahami hak dan layanan publik."

Use font-weight 600 for the homepage hero headline to keep it lighter. The latest master revision sets its copy to "Temukan program yang sesuai dengan kebutuhanmu."

Omit the "HAKMU, LEBIH DEKAT." eyebrow above the homepage hero headline. Keep the headline slightly smaller: 46px default, 53px on wide desktop, 41px/37px on intermediate breakpoints, and 30px on mobile.

Use the latest user-supplied "Pastel Lakeside City Park Panorama" (`public/hero-lakeside.png`, 2168Ãƒâ€”537) for the homepage hero illustration. Preserve its transparency, original artwork, and panoramic aspect ratio.

The master frontend revision makes Kenali Hakmu the flagship: use 7 program categories and 12 separate service categories. Keep public content accessible without an account. Local example identities are optional and have no passwords; bookmarks belong to individual identities, and economic/housing answers must stay in session memory, outside localStorage. Preserve React/Vite, Geist, Phosphor, the supplied assets, and the user's simplified footer.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Homepage FAQ uses a two-column layout: heading and help link on the left, five numbered accordion rows with plus/minus indicators on the right. Stack heading, accordion, then help link on mobile; preserve Hakkita colors and existing FAQ content.


Place inline personalization below the program carousel, inside Jelajahi program pilihan, rather than in the program category section. Preserve the account-aware copy and links.

Program carousel: omit the playback button. Position previous and next arrows at the left and right of the cards, vertically centered, with no page overflow. Keep autoplay pause on hover/focus/manual interaction and reduced-motion handling.

Latest carousel preference: remove both visible navigation arrows and the playback button. Cards occupy the full carousel width; retain swipe/drag, keyboard navigation, and autoplay behavior.

Use a compact, balanced header height: 80px desktop, 84px wide desktop, 76px intermediate, 68px tablet, and 64px mobile. Keep logo dimensions and navigation vertically centered; mobile dropdown starts at 100% of header height.

Footer restored to its original light gray background (#f7f8fa), original blue/red logo, muted gray links and copyright, and standard thin divider. The blue footer and white logo change was reverted at the user's request.

Keep the original header navigation alignment; the centered navigation change was reverted at the user's request.



Program cards follow the supplied photo-led reference: wide photographic header, outlined blue category pill, bold navy title, concise summary, thin divider, rounded blue Lihat Program button and outline bookmark. Apply consistently to program cards in homepage and catalogs; retain existing service card design and functionality.

Program card backgrounds must be white (#fff), including the homepage carousel and catalog.

Keep program cards compact: body padding 18px desktop/16px mobile; category-to-title and title-to-summary gaps 12px; title 20px desktop/19px mobile with no reserved minimum title height; summary 13px; CTA text 12px, arrow18px, bookmark23px; retain 44px interaction targets. Use a 3:1 photo ratio and white background.

Use an 8px border radius for the Lihat Program button on program cards.

Latest hero headline: Informasi Program dan Panduan Layanan Publik dalam Satu Tempat. Highlight only Program and Panduan Layanan using the primary blue token; use balanced responsive wrapping and retain existing headline typography.

Latest hero typography overrides previous headline sizing/weight: hero-title max-width900px, font-size clamp(2.25rem,3.6vw,3.25rem), weight700, line-height1.17, letter-spacing-.025em, #292929; highlight#1769c2. Description max-width620px, margin-top24px, clamp(1rem,1.35vw,1.125rem), line-height1.65, #687385. At max640px title clamp(2rem,7vw,2.5rem)/1.2; description1rem/1.6 with20px top margin. Use natural wrapping with no forced line break; keep28px between description and search.

Slightly smaller hero headline: use clamp(2.125rem, 3.4vw, 3rem) on desktop and clamp(1.875rem, 6.6vw, 2.375rem) at max-width640px; retain other hero typography settings.

Omit the footer text Portal informasi publik independen. Render copyright using the HTML entity &copy; to avoid text encoding corruption; display copyright as (copyright symbol) 2026 Hakkita.

Mengenal Hakkita follows layout and copy from mengenal-hakkita-dua-kartu.html: centered intro with Kenali HAKKITA link, then two feature cards (Kenali Hakmu and Layanan Publik) with static interface previews, and the provided footnote. Preserve Hakkita Geist typography, blue/warm neutral palette, simple borders/radii; do not import the reference's Inter font or decorative/rotated styling. Use existing /program and /layanan routes for feature links.

Omit the Kenali HAKKITA link/button from the Mengenal Hakkita introduction. Retain the two feature-card links.

Omit the interface illustration footnote beneath the Mengenal Hakkita feature cards.

Keep the MENGENAL HAKKITA eyebrow as plain text without pill padding or border; the pill change was reverted.

Remove interface previews from both Mengenal Hakkita feature cards. Keep titles, descriptions and CTA links, with balanced bottom padding and no reserved preview space.

Mengenal Hakkita: omit feature numbers01/02, render PROGRAM & KESEMPATAN and PANDUAN PENGURUSAN as outlined pills. Center the two-card grid with max-width920px and compact24px padding. Add subtle blue/warm-neutral gradients to feature cards and a soft gradient glow around the introduction headline. Use headline font-weight700. This explicitly requested gradient accent overrides earlier flat-only preferences for this section.

Latest hero headline desktop size: 40px. Preserve the existing responsive mobile override at max-width640px.

Homepage program category section now uses heading Temukan program yang kamu butuhkan and subheading Jelajahi berbagai kategori bantuan dan kesempatan sesuai kebutuhanmu. Seven white category cards: 42px pale-blue icon badge, navy600 label, circular30px chevron; 14px gaps/radius, min-height88px. Three columns at>=1024px, two640-1023px, one below640px. Full-card category links, focus ring, subtle hover, reduced motion; no dummy counts. Leave personalization under Program Pilihan per earlier request.

Homepage content containers: minimum48px per side on desktop>=1024px, max-width1200px. Keep32px per side on tablet641-1023px and20px per side on mobile<=640px.

Latest horizontal container spacing: minimum56px per side on desktop>=1024px across homepage, header, footer and all other pages. Retain max-width caps (homepage1200px, others existing container token), tablet32px, and mobile20px.

Latest header logo size:136px desktop,120px mobile<=640px. Footer logo remains at its existing size.

Program Pilihan revision: section heading Program pilihan, subheading Jelajahi berbagai program bantuan dan kesempatan yang tersedia., section CTA Lihat semua program. Homepage carousel cards use concise curated summaries, light12px category labels, two-line titles with full-title attribute, three-line summary space, aligned footers, and text CTA Lihat detail program. Scope curated styling/copy to carousel; preserve catalog cards, photos, and existing carousel mechanics. Inline personalization guest/incomplete: Ingin rekomendasi yang lebih sesuai kebutuhanmu? plus appropriate register/profile link; sufficient profile: Temukan program berdasarkan profilmu. Lihat rekomendasi. No new navigation arrows.

Latest featured section heading: Program Unggulan. Place InlinePersonalization as its subheadline, not beneath the carousel. Guest copy: Ingin rekomendasi yang lebih sesuai kebutuhanmu? Buat akun dan lengkapi profilmu. Preserve registration intent/return URL and account-aware profile/recommendation links; do not duplicate the text below cards.

Latest featured program cards: category uses an outlined pill with3px vertical/9px horizontal padding. CTA text is Lihat Program (retain lightweight link style). Compact footer spacing:6px above action row and10px card-body bottom padding; retain44px click targets.

Homepage category icons use the seven supplied PNG files from7_ikon_kategori_2d_transparan.zip under public/program-category-icons, mapped by category id. Preserve original artwork and transparency; display48x48px with object-fit contain and no pastel square background. Keep labels, card links and other section icons unchanged.

Latest homepage category sizing: supplied icons60x60px, category labels17px. Preserve responsive wrapping and full-card links.

Homepage public services revision: preserve headline Ada keperluan yang ingin diurus?; subheading Temukan panduan persyaratan dan langkah pengurusan berbagai layanan publik. Six compact task-first cards (KTP Elektronik, Daftar NPWP, Perpanjang SIM, Buat Paspor, Buat SKCK, Layanan BPJS Kesehatan), icon/title/short accurate guide description/chevron. BPJS description explicitly covers available JKN registration guide. Top Lihat semua layanan opens /layanan at top; lower category CTA opens /layanan#kategori-layanan and focuses/scrolls to existing12-category section. Use3/2/1 responsive grid, blue pastel42px icon badges, modest borders/radii, keyboard focus, reduced motion. No homepage category catalog duplication.

Remove the Lihat semua layanan link from the homepage public-services section heading. Preserve all six guide cards and the lower Lihat kategori layanan CTA.

Use Layanan Publik as the service navigation menu label in header and footer, retaining the /layanan route.

Homepage transparency uses one soft blue-gray panel with two columns: eyebrow TRANSPARANSI INFORMASI, headline Ketahui sumber informasi dan anggaran publik., and description Periksa rujukan informasi program dan layanan, serta jelajahi data anggaran yang tersedia. Right column links Tentang sumber informasi (/sumber) and Telusuri anggaran (/anggaran), separated by a thin divider and using arrow-up-right icons. No decorative shield, gradients or separate cards. Padding44px desktop/32px tablet/24px mobile; stack below800px.

Transparency panel: remove TRANSPARANSI INFORMASI eyebrow and show the user-supplied Magnifying Glass Document Review icon (public/transparency-review.png) above the heading at80px with transparency preserved. Keep cream background, thin warm-neutral border and existing navigation.

Transparency panel heading sits beside the supplied icon in a vertically centered horizontal row. Icon112px desktop/80px mobile; description remains beneath the row.

Latest transparency panel: use supplied Document Search Badge Icon.png at public/transparency-review.png, preserve original artwork/transparency. Background uses --blue-pale (#f0f6fd) with thin soft blue border (#d8e4f2), replacing cream.

Transparency layout follows latest supplied screenshot: icon left, heading and description aligned together to its right, source/budget links in right column. Use compact32px panel padding and blue28px/700 headline; icon96px. Mobile icon72px beside heading with description full width below.

Latest homepage FAQ: seven questions/answers from attachment5c97f43d-aa50-486a-ab04-caeadfbc4bba, with description Temukan jawaban seputar penggunaan HAKKITA, rekomendasi program, dan layanan publik. Keep two columns, compact left intro, no help CTA/block, no numbering, no gray card backgrounds. Use thin divider accordion, semantic buttons with aria-expanded/controls, single-open behavior and all closed by default; plus/minus icons,200ms expand/collapse respecting reduced motion. Reuse FAQ component via minimal variant and homepage-specific dataset; preserve /bantuan content/layout.

Restore the Masih punya pertanyaan? block below the homepage FAQ introduction, with copy Temukan panduan untuk menjelajahi program, layanan, dan fitur HAKKITA. and Pusat Bantuan button linking to /bantuan. Keep36px separation rather than pushing it to the bottom of the column. Preserve the seven-question minimal accordion.

Latest FAQ help positioning: pin Masih punya pertanyaan? and Pusat Bantuan to the bottom of the left column, aligned with the accordion bottom on desktop. On stacked layouts place the help block after the accordion.

Latest hero background: light blue #edf6ff, replacing cream. Add subtle white Phosphor Cloud decorations with slow28-34s horizontal drift (28px range) behind content. Keep supplied landscape, text and search unchanged; clouds must be aria-hidden, pointer-events none, clipped to hero, and static for prefers-reduced-motion. Show fewer clouds on mobile.

Hero clouds now use generated transparent cotton-soft raster public/hero-cotton-cloud.png, replacing flat Cloud icons. Slightly higher opacity:65% primary,50–55% secondary; mobile45–55%. Preserve slow drift, decorative accessibility treatment and reduced motion.

Revert cotton-cloud asset usage and increased opacity. Hero clouds use the original subtle Phosphor Cloud decorations, blur2px, desktop35–50% opacity and mobile30–40%, with original slow drift. Keep the light blue hero background.

Remove all decorative hero clouds and their animations. Keep the hero light blue (#edf6ff) with the original landscape illustration.

Latest hero background: vertical light-blue-to-white gradient (180deg, #edf6ff 0%, #f5faff55%, #fff100%). Keep decorative clouds removed.

Latest header alignment overrides previous revert: split desktop into brand left, four main links centered exactly, and Rencanaku plus account actions right. Use grid minmax(0,1fr) auto minmax(0,1fr),36px column gaps,28px main-link gaps,14px action gaps. Only four main links in .header-main-nav; actions in .header-account-actions. Do not position/transform nav for centering. Use existing mobile dropdown at<=1150px to avoid overlap; match its focus-trap media query. Preserve logo dimensions, typography, buttons, routes, active underline, header heights and horizontal spacing.

Kenali Hakmu /program catalog revision: no permanent sidebar. Use shared filterCatalog logic, horizontal category/region/recipient dropdown/advanced controls, query and individual multi-select chips, clear-all, dynamic result count and URL-based A-Z/Z-A sorting. Search is program-only and preserves filters/sort; clear query separately. Advanced modal applies immediately, reset and close/Escape restore focus. Keep focus/scroll during program-catalog filter URL updates. Use compact catalogCard variant without changing homepage carousel, services or details. Reuse InlinePersonalization from Personalization.jsx after results toolbar; expose existing /cocokkan in empty-state context. Six current program records do not need pagination.

Program sorting defaults to latest (Terbaru dicatat), with deadline (Tenggat terdekat) and az/za alternatives. Store per-program timeline in program-timeline.js: original addedOn unknown=null, firstRecordedOn2026-11-01 baseline, contentReviewedOn2026-10-31, separate verified source-scoped periods and scheduleVerifiedOn. Do not invent historic addition or enrollment dates. Deadline ordering uses Asia/Jakarta and never treats expired/unknown dates as upcoming. Show scope and source link in catalog deadline mode; preserve all filter/query state. Baseline timestamp ties sortA-Z. Schedule updates are manual.

Latest program-card rules: omit deadline/date information from cards even when sorting by deadline; preserve time metadata and sorting. All program-card titles and descriptions are capped at2lines with ellipsis/clamping; title link retains full name in title attribute and DOM. Reduce reserved summary space to2lines for both homepage curated cards and catalog variants.

Omit helper/explanatory notes beneath program sorting controls for latest/deadline sorting. Preserve sorting metadata and functionality.

Latest program search/filter revision: compact54px search(max920px), one leading search icon and text-only Cari button. Main filters compact inline flex-wrap, labels visually hidden, Filter lainnya subtle sliders action, recipient popup includes Hapus pilihan. Program advanced modal uses draft apply-on-submit and dynamic Tampilkan X program; cancel discards changes; Reset filter tambahan resets only manfaat/pendidikan/periode. Benefit multi-select7options with OR; explicit benefitTypes metadata (FLPP financing+subsidy), AND acrossgroups. Remove organizer-level/current-activity from advanced UI but preserve metadata. Show education conditionally with requirement-context helper; hide period control until a majority has valid verified schedules. Preserve existing time/name sorting, cards and other pages.

Remove the inline personalization/register prompt from the Kenali Hakmu program catalog. Keep the homepage Program Unggulan personalization prompt and all account/recommendation routes unchanged.

Regional program catalog: add Beasiswa Berau Cerdas (Kalimantan Timur / Kabupaten Berau) and Beasiswa Kaltim Tuntas (province-wide). Use official source links; Kaltim Tuntas is information for existing recipients/MONEV, never claim new registration is open. Program district filter uses kabupaten URL parameter, derives available cities from coverage metadata, retains national/province-wide programs, clears district when province changes, and preserves it in advanced previews. New records have actual addition tracking dated 2026-11-01; no invented enrollment deadlines.

Latest regional filter: one Wilayah trigger/popover containing province and dependent kabupaten/kota selects; never separate top-level controls. Bundle nationwide dataset in src/data/indonesia-regions.json from wilayah.id (38 provinces, 514 regencies/cities, source snapshot 2025-07-04), refresh via scripts/update-regions.mjs with count/parent integrity checks. Choices never depend on catalog coverage. Single combined region chip clears both fields. Show contextual empty state when local data is absent, retaining clearly identified national coverage. Preserve URL, previews and province-change district resets.

Page intro typography: all menu/page PageIntro headings use 28px, weight600 across desktop/mobile, replacing catalog clamp and account overrides. Remove width caps on intro wrapper/subheadlines so desktop copy uses available width; retain natural wrapping on smaller screens. Homepage hero and section headings retain existing typography. Program search fills catalog content width.

Latest page intro headline overrides previous typography: use 32px and font-weight700 on all PageIntro headings, including account pages and responsive breakpoints. Preserve full-width subheadlines.

Footer visibility: omit footer on /masuk, /daftar, /rencanaku, /selamat-datang, /profil, /profil/edit and /program/rekomendasi (including guest account gates). Keep header and public-page footer.

Dynamic program detail: use ProgramDetail.jsx with program-detail-model/config/normalizer and scoped CSS for program routes only, preserving service details and account/bookmark flows. Explicit multi-mechanism configurations for all programs; do not infer registration from category. Hide inapplicable fields, distinguish unknown/unverified/conditional/outdated/conflicting information, no invented documents/amounts/schedules. Use contextual official actions; registration CTA requires verified open period. Desktop ~70/30 with sticky action panel; <=850px static actions immediately after overview. H1 32px/700. Sources show independently recorded dates without automatic current-date claims. Only one justified related-guides section; omit speculative ATENSI KTP/BPJS relationships. Keep synthetic scenarios out of production catalog. Details documented in PROGRAM-DETAIL-REVISION.md.

Program detail presentation: omit the section-shortcut navigation and per-section Rujukan footnotes. Retain source metadata in the model and the consolidated Sumber Informasi section at the bottom.

Program overview metadata uses a relevant Phosphor icon in a 44px pale-blue square (10px radius) to the left of each label/value pair; mechanism, coverage, organizer and custom metadata all receive icons without changing their content.

Program detail identity: reuse supplied category PNG assets from public/program-category-icons beside the category label and program title, 80px desktop/64px mobile, preserving transparency/artwork. Shared mapping in category-images.js also serves homepage category cards.

Latest program detail layout supersedes previous left-icon identity: full-width header with category/title/summary left and supplied category image at far right (104px desktop,64px mobile). Full-width divider below header. Desktop metadata below divider on left, action panel aligned at its top on right, content follows metadata. Mobile retains early actions before metadata/long content.

Program detail action panel must remain static on desktop and mobile; do not use sticky positioning.

Latest authentication revision overrides legacy example-only primary sign-in: /masuk, /daftar, /lupa-kata-sandi use AuthPage/AuthLayout/AuthHeader with minimal logo+home header, no nav/breadcrumb/global footer, centered440px form and optional profile. No real auth backend/provider exists: Google/email/password/reset controls must remain honestly disabled until configured; never authenticate via localStorage or store passwords/tokens. auth-service.ts is the integration boundary. Legacy identity UI lives only at /demo/masuk and /demo/daftar, visibly labeled, with old data retained. Do not auto-redirect cached demo identities from real-auth pages. Preserve safe return/query/hash and bookmark intent; do not pretend production OAuth, email verification/reset, session expiry or account-linking are integrated. See AUTH-REVISION.md.

User override: activate dummy login/registration and Google dummy on primary /masuk and /daftar. Pass sessionDemoService explicitly, with visible mode-demo/session-only explanation. Store identity/profile/plans in sessionStorage (hakkita-session-demo-v1), never database or permanent localStorage for these new sessions; never persist passwords/tokens. Keep legacy local data separate/unchanged. Google uses a fixed example identity, no OAuth, and original local Google G logo public/google-g-logo.png. Preserve safe redirects, bookmark intents and optional profile. Real authService stays unconfigured/disabled; password recovery remains unavailable rather than falsely sending mail.

Latest auth copy: remove the Mode demo/Data tersimpan/session-only explanatory banner from Masuk/Daftar. Preserve user-authorized sessionStorage dummy behavior, Google logo, and no password/token persistence.

Homepage featured section dynamically reuses the existing carousel/cards: guest sees Program unggulan plus existing registration prompt; signed-in incomplete profile sees general programs plus Lengkapi profilmu; adequate profile with eligible matches sees Rekomendasi untukmu and Temukan program yang relevan berdasarkan informasi profilmu. Use shared recommendation rules, reject known mandatory conflicts and legacy/discontinued records from personal selections. No personal results => clearly general heading/copy and original general records. No new card badges/attributes/style changes. Lihat semua program remains /program without filters; status/profile changes update data and reset carousel only when its item set/mode changes. Selector is homepage-featured.ts; no changes to other sections or shared recommendation-page behavior.

Default destination after primary Masuk/Daftar is homepage /, not Rencanaku. Preserve explicit safe next destinations and bookmark/profile intent continuations. Guest fallback stays /program; isolated legacy /demo destinations are unchanged.

Latest profile flow: use ProfilePages.jsx/profile.css and shared profile-data.ts. Profile Saya groups account identity, profile information and account settings; show actual initials/name/email in the account dropdown. Optional editor collects name, coded province/dependent city, multiple activities and seven program interests; Lainnya reveals optional text which is never parsed for recommendations. Do not collect additional eligibility questions in the main form or expose demo/storage jargon. Preserve legacy metadata on edit. Save identity/profile atomically through the active storage adapter before success/navigation; retain drafts on failure. Guard unsaved navigation, logout, browser Back and reload. Hapus informasi profil clears personalization only after confirmation, preserving identity and Rencanaku. User-authorized session-only dummy authentication remains; do not invent backend/provider sync or permanent account deletion. See PROFILE-REVISION.md.

Latest user override: enable /lupa-kata-sandi with sessionDemoService, active validated email form and Lanjutkan pemulihan action. Return a distinct recovery_demo_requested result; do not send email, alter credentials, create sessions or inspect account existence. Show honest post-submit simulation feedback. Real-provider authService password reset remains disabled until integrated.
