# Profile flow revision

## Scope and files

Implemented on 1 November 2026 using the existing session-backed account context and HAKKITA styles. No database/provider was added and no identity was fabricated from a claimed Google response. The user-authorized session login remains unchanged.

- `ProfilePages.jsx`: shared identity avatar, overview, profile editor, checkbox groups, delete confirmation and unsaved-changes dialog.
- `profile-data.ts`: canonical region-code mapping, compatible name lookups, dirty detection, activity labels and initials.
- `profile.css`: scoped form/overview/account-dropdown presentation.
- `AccountPages.jsx`: re-exports the new profile pages; legacy demo authentication and existing recommendation page retained.
- `AccountContext.tsx`: atomic name/profile persistence, actual save feedback, safe profile deletion and failure results.
- `AppShell.jsx`: structured account dropdown, outside/keyboard dismiss, and profile-aware navigation guard including Back/Forward and deferred logout.
- `models.ts` / `account-store.ts`: optional provinceCode, cityCode and activitiesOther fields, added to the existing persistence whitelist.
- `homepage-featured.ts`: eligible homepage results ordered by the number of recorded criteria known to match; no score, badge or card styling change.
- `tests/profile.test.mjs`, `tests/ui.test.mjs`, `scripts/run-tests.mjs`: domain and functional regression coverage.

## Account menu and overview

The account menu shows initials, the current session display name and email, then Profil Saya/Rencanaku, then Keluar with dividers. Technical/demo storage wording is removed. Outside pointer/focus and Escape dismiss the menu; Escape returns focus to the avatar. Native details/summary and normal focusable links retain keyboard behavior.

Profil Saya has the requested functional heading/subheading and three separated groups: account identity, personalization summary, and account settings. Empty profiles use one brief empty state and Lengkapi profil. Partial/populated profiles show only the three relevant groups with Ubah profil/Lihat rekomendasi. Recommendations link to the existing `/program/rekomendasi` destination. There is no duplicate Rencanaku action group or browser-reset/account-deletion imitation.

## Editor and data

One editor distinguishes Lengkapi profilmu/Simpan profil/Lewati untuk sekarang from Ubah profil/Simpan perubahan/Batal. It collects display name and optional region, activities and seven existing interests. Kegiatan lainnya is optional and visible only while Lainnya is selected; its free text is not interpreted as eligibility criteria.

Region selects use the bundled nationwide 38-province/514-regency dataset. Canonical codes drive values; derived province/city labels are retained for compatibility with existing recommendation metadata and older saved records. A city cannot be selected before a province, and a changed province clears an invalid city. Valid existing label-based records map to codes. Unsupported old free-text city values are not invented or silently converted; the editor asks for reselection.

The additional eligibility/questions block and educational/age question UI are removed from the main form. Existing non-sensitive legacy metadata is retained on save for compatibility rather than silently deleted; new forms do not collect it. Hapus informasi profil clears all personalization fields, including old fields. No NIK, income, address, passwords or tokens are added.

## Save, delete and navigation

Name and profile are written together through the active storage adapter before state/feedback is updated. New primary login sessions use sessionStorage; isolated legacy examples keep their existing adapter. Write failure leaves saved identity/profile unchanged, retains the draft, shows an error and permits retry. Saving uses a busy guard and loading state without an artificial timer. Only an actual successful write produces Profil berhasil disimpan.

Deletion is confirmed in a keyboard-accessible dialog. Escape/Batal retain data. Failure keeps the dialog and profile available for retry. Success removes personalization only; identity, other accounts and all Rencanaku entries remain. Logout ends the active identity and clears private views/personal homepage mode without deleting the saved profile.

Changed forms block internal links, Cancel/Skip, logout and browser Back/Forward until the user confirms leaving. Native beforeunload covers reload/closing/external navigation. Unchanged forms leave directly. A confirmed save bypasses the guard and returns to Profil Saya. Browser history cancellation restores the previous entry instead of creating a duplicate route.

Homepage still uses the same carousel and cards. Changes flow from the shared profile state, known mandatory conflicts are excluded, incomplete/no-result profiles use the existing general fallback, and no certainty of eligibility is claimed. Full catalog access remains available regardless of interests.

## Verification and limitations

TypeScript and 110 automated tests pass. Tests cover region codes/old labels, multi-select/free text, empty/partial profiles, identity updates, no-change cancellation, dirty navigation and logout, native Back cancellation, beforeunload, failed writes/retry, failed deletion/retry, retained bookmarks and logout fallback. Production build is run after the final formatting pass. No lint command is configured.

Browser preview still reports `The browser access host is unavailable`; rendered desktop/mobile screenshot verification is pending. Responsive CSS and DOM/keyboard behavior were checked through code/tests, not a rendered visual audit.

Real authentication, provider-name synchronization, cross-device persistence, backend account deletion and actual server-session expiry remain dependent on a backend/provider. No fake account-deletion or server-expiry flow is exposed. The existing browser-session login was explicitly requested by the user and was not replaced or presented as a new production integration.

## Final validation

All 110 automated tests and TypeScript checks passed. Production build completed successfully; Vite emitted the existing bundle-size advisory. Rendered browser QA remains unavailable.
