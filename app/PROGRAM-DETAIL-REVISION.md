# Dynamic program detail revision

Implemented 1 November 2026. Applies to program details and `/persyaratan` deep links. Existing service detail pages, canonical catalog records, bookmarks and account storage remain compatible.

## Files and components

- `src/ProgramDetail.jsx`: reusable `ProgramSection`, `DocumentList`, `AccessRoutes`, `ProgramPeriods`, `ProgramSources`, `ProgramActions` and overview shell.
- `src/program-detail-model.ts`: strongly typed information states, documents, access routes, benefit values, sources and actions.
- `src/program-detail-config.ts`: explicit editorial mechanism mappings for all eight programs, contextual actions and justified guide relationships.
- `src/program-detail.ts`: normalization, section visibility, safe official URLs, period evaluation and monetary formatting.
- `src/program-detail.css`: scoped responsive layout; loaded by `main.jsx`.
- `src/discovery.jsx`: program-only renderer branch; service rendering retained.
- `src/models.ts`: optional `ProgramMetadata.detail` configuration. No destructive dataset migration.
- `tests/program-detail-fixtures.mjs`, `tests/program-detail.test.mjs`, `tests/ui.test.mjs`, `scripts/run-tests.mjs`: isolated synthetic fixtures, domain tests, render tests and regression integration.

## Data and rendering

Mechanisms support self-registration, competitive selection, recipient assignment, financing, subsidy, assessment/referral, training, service delivery, hybrid routes and unknown mechanisms. Programs may have several mechanisms. Classification is explicit, rather than inferred from categories.

The adapter retains legacy string arrays and supports optional structured configuration. Information distinguishes verified, unverified, unknown, not applicable, conditional, outdated and conflicting states. Not-applicable and empty optional sections are hidden. Important unknown documents, requirements and access routes receive contextual guidance. Unverified, conflicting and outdated field values are not rendered as settled facts.

The overview shows up to four meaningful metadata items. Main content separates benefits, targets, requirements, documents and access steps. Existing overview/about duplication is suppressed. Monetary values support ranges, percentages and conditional/non-cash benefits; amounts without a unit or with invalid formatting are omitted. No production amounts, durations or new schedules were invented.

Documents support required, optional, conditional, alternative and confirmation-needed states with conditions, routes and regional scope. Unknown ATENSI/Berau document lists do not become generic checklists. Numbered access routes support online, offline, mixed, conditional and several labeled branches. Preparation checklists in Rencanaku retain their original indices and semantics.

## Actions and trust

Primary CTA labels follow the configured destination: information, guide, financing, status, contact or registration. Registration wording requires a verified open schedule and eligible lifecycle/source status. Closed/unknown schedules fall back to information wording; discontinued/legacy programs do not show active application periods. Invalid URLs and sources marked unavailable/outdated/conflicting do not become active primary actions. Bookmark remains available without an application link and uses the existing guest/account flow.

KUR and FLPP explicitly retain credit/repayment obligations. ATENSI links to its PDF guide rather than an invented online application. PIP uses recipient checking. Kaltim Tuntas preserves the existing-recipient/old-regulation warning. Berau preserves schedule uncertainty.

Sources retain official links, source types, organization and independently recorded publication/update/check dates where provided. Existing `timeline.contentReviewedOn` is a stored review date, not a live URL availability check. Dates are never generated from render time. No new blanket verification claim or live uptime check has been added.

Only one optional Panduan terkait section is rendered, based on explicit relationship reasons and existing service IDs. ATENSI has no speculative KTP/BPJS suggestions; KUR/FLPP guides are grounded in their document requirements.

## Layout and validation

Desktop uses approximately 70/30 columns with 44px gap, 32px/700 H1, 24px section titles and 15–16px body copy. The action panel sticks below the header within its containing column. At 850px and below it becomes a static panel after the overview, before long content. Metadata wraps, lists remain readable, and links have keyboard focus through the existing global styles. No new animations are introduced.

Domain/render fixtures cover scholarship, internship, recipient assignment, credit, housing subsidy, rehabilitation/assessment, training, sparse data, several routes, closed applications, conflicting sources, and information-only destinations. Additional cases cover invalid URLs, unavailable sources, alternative documents, retained bookmarks, discontinued/renamed programs and monetary units.

Browser preview could not be opened: the browser access host reports unavailable. A local dev server responds on port 5173, but responsive screenshots and visual overflow checks at specific viewport widths remain unverified. No lint script is configured; TypeScript, formatting and automated tests are the available checks.

## Dataset limitations

No production internship record is available; that mechanism is exercised only by isolated test fixtures. Verified durations, benefit amounts, alternate distributors, office contacts and district-specific application routes remain absent unless provided in the canonical data/config. They are supported by the schema without being fabricated. Enrollment status depends on the existing manually maintained timeline; it is not a live integration with organizers. Bookmark persistence failures continue through the existing application-level storage feedback.

Final automated validation: 82 tests passed, TypeScript passed, production build passed. All eight program detail routes and requirements deep links remain covered. Visual browser verification remains unavailable as described above.
