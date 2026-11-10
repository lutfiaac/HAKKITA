import { handleAdminAuth, guardAdminPage } from "../worker/admin-auth.js";

export function adminAuthDevPlugin(env) {
  return {
    name: "hakkita-admin-auth",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || "").split("?")[0];
        if (!path.startsWith("/api/admin/auth/") && path !== "/admin" && !path.startsWith("/admin/")) return next();
        try {
          const host = req.headers.host || "localhost";
          const chunks = []; let length = 0;
          for await (const chunk of req) {
            length += chunk.length;
            if (length > 2048) { res.statusCode = 413; res.end(); return; }
            chunks.push(chunk);
          }
          const request = new Request(`http://${host}${req.url}`, { method: req.method, headers: req.headers, ...(["GET", "HEAD"].includes(req.method) ? {} : { body: Buffer.concat(chunks) }) });
          const runtime = { ...env, ADMIN_ALLOW_LOCAL_HTTP: "true" };
          const response = await handleAdminAuth(request, runtime) || await guardAdminPage(request, runtime);
          if (!response) return next();
          res.statusCode = response.status;
          response.headers.forEach((value, name) => { if (name !== "set-cookie") res.setHeader(name, value); });
          const cookies = response.headers.getSetCookie();
          if (cookies.length) res.setHeader("Set-Cookie", cookies);
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch {
          res.statusCode = 500; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({ message: "Layanan autentikasi admin belum dapat memproses permintaan. Coba lagi." }));
        }
      });
    },
  };
}
