# Auction Service for Streamers (Frontend) – [pointauc.com](https://pointauc.com)

## 📖 User Guide (Comprehensive Feature Reference)

The documentation below is aimed at streamers and viewers — it explains every feature of Pointauc in detail:

https://pointauc.com/docs/

## 🛠️ Tech Stack (at a glance)

- **React 19 + Vite + TypeScript**
- **Redux Toolkit** – global state management
- **Mantine** – component library
- **Socket.IO & Centrifuge** – real-time communication with the backend and external services
- **i18next** – internationalisation
- **Tailwind / CSS-Modules** – styling

## 🚀 Getting Started

### Prerequisites

- **Node.js >= 22**
- **pnpm**

### Installation & Development Server

```bash
# install dependencies
pnpm install

# start the dev server (Vite)
pnpm dev
```

## 🐳 Deployment with Docker

The repository ships with a production-ready Docker setup: a multi-stage build compiles the static SPA and serves it with nginx. The **same image runs locally on your PC and on a remote host**.

### Prerequisites

- **Docker** with the **Docker Compose** plugin (Docker Desktop on Windows/macOS already bundles it).

### Quick start (local PC)

```bash
# 1. Create your env file from the template
cp .env.example .env          # PowerShell: Copy-Item .env.example .env

# 2. Build the image and start the container in the background
docker compose up --build -d
```

The app is now available at **http://localhost:1488**.

If you have Node/pnpm, the same commands are wrapped as scripts:

```bash
pnpm docker:compose:up        # build + start
pnpm docker:compose:logs      # follow logs
pnpm docker:compose:down      # stop and remove
```

One-command helper that also creates `.env` and checks your Docker install:

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/deploy-docker.ps1
```

```bash
# Linux / macOS
sh scripts/deploy-docker.sh
```

### Configuration (`.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `FRONTEND_PORT` | Host port the app is published on. | `1488` |
| `BACKEND_UPSTREAM` | Backend / Socket.IO URL nginx reverse-proxies to (e.g. `http://backend:8000`). Leave empty to run the frontend only (static SPA mode). | empty |
| `VITE_*` | Build-time variables baked into the bundle (OAuth client ids, analytics…). All optional. | empty |

The auction, wheel, **rage mode** and **lot-owner ("who added the lot")** features are fully client-side: they work in static SPA mode without a backend and persist to the browser's `localStorage` / `IndexedDB`.

### Deploying on a host

```bash
git clone https://github.com/Pointauc/pointauc_frontend.git
cd pointauc_frontend
cp .env.example .env
# edit .env: set FRONTEND_PORT and (optionally) BACKEND_UPSTREAM / VITE_* values
docker compose up --build -d
```

The container has a built-in healthcheck (`GET /`) and restarts unless explicitly stopped. Put a TLS-terminating reverse proxy (Caddy / Traefik / nginx) in front for HTTPS, or publish `FRONTEND_PORT` behind your existing edge proxy.

## 🔐 Authenticity Verification

The code running on [pointauc.com](https://pointauc.com) can be verified against this repository. Each deployment generates SHA-256 hashes of all HTML, JS, and CSS files, published as an immutable [GitHub release](https://github.com/Pointauc/pointauc_frontend/releases) with the tag format `deploy-<commit-sha>`.

### Verify Deployed Files

```bash
# Clone the repository
git clone https://github.com/Pointauc/pointauc_frontend.git
cd pointauc_frontend

# Install dependencies
pnpm install

# Verify the deployed files
pnpm verify:authenticity
```

This script downloads the hash manifest from the latest release, fetches each file from the live site, compares hashes, and shows which files match or differ

### Why This Matters

- **Transparency**: Anyone can independently verify that the deployed website matches the source code
- **Security**: Even if our server is compromised, you can detect unauthorized modifications

### Important Note

Pointeauc uses claudflare which may inject a script into the HTML files. The Cloudflare script provides DDoS protection and bot mitigation and doesn't affect the website functionality.

If you want to verify the integrity of HTML files manually, you need to strip the claudflare script tag. This process is done AUTOMATICALLY by the verification script.

## 📝 Contribution guidelines

Contributions are welcome through issues and pull requests. By contributing to this
repository, you agree that your contribution may be distributed as part of this
project under the repository license.

## 📄 License

This repository is **source-available**, not open source.

The code in this repository is licensed under **PolyForm Noncommercial 1.0.0**.
You may use, modify, and share it for noncommercial purposes under the terms in
[LICENSE](./LICENSE). Commercial use requires separate permission from the
project owner.

Please preserve the attribution notice in [NOTICE](./NOTICE) when redistributing
the project or derivative works.

## 💡 Suggestions & Bug Reports

Found a bug or have an idea? Please [open an issue](https://github.com/Pointauc/pointauc_frontend/issues).
