# 👁️ ARGUS-FATE // CYBER OPERATIONS SUITE

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**ARGUS-FATE** is a high-end, tactical Command & Control (C2) dashboard designed for Open Source Intelligence (OSINT) and cybersecurity auditing. It features a fully operational web-based CLI, real-time threat intelligence queries, and an immersive sci-fi UI with synthetic Web Audio SFX.

## 🚀 Features

* **📡 Active OSINT Engine:** Real-time GeoIP telemetry, ASN resolution, and DNS enumeration.
* **🛡️ Security Auditing:** Automated HTTP security header inspection (HSTS, CSP, X-Frame-Options) with grading algorithm (A+ to F).
* **🦠 Threat Intel Integration:** Live querying of global vulnerability databases (NVD/CIRCL) for CVEs.
* **🔊 Synthesized Sci-Fi Audio:** Pure JavaScript Web Audio API generating mechanical typing bips, radar pings, and breach alarms. No external audio files.
* **🎨 Tactical Themes & CRT FX:** 4 military-grade color palettes (Matrix Classic, Cyberpunk Amber, Deep Ops Cyan, Red Alert) with a toggleable CRT scanline filter.
* **🤖 PANDORA AI Core:** Tactical AI assistant for defensive recommendations and exploit mitigation directly in the terminal.
* **📄 Forensic Export:** Instantly generate and download markdown-based confidential forensic dossiers of audited targets.

## 💻 Tactical CLI Commands

| Command | Description |
|---|---|
| `recon <domain\|ip>` | Deep OSINT sweep (DNS, GeoIP, Security Headers & Score) |
| `cve <query\|id>` | Search global CVE / NVD threat database |
| `dns <domain>` | Enumerate DNS records & analyze SPF/DMARC policies |
| `headers <url>` | Audit HTTP security headers & posture |
| `hash <algo> <text>` | Calculate hash (sha256, sha512, md5) via Web Crypto API |
| `ai <query>` | Consult PANDORA Tactical AI for defense intel |
| `export [target]` | Download forensic intelligence dossier (.md report) |

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/fabiopy-creator/argus-fate.git

# Navigate to the project directory
cd argus-fate

# Install dependencies
npm install

# Start the tactical server
npm run dev
```

Navigate to `http://localhost:3000` to access the C2 terminal.

## 📸 Interface Preview
*The interface features fully interactive UI modules, an integrated CLI, and dynamic maps plotting trace vectors.*

---
*Created by [fabiopy-creator](https://github.com/fabiopy-creator) — For educational and defensive auditing purposes only.*
