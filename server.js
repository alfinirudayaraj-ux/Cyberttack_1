/* ShieldLux permanent local server — zero dependencies, no install.
 * Run:  node server.js        (or double-click start-shield.bat)
 * Then open:  http://localhost:8787/web/index.html
 * Keeps running until you close the window; starts automatically via the .bat.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8787;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const proxyCache = new Map();

http
  .createServer((req, res) => {
    try {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/web/index.html";

      // Local proxy: lets the browser engine reach blocklist/feeds that send no
      // CORS headers (keeps the full real-world check available in-page).
      // GET responses (e.g. the OpenPhish feed) are cached for 10 minutes.
      if (p === "/proxy") {
        const target = new URL(req.url, "http://localhost").searchParams.get("url") || "";
        let tu;
        try { tu = new URL(target); } catch (e) { res.writeHead(400); return res.end("bad url"); }
        const allowed = tu.protocol === "https:" && (tu.hostname.endsWith("abuse.ch") || tu.hostname.endsWith("openphish.com"));
        if (!allowed) { res.writeHead(403); return res.end("host not allowed"); }
        const isGet = req.method === "GET" || req.method === "HEAD";
        const ck = req.method + " " + tu.href;
        if (isGet) {
          const hit = proxyCache.get(ck);
          if (hit && Date.now() - hit.t < 600000) {
            res.writeHead(hit.status, { "content-type": hit.ctype, "access-control-allow-origin": "*", "cache-control": "max-age=600" });
            return res.end(hit.body);
          }
        }
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => {
          const fwd = {
            method: req.method,
            signal: AbortSignal.timeout(5000),
            headers: { "content-type": req.headers["content-type"] || "application/x-www-form-urlencoded", accept: "application/json, text/plain, */*" },
          };
          if (!isGet) fwd.body = Buffer.concat(chunks);
          fetch(tu, fwd)
          .then(async r => {
            const body = Buffer.from(await r.arrayBuffer());
            const ctype = r.headers.get("content-type") || "application/json";
            if (isGet && r.ok) proxyCache.set(ck, { t: Date.now(), status: r.status, ctype, body });
            res.writeHead(r.status, {
              "content-type": ctype,
              "access-control-allow-origin": "*",
              "cache-control": isGet ? "max-age=600" : "no-store",
            });
            res.end(body);
          })
          .catch(e => { res.writeHead(502); res.end("proxy error: " + e.message); });
        });
        return;
      }

      const file = path.normalize(path.join(ROOT, p));
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404, { "content-type": "text/plain" });
        return res.end("Not found: " + p);
      }
      res.writeHead(200, {
        "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
        "cache-control": "no-store",
      });
      fs.createReadStream(file).pipe(res);
    } catch (e) {
      res.writeHead(500); res.end("Error: " + e.message);
    }
  })
  .listen(PORT, () => {
    console.log("");
    console.log("  ShieldLux is LIVE — permanent link (bookmark it):");
    console.log("  ->  http://localhost:" + PORT + "/web/index.html");
    console.log("");
    console.log("  Extension folder: http://localhost:" + PORT + "/extension/verdict.html");
    console.log("  Keep this window open; close it to stop the shield.");
  });
