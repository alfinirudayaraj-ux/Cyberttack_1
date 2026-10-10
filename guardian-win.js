/* ShieldLux Guardian for Windows — background of every app on this PC.
 *
 * Watches the REAL system clipboard (cross-application), tests every copied
 * link / URL / message with the same engine as the app (sub-10s), and pops a
 * REAL Windows toast ABOVE all other windows when something is fake/phishing.
 *
 * Implementation note: PowerShell takes ~20s to start in this environment, so
 * ONE persistent PowerShell bridge (gx-bridge.ps1) does clipboard polling and
 * toast display; Node does the judging and talks to it over stdin/stdout.
 *
 * Run:   node guardian-win.js                 (or double-click start-guardian.bat)
 * Test:  node guardian-win.js --cycles 2      (exit after N clipboard checks)
 *        node guardian-win.js --toast-safe    (toast on genuine results too)
 * Log:   guardian.log
 *
 * Add-on only — the existing app is untouched.
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const LOG = path.join(__dirname, "guardian.log");
const args = process.argv.slice(2);
const CYCLES = (() => { const i = args.indexOf("--cycles"); return i >= 0 ? parseInt(args[i + 1], 10) || 0 : 0; })();
const TOAST_SAFE = args.includes("--toast-safe");

/* ---------- engine (identical code to the app) ---------- */
const { analyzeText } = require("./extension/scanner.js");
function loadDeep() {
  const src = fs.readFileSync(path.join(__dirname, "extension", "intel.js"), "utf8");
  return new Function("LUX_TIMEOUT_SCALE", "analyzeText", src + "\n;return { deepVerify };")(0.35, analyzeText);
}
const { deepVerify } = loadDeep();

/* ---------- log + toast plumbing ---------- */
function log(line) {
  const entry = "[" + new Date().toISOString().replace("T", " ").slice(0, 19) + "] " + line;
  try { fs.appendFileSync(LOG, entry + "\n"); } catch (e) {}
  console.log(entry);
}
const b64 = s => Buffer.from(String(s), "utf8").toString("base64");

let bridge = null, checks = 0, ready = false, toastSeen = 0;
function send(cmd) { if (bridge && bridge.stdin.writable) { try { bridge.stdin.write(cmd + "\n"); } catch (e) {} } }
function toast(title, body) { send("TOAST " + b64(title) + "|" + b64(body)); }

/* ---------- verdict ---------- */
async function judge(text, source) {
  const clean = text.slice(0, 4000);
  checks++;
  try {
    if (/^(https?:\/\/|www\.)/i.test(clean) || /^[\w-]+(\.[\w-]+)+([\/?#].*)?$/i.test(clean.trim())) {
      let url = clean.split(/\s/)[0];
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      const t0 = Date.now();
      const d = await deepVerify(url, {});
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      const v = d.report.verdict;
      log("CHECK " + url + " => " + v.toUpperCase() + " (" + secs + "s) via " + source);
      d.sources.forEach(s => log("    " + s.name + ": " + s.detail));
      if (v !== "safe") {
        toast(v === "scam" ? "SCAM LINK - DO NOT OPEN" : "SUSPICIOUS LINK - DO NOT TRUST",
              (d.report.hits[0] || "").slice(0, 220));
        log("    TOAST SENT: " + (d.report.hits[0] || "").slice(0, 160));
      } else if (TOAST_SAFE) {
        toast("GENUINE LINK", "Passed every real check (" + secs + "s): " + url.slice(0, 120));
        log("    TOAST SENT (safe)");
      }
    } else {
      const r = analyzeText(clean);
      log("CHECK message (" + clean.length + " chars) => " + r.verdict.toUpperCase() + " via " + source);
      if (r.verdict !== "safe") {
        toast(r.verdict === "scam" ? "PHISHING MESSAGE DETECTED" : "SUSPICIOUS MESSAGE",
              (r.hits[0] || "").slice(0, 220));
        log("    TOAST SENT: " + (r.hits[0] || "").slice(0, 160));
      } else if (TOAST_SAFE) {
        toast("MESSAGE LOOKS GENUINE", (r.hits[0] || "No phishing signals found.").slice(0, 180));
      }
    }
  } catch (e) {
    log("    CHECK ERROR: " + (e && e.message ? e.message : e));
  } finally {
    if (CYCLES && checks >= CYCLES) {
      log("Test run complete (" + checks + " checks). Shutting down.");
      send("QUIT");
      setTimeout(() => { try { bridge.kill(); } catch (e) {} process.exit(0); }, 800);
    }
  }
}

/* ---------- start bridge ---------- */
(function main() {
  log("==================================================");
  log("ShieldLux Guardian for Windows STARTING (clipboard watch + toast popups above all apps).");
  log("Warming up clipboard reader (PowerShell first start can take ~20s)...");
  bridge = spawn("powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
     "-File", path.join(__dirname, "gx-bridge.ps1")],
    { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });

  let buf = "";
  bridge.stdout.on("data", d => {
    buf += d; let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line) continue;
      if (line === "READY" && !ready) {
        ready = true;
        log("Clipboard reader READY — watching in the background of every app.");
        toast("ShieldLux Guardian Active", "Watching your clipboard in the background - fake links and phishing messages will be reported above every app.");
      } else if (line.startsWith("CLIP ")) {
        let text = "";
        try { text = Buffer.from(line.slice(5), "base64").toString("utf8"); } catch (e) {}
        const brief = text.length > 90 ? text.slice(0, 90) + "..." : text;
        log("CLIPBOARD CHANGED: " + brief.replace(/[\r\n]+/g, " "));
        judge(text, "system clipboard");
      } else if (line === "TOAST_OK") {
        toastSeen++;
      } else if (line.startsWith("TOAST_ERR")) {
        log("    " + line);
      }
    }
  });
  bridge.stderr.on("data", d => { const s = String(d).trim(); if (s) log("bridge: " + s.slice(0, 160)); });
  bridge.on("exit", c => { log("Clipboard reader exited (code " + c + ")."); if (!CYCLES) process.exit(0); });
  setTimeout(() => { if (!ready) log("Still warming up the clipboard reader..."); }, 15000);
})();
