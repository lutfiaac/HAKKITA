import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const encode = new TextEncoder();
const SESSION_SECONDS = 3600;
const FLOW_SECONDS = 600;
const AUTH_PATH = "/api/admin/auth/";

function configuration(env) {
  try {
    const origin = new URL(env.ADMIN_PUBLIC_ORIGIN);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (origin.origin !== env.ADMIN_PUBLIC_ORIGIN || origin.username || origin.password || (origin.protocol !== "https:" && !(env.ADMIN_ALLOW_LOCAL_HTTP === "true" && local && origin.protocol === "http:"))) return null;
    const emails = String(env.ADMIN_EMAIL_ALLOWLIST || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (!emails.length || emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null;
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || encode.encode(env.ADMIN_SESSION_SECRET || "").length < 32) return null;
    return { origin: origin.origin, secure: origin.protocol === "https:", emails, clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, key: encode.encode(env.ADMIN_SESSION_SECRET), callback: origin.origin + AUTH_PATH + "callback" };
  } catch { return null; }
}
function headers() { return new Headers({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" }); }
function json(body, status = 200) { const h = headers(); h.set("Content-Type", "application/json; charset=utf-8"); return new Response(JSON.stringify(body), { status, headers: h }); }
function cookieName(config, flow = false) { return `${config.secure ? "__Host-" : ""}hakkita_admin${flow ? "_oauth" : "_session"}`; }
function cookie(config, value, seconds, flow = false) {
  return `${cookieName(config, flow)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${config.secure ? "; Secure" : ""}`;
}
function readCookie(request, name) {
  const entries = (request.headers.get("cookie") || "").split(";").map((value) => value.trim());
  const matches = entries.filter((value) => value.startsWith(name + "="));
  return matches.length === 1 ? matches[0].slice(name.length + 1) : "";
}
async function sign(payload, config, audience, seconds) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuer(config.origin).setAudience(audience).setIssuedAt().setExpirationTime(`${seconds}s`).sign(config.key);
}
async function verifyCookie(request, config, audience, flow = false) {
  const token = readCookie(request, cookieName(config, flow));
  if (!token || token.length > 4096) return null;
  try { return (await jwtVerify(token, config.key, { algorithms: ["HS256"], issuer: config.origin, audience, requiredClaims: ["iat", "exp"], maxTokenAge: flow ? "10m" : "1h" })).payload; } catch { return null; }
}
async function sessionUser(request, config) {
  const payload = await verifyCookie(request, config, "hakkita-admin-session");
  if (!payload || payload.role !== "admin" || typeof payload.sub !== "string" || typeof payload.email !== "string" || !config.emails.includes(payload.email.toLowerCase())) return null;
  return { id: payload.sub, email: payload.email, name: typeof payload.name === "string" ? payload.name : "Admin", role: "admin", expiresAt: payload.exp * 1000 };
}
function sameOriginPost(request, config) {
  return request.method === "POST" && request.headers.get("origin") === config.origin && request.headers.get("x-hakkita-auth") === "1" && request.headers.get("content-type")?.startsWith("application/json");
}
function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function loginRedirect(config, code) {
  const h = headers(); h.set("Location", `${config.origin}/masuk?tab=admin${code ? `&authError=${code}` : ""}`); h.append("Set-Cookie", cookie(config, "", 0, true));
  return new Response(null, { status: 303, headers: h });
}
async function callback(request, config) {
  const url = new URL(request.url);
  const flow = await verifyCookie(request, config, "hakkita-admin-oauth", true);
  if (!flow || !flow.state || url.searchParams.get("state") !== flow.state) return loginRedirect(config, "invalid_state");
  if (url.searchParams.has("error")) return loginRedirect(config, url.searchParams.get("error") === "access_denied" ? "cancelled" : "oauth_failed");
  const code = url.searchParams.get("code");
  if (!code || code.length > 4096 || typeof flow.verifier !== "string" || typeof flow.nonce !== "string") return loginRedirect(config, "oauth_failed");
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.callback, code_verifier: flow.verifier }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return loginRedirect(config, "oauth_failed");
    const tokens = await response.json();
    if (typeof tokens.id_token !== "string") return loginRedirect(config, "oauth_failed");
    const { payload } = await jwtVerify(tokens.id_token, googleKeys, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience: config.clientId, algorithms: ["RS256"], clockTolerance: 5, requiredClaims: ["sub", "iat", "exp", "email", "email_verified", "nonce"] });
    if (payload.nonce !== flow.nonce || payload.email_verified !== true || typeof payload.email !== "string" || typeof payload.sub !== "string" || !payload.sub || (payload.azp && payload.azp !== config.clientId) || (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== config.clientId)) return loginRedirect(config, "oauth_failed");
    const email = payload.email.toLowerCase();
    if (!config.emails.includes(email)) return loginRedirect(config, "access_denied");
    const session = await sign({ sub: payload.sub, email, name: typeof payload.name === "string" ? payload.name.slice(0, 100) : "Admin", role: "admin" }, config, "hakkita-admin-session", SESSION_SECONDS);
    const h = headers(); h.set("Location", config.origin + "/admin"); h.append("Set-Cookie", cookie(config, session, SESSION_SECONDS)); h.append("Set-Cookie", cookie(config, "", 0, true));
    return new Response(null, { status: 303, headers: h });
  } catch { return loginRedirect(config, "oauth_failed"); }
}

export async function handleAdminAuth(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(AUTH_PATH)) return null;
  const config = configuration(env);
  if (config && url.origin !== config.origin) return json({ error: "origin_mismatch", message: "Gunakan alamat HAKKITA yang dikonfigurasi untuk login admin." }, 403);
  if (url.pathname === AUTH_PATH + "status" && request.method === "GET") return json({ configured: Boolean(config), methods: { google: Boolean(config), password: false }, session: config ? await sessionUser(request, config) : null });
  if (!config) return json({ error: "not_configured", message: "Login Google admin belum dikonfigurasi di server. Hubungi pengelola HAKKITA untuk mengaktifkannya." }, 503);
  if (url.pathname === AUTH_PATH + "callback" && request.method === "GET") return callback(request, config);
  if (![AUTH_PATH + "start", AUTH_PATH + "logout"].includes(url.pathname)) return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!sameOriginPost(request, config)) return json({ error: "forbidden", message: "Permintaan login tidak valid. Muat ulang halaman dan coba lagi." }, 403);
  if (url.pathname.endsWith("/logout")) {
    const response = json({ ok: true }); response.headers.append("Set-Cookie", cookie(config, "", 0)); response.headers.append("Set-Cookie", cookie(config, "", 0, true)); return response;
  }
  const state = randomToken(), nonce = randomToken(), verifier = randomToken();
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encode.encode(verifier)));
  const challenge = btoa(String.fromCharCode(...digest)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.callback, response_type: "code", scope: "openid email profile", state, nonce, code_challenge: challenge, code_challenge_method: "S256", prompt: "select_account" }).toString();
  const response = json({ url: authorization.href });
  response.headers.append("Set-Cookie", cookie(config, await sign({ state, nonce, verifier }, config, "hakkita-admin-oauth", FLOW_SECONDS), FLOW_SECONDS, true));
  return response;
}

export async function guardAdminPage(request, env) {
  const url = new URL(request.url);
  if (!(url.pathname === "/admin" || url.pathname.startsWith("/admin/")) || !["GET", "HEAD"].includes(request.method)) return null;
  const config = configuration(env);
  if (!config) {
    const h = headers(); h.set("Location", "/masuk?tab=admin&authError=not_configured");
    return new Response(null, { status: 303, headers: h });
  }
  if (url.origin !== config.origin) return json({ error: "origin_mismatch" }, 403);
  if (!await sessionUser(request, config)) return loginRedirect(config, "");
  return null;
}
