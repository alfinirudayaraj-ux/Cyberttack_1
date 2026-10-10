# AvastLuxe Premium — Luxury Mobile Security (all 16 engines)

Clean-room implementation of the Avast Premium feature list, tuned for mobile + speed.
Obsidian + gold 3D UI, 120fps animations, offline-first verdicts.

## Run now (no Java/Flutter needed)
```powershell
cd avast-premium-luxury
# bypass npm.ps1 block once:
npm.cmd install
npm.cmd run android   # or: npx.cmd expo start, then scan QR with Expo Go
```

## Screens
- Dashboard: 3D orb, Smart Scan, background consent, all 16 engines matrix
- LinkGuard: paste/WhatsApp-shared URL → PAUSE → verdict popup → sandbox/block
- Network: Firewall, Remote Access Shield, Network Inspector, Behavior Shield, CyberCapture
- Privacy: Real Site DoH, Web Shield, Email Guard, Webcam Shield, Browser Shield
- Vault: Ransomware Shield, Sandbox, Data Shredder, Software Updater

## Your main command (WhatsApp scam link)
1. Enable Background Shield + LinkGuard on dashboard (explicit permission).
2. Share any WhatsApp message link to AvastLuxe (or tap if set as default browser).
3. App PAUSES navigation, runs `offlineHeuristic` + optional Safe Browsing cloud,
   then shows ✅ safe / ⚠️ suspicious / ⛔ scam popup with disclaimer of what would
   happen (OTP theft, wallet drain, trojan). Malicious = server never contacted,
   tab closed automatically.

## Add cloud keys (optional, upgrades accuracy)
Create `.env`: `SAFE_BROWSING_KEY=...` and pass to `cloudVerdict()`. Works fully offline without them.

## Production APK
See `native-stub/README.md` — needs `expo prebuild` + VpnService + AccessibilityService + EAS build.
