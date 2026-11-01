# Authentication revision

## Latest user-authorized session demo

The user explicitly requested functional dummy login instead of disabled controls. Primary `/masuk` and `/daftar` now receive `sessionDemoService`: email forms and Google dummy action are enabled. A visible notice explains that this is a browser-session demo, the Google action uses an example identity without contacting Google, and example passwords should be used. This supersedes the disabled-primary-UI behavior documented in the earlier audit below. The unconfigured real `authService` remains disabled and is not used to fake trusted authentication.

Identity, profile and Rencanaku data from these primary flows use `sessionStorage` under `hakkita-session-demo-v1`, separated from legacy localStorage records. There is no database or backend call. Passwords and tokens never enter the session/account model. Reloads restore the tab session; clearing/ending that session removes this demo state. Login does not verify credentials: any valid demo email and nonempty example password can enter the simulation. Google uses one fixed example email and reuses its session identity without OAuth or duplicate bookmarks.

The existing saved-intent continuation handles navigation after dummy login, variant-specific bookmarks and optional profile completion. Existing legacy local data is not overwritten by these new session records. Logout removes the active session identity while keeping the current tab's demo records available to revisit within that session.

The Google button now includes the original image downloaded from `https://developers.google.com/identity/images/g-logo.png`, served locally as `public/google-g-logo.png`. No Google SDK or external login flow is claimed. Password reset remains unavailable because no email is sent.

Validation: 93 automated tests pass; TypeScript passes. New coverage checks session-only persistence, password/token stripping, reload restoration, cleared-session guest state, unchanged legacy storage, enabled Google logo button, stable Google dummy identity and idempotent bookmarks. Real OAuth/email authentication is still not integrated. The remaining sections describe the previous baseline and integration requirements.

## Audit and implementation boundary

The application has no installed auth provider SDK, trusted authentication/session endpoint, OAuth callback, password-reset transport or auth environment configuration. `AccountContext.tsx` and `account-store.ts` implement browser-only example identities restricted to `@example.test`, including existing plans, profile data and legacy imports. These records are not verified production accounts.

No authentication provider or credentials were invented. No new SDK was selected. Google login, email/password login, registration and password recovery are **pending backend/provider configuration**. Their production UI controls are disabled with a visible explanation; no personal password can be entered into the unavailable form. Submitting the form programmatically does not call the local identity adapter, create an account, send email, store credentials or report success.

## UI

`AuthPage.jsx` provides a reusable `AuthLayout` and `AuthHeader`. `/masuk`, `/daftar` and `/lupa-kata-sandi` use a focused header with the original HAKKITA logo and Kembali ke beranda, with no global navigation, breadcrumb or global footer. The form is centered at 440px, has 50px controls, 10px corners and 18px field gaps. Mobile uses 20px side padding and ordinary page scrolling.

Registration uses the requested heading/copy, Google placeholder, email divider, display name, email, password with visibility control, Buat akun, Masuk link and Lanjut tanpa akun. Login uses its requested copy, email/password, password recovery link and Daftar navigation. Name/email/password labels and autocomplete are explicit. Errors are associated with inputs and summarized with alert/focus behavior. Profile information is not collected at registration. Only the existing privacy document is linked.

The Google placeholder is text-only and disabled. It is not presented as a functioning official SDK button and has no fabricated Google logo. A future configured provider must supply the official Google component/flow before enabling production Google authentication.

## Service and session boundary

`auth-service.ts` defines the provider interface, capability flags, results, validation, mapped errors and safe return intent. The shipped adapter reports all capabilities unavailable and rejects every authentication operation. It has no token or credential persistence.

The form supports loading and repeat-submit protection only during an actual configured service request; it does not simulate a timer or success. It never invokes an authenticated continuation for an unverified email, displays pending-verification guidance, and clears the in-memory password after requests. Unknown SDK errors do not appear raw. Provider policy must supply password rules, account-linking behavior, duplicate-email handling and verified session results; no frontend-only hashing substitutes for these.

Real session restoration/expiry, provider logout, OAuth callback handling, trusted token validation, Google new/existing-account behavior, account linking and a production profile/bookmark persistence bridge remain unimplemented until a backend/provider is configured. The app cannot claim that these production flows are working. A provider integration must validate tokens/server sessions, use its supported state/nonce/PKCE flow, use official SDK components, and keep secrets and tokens out of localStorage.

## Existing data and explicit demo mode

The original example identity UI is retained as `DemoAccountPage` at `/demo/masuk` and `/demo/daftar`, labeled Mode demo. It is no longer the mechanism behind the primary login/register pages. Existing stored records, plans, checklists, profiles and identity switching remain available to this isolated development mode. The account dropdown identifies loaded local sessions as demo identities. Production authentication is not inferred from these records, and visiting `/masuk` with a cached demo record does not fabricate a verified sign-in or auto-redirect.

No production auth account is linked to a local record by matching email. Real account migration/linking must be an explicit trusted backend flow.

## Context and redirects

The existing bookmark intent keeps program/service ID, variant and destination in the URL. Auth-switch/recovery links preserve that context. `authIntent` validates internal return paths; auth and demo entry routes cannot become redirect loops. Query parameters and hashes are retained. Guest continuation returns to the relevant public destination, or `/program` if the requested destination requires an account. Guest continuation never silently creates a bookmark.

The legacy demo continuation remains covered separately for idempotent bookmark saving and optional profile completion. A future production session bridge must consume the validated intent after real authentication; the present UI does not claim this integration is complete.

## Verification

- TypeScript passes.
- 89 automated tests pass, including existing application regressions and new auth UI/service-boundary tests.
- Production build is checked separately after implementation.
- DOM/component tests verify focused layouts, labels, disabled controls, protected real-auth boundary, preserved local data, safe return destinations and in-memory service-fixture validation/loading/unverified-result behavior.
- Service fixtures are test-only and are not evidence of a real Google/email integration. They never enter the production catalog or session store.
- **Integration verified: none.** Real email registration/login, Google new/existing-account login, account linking, sending reset/verification email, server session expiry and provider logout remain pending backend configuration.
- **Visual responsive verification: pending.** Browser preview reports `The browser access host is unavailable`; no rendered desktop/mobile screenshots were obtained. Scoped CSS provides responsive layout but visual approval is not claimed.

There is no lint script configured in this repository. Tests, TypeScript and formatting are the available code checks.
