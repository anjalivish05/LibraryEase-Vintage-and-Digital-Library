# LibraryEase — Production Deployment Guide
**Vintage Library & Digital Services**

This guide provides end-to-end instructions for deploying **LibraryEase** to production using **Render** for the FastAPI backend and **Vercel** for the React + Vite frontend. It is written specifically for this codebase based on its actual architecture, dependency definitions, and environment configurations.

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [GitHub Preparation & Secrets Protection](#3-github-preparation--secrets-protection)
4. [Backend Deployment on Render](#4-backend-deployment-on-render)
5. [SQLite Database Persistence on Render](#5-sqlite-database-persistence-on-render)
6. [Frontend Deployment on Vercel](#6-frontend-deployment-on-vercel)
7. [Frontend & Backend Integration](#7-frontend--backend-integration)
8. [Post-Deployment Testing Checklist](#8-post-deployment-testing-checklist)
9. [Production Security Checklist](#9-production-security-checklist)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Updating the Live Website](#11-updating-the-live-website)
12. [Final Deployment Architecture Diagram](#12-final-deployment-architecture-diagram)

---

## 1. Project Overview & Architecture

LibraryEase is a modern full-stack civic library portal designed with a *Vintage Library & Modern AI* aesthetic. It connects Mumbai readers with physical book discovery, reading room locations across Maharashtra, catalog borrowing workflows, automated loan return reminders, staff circulation consoles, and conversational AI recommendations.

### Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Single Page Application (SPA), Lucide React icons, responsive CSS design system |
| **Backend** | Python 3.10+ / FastAPI 0.110+ | Asynchronous REST API, Uvicorn ASGI server, APScheduler background jobs |
| **Database** | SQLite (with MySQL connector) | SQLAlchemy 2.0 ORM, foreign key constraints, automated seeding on startup |
| **AI Engine** | Google Gemini API | `v1beta` endpoint (`gemini-1.5-flash`), with deterministic rule-based local NLP fallback |
| **Authentication**| JWT (JSON Web Tokens) | `python-jose` HS256 algorithm, `passlib` bcrypt password hashing, role-based RBAC |

### Hosting Platforms

- **Frontend:** **Vercel** (Global Edge CDN, automatic HTTPS, continuous deployment from Git).
- **Backend:** **Render** (Cloud containerized Web Service, automated build & deployment, customizable health checks).
- **External AI:** **Google Gemini API** (`generativelanguage.googleapis.com`).

---

## 2. Prerequisites

Before starting the deployment, ensure you have:

1. **A GitHub Account:** [github.com](https://github.com) to host your project repository.
2. **A Render Account:** [render.com](https://render.com) for backend hosting.
3. **A Vercel Account:** [vercel.com](https://vercel.com) for frontend hosting.
4. **A Google Gemini API Key:** Generated at [Google AI Studio](https://aistudio.google.com/). *(Optional: if omitted, LibraryEase automatically operates in its resilient Demo Mode without throwing errors).*
5. **Local Tools Installed:**
   - Git (`git --version`)
   - Node.js 18+ or 20+ and npm (`node -v`, `npm -v`)
   - Python 3.10+ and pip (`python --version`)
6. **Passing Local Tests:**
   ```bash
   # In frontend/
   npm run build

   # In backend/
   python -m unittest test_backend.py
   ```

---

## 3. GitHub Preparation & Secrets Protection

### Repository Structure

Your GitHub repository must maintain this clean two-tier layout:

```text
libraryease/
├── backend/
│   ├── .env.example          # Safe template (NO real secrets)
│   ├── ai_service.py         # Gemini API & NLP matching
│   ├── config.py             # Settings & environment variables
│   ├── database.py           # SQLAlchemy engine & session factory
│   ├── main.py               # FastAPI application & REST endpoints
│   ├── models.py             # Database ORM models
│   ├── requirements.txt      # Python dependencies
│   ├── schemas.py            # Pydantic validation schemas
│   ├── scheduler.py          # APScheduler loan audit jobs
│   ├── security.py           # Password hashing & JWT helpers
│   ├── seed_data.py          # Seed catalog & Mumbai libraries
│   └── test_backend.py       # Automated test suite
├── frontend/
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node dependencies & build scripts
│   ├── vite.config.js        # Vite build & local proxy configuration
│   └── src/                  # React source components & styles
├── .gitignore                # Root Git ignore rules
├── DEPLOYMENT.md             # This deployment guide
└── README.md                 # Project introduction
```

### Required `.gitignore` Configuration

Ensure your root `.gitignore` contains the following rules to prevent accidental exposure of credentials and database files:

```gitignore
# Environment & Secret files (CRITICAL: Never commit these)
.env
*.env
.env.*
!.env.example
backend/.env
backend/*.env
backend/.env.*
!backend/.env.example

# Node dependencies and build outputs
node_modules/
frontend/node_modules/
dist/
frontend/dist/
dist-ssr/
*.local

# Python runtime artifacts
__pycache__/
backend/__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
backend/venv/
backend/.venv/

# Database files (CRITICAL: Do not commit active databases)
*.db
*.sqlite3
backend/*.db

# Editor & OS files
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
Thumbs.db
```

### Pre-Push Verification Check

Run the following command in your terminal before pushing to GitHub to confirm that zero sensitive files are staged:

```powershell
# Windows PowerShell
git status
git ls-files | Select-String "\.env$|\.db$"
```

```bash
# macOS / Linux
git status
git ls-files | grep -E "(\.env|\.db)$"
```

> [!CAUTION]
> If `backend/.env` or `backend/libraryease.db` appears in `git status` or `git ls-files`, unstage them immediately using:
> ```bash
> git rm --cached backend/.env
> git rm --cached backend/libraryease.db
> git commit -m "chore: remove secrets and local db from git tracking"
> ```

### Pushing to GitHub

```bash
git add .
git commit -m "feat: prepare production configuration and deployment docs"
git branch -M main
git remote add origin https://github.com/<your-username>/libraryease.git
git push -u origin main
```

---

## 4. Backend Deployment on Render

Render will host the FastAPI REST API inside an isolated Python container with automatic SSL certificate issuance.

### Step-by-Step Render Setup

1. **Log in to Render:** Go to [dashboard.render.com](https://dashboard.render.com).
2. **Create New Web Service:**
   - Click **New +** in the top right.
   - Select **Web Service**.
   - Connect your GitHub repository (`libraryease`).
3. **Configure Service Settings:**

| Field | Value | Notes |
|---|---|---|
| **Name** | `libraryease-backend` | Will produce `https://libraryease-backend.onrender.com` |
| **Region** | `Singapore` or `Frankfurt` | Select the region closest to your primary users |
| **Branch** | `main` | Production deployment branch |
| **Root Directory** | `backend` | **Must be set to `backend`** so Render finds `requirements.txt` |
| **Runtime** | `Python 3` | Supported Python 3.10 / 3.11 / 3.12 |
| **Build Command** | `pip install -r requirements.txt` | Installs FastAPI, SQLAlchemy, Uvicorn, etc. |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` | **Must use `$PORT`** — Render assigns this dynamically |
| **Instance Type** | `Free` (or `Starter` with Disk) | See Section 5 for database persistence details |

4. **Configure Health Check Path:**
   - Expand the **Advanced** settings accordion.
   - In **Health Check Path**, enter: `/api/health`
   - Render uses this path to determine when your service is ready to receive traffic.

---

### Backend Environment Variables on Render

In the **Environment Variables** section on Render, add the following key-value pairs:

| Variable Name | Required | Example / Recommended Value | Description |
|---|---|---|---|
| `JWT_SECRET` | **YES** | *(Generated 64-hex string)* | Encryption key for signing user authentication tokens. |
| `JWT_ALGORITHM` | No | `HS256` | Token signing algorithm (defaults to `HS256`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` | Token lifespan in minutes (`10080` = 7 days). |
| `CORS_ORIGINS` | **YES** | `https://<your-vercel-domain>.vercel.app` | Comma-separated list of allowed frontend domains. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Your Google Gemini API key. Enables live AI catalog reasoning. |
| `SQLITE_URL` | Optional | `sqlite:////var/data/libraryease.db` | Path to persistent database (see Section 5). |
| `LIBRARY_NAME` | No | `LibraryEase Central Public Library` | Public institutional name for API responses. |
| `LIBRARY_TIMEZONE` | No | `Asia/Kolkata` | Standard operational timezone. |

#### Generating a Strong Production JWT Secret

Generate a cryptographically secure 256-bit hexadecimal key in your terminal:

```bash
# Using Python
python -c "import secrets; print(secrets.token_hex(32))"

# Or using OpenSSL
openssl rand -hex 32
```
*Copy the 64-character output into the `JWT_SECRET` environment variable in Render.*

---

### Step 5: Deploy and Verify Backend

1. Click **Create Web Service**.
2. Monitor the Render deployment logs. A successful deployment displays:
   ```text
   ==> Running build command 'pip install -r requirements.txt'...
   ==> Successfully installed fastapi-0.110.0 uvicorn-0.28.0 sqlalchemy-2.0.0 ...
   ==> Starting service with 'uvicorn main:app --host 0.0.0.0 --port $PORT'
   INFO:     Started server process [51]
   INFO:     Waiting for application startup.
   [Database] Using SQLite engine at libraryease.db (All tables and features operational).
   Seeding LibraryEase database with rich library catalog & demo accounts...
   Database seeding completed successfully!
   Seeding Mumbai libraries into SQL table...
   Successfully seeded 12 Mumbai library records into the libraries SQL table.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)
   ```
3. Test the live endpoints in your web browser:
   - **Health Check:** `https://<your-render-name>.onrender.com/api/health`
     *Should return: `{"status":"healthy","service":"LibraryEase Backend",...}`*
   - **Interactive API Docs:** `https://<your-render-name>.onrender.com/docs`
   - **Institutional Info:** `https://<your-render-name>.onrender.com/api/info`

---

## 5. SQLite Database Persistence on Render

### The Ephemeral Filesystem Reality

Render's Web Services run in ephemeral Docker containers:
- **On the Free Tier:** When a container spins down due to 15 minutes of inactivity, or when you deploy a new commit, the local filesystem is reset to the Git repository state. Any SQLite file written inside the container (e.g. `backend/libraryease.db`) will be erased.
- **LibraryEase's Resilient Safeguard:** LibraryEase's `lifespan` handler automatically invokes `seed_database()` on startup. If the database file is reset, the server will recreate all tables, restore the complete catalog, restore the 12 Mumbai library branches, and seed default user accounts. However, new accounts created by public visitors during that session will be lost upon container recycling.

---

### How to Achieve 100% Data Persistence

Depending on your project requirements and budget, choose one of these two persistent options:

#### Option A: Render Persistent Disk (Recommended for SQLite)

Render allows attaching a Persistent Disk to a Web Service (requires a paid instance, such as the *Starter* plan at \$7/month + \$0.25/GB disk):

1. In your Render Dashboard, open `libraryease-backend`.
2. Navigate to **Disks** in the left sidebar and click **Add Disk**.
3. Configure the disk:
   - **Name:** `libraryease-data`
   - **Mount Path:** `/var/data`
   - **Size:** `1 GB` (sufficient for hundreds of thousands of library catalog and patron records).
4. Navigate to **Environment** and add:
   ```env
   SQLITE_URL=sqlite:////var/data/libraryease.db
   ```
5. Click **Save Changes**. The service will redeploy with the persistent disk attached.
6. **Result:** The SQLite database file now lives on the dedicated `/var/data` storage block and will survive all container restarts, sleep cycles, and future code deployments.

---

#### Option B: Cloud Database (Free Alternative for Zero Data Loss)

If you wish to remain on free tiers without paying for a disk, connect a free managed cloud PostgreSQL or MySQL database (e.g., Supabase, Neon, or Aiven):

1. Create a free database on [Supabase](https://supabase.com) or [Aiven](https://aiven.io).
2. LibraryEase's `backend/config.py` automatically checks the `DATABASE_URL` environment variable:
   ```env
   DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname
   ```
3. When `DATABASE_URL` is set, `database.py` automatically connects to the external database instead of local SQLite.

---

### Database Backup & Restore Procedure (SQLite)

To back up your database from Render's persistent disk:

1. In the Render Dashboard, open your service and click **Shell**.
2. Run an SQLite online backup command to guarantee consistency:
   ```bash
   sqlite3 /var/data/libraryease.db ".backup '/var/data/backup_$(date +%Y%m%d).db'"
   ```
3. You can inspect tables and verify records directly using:
   ```bash
   sqlite3 /var/data/libraryease.db "SELECT count(*) FROM books;"
   sqlite3 /var/data/libraryease.db "SELECT email, full_name, member_card_no FROM users;"
   ```

---

## 6. Frontend Deployment on Vercel

Vercel will compile and distribute the React + Vite frontend across its global edge network.

### Step-by-Step Vercel Setup

1. **Log in to Vercel:** Go to [vercel.com](https://vercel.com).
2. **Import Repository:**
   - Click **Add New...** → **Project**.
   - Select your GitHub repository (`libraryease`).
3. **Configure Project Settings:**

| Field | Setting | Value / Details |
|---|---|---|
| **Framework Preset** | Vite | Vercel automatically detects Vite |
| **Root Directory** | Click **Edit** | Select `frontend` |
| **Build Command** | Override (optional) | `npm run build` |
| **Output Directory** | Default | `dist` |
| **Install Command** | Default | `npm install` |

4. **Environment Variables on Vercel:**
   - Expand the **Environment Variables** section.
   - Add the actual variable expected by [`frontend/src/services/api.js`](file:///C:/Users/Anjali%20Vishwakarma/.gemini/antigravity/scratch/libraryease/frontend/src/services/api.js#L7):

   ```env
   VITE_API_URL=https://<your-render-backend-name>.onrender.com/api
   ```
   > [!IMPORTANT]
   > Do **NOT** add a trailing slash. The value must end in `/api` (for example: `https://libraryease-backend.onrender.com/api`).

5. **SPA URL Rewrite Configuration (Optional):**
   LibraryEase uses hash-based page transitions (`#explore`, `#libraries`, `#my-library`, `#ai-assistant`), which work natively on all static file servers. However, to support clean browser refreshes on arbitrary paths, you may create a `frontend/vercel.json` file:

   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

6. **Deploy:** Click **Deploy**. Vercel will run `npm run build` and launch your site at `https://<your-project>.vercel.app`.

---

## 7. Frontend & Backend Integration

Once both platforms are deployed, connect them using this two-way handshake:

```text
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│         VERCEL FRONTEND         │                 │         RENDER BACKEND          │
│  https://libraryease.vercel.app │                 │ https://libraryease.onrender.com│
├─────────────────────────────────┤                 ├─────────────────────────────────┤
│ Configured via:                 │  HTTPS Requests │ Configured via:                 │
│ VITE_API_URL=                   │ ──────────────> │ CORS_ORIGINS=                   │
│ https://libraryease.onrender.com│ <────────────── │ https://libraryease.vercel.app  │
│ /api                            │  CORS Approved  │                                 │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

### Step 1: Update Backend CORS on Render

1. Go to your Render Dashboard → `libraryease-backend` → **Environment**.
2. Update the `CORS_ORIGINS` variable with your live Vercel domain:
   ```env
   CORS_ORIGINS=https://<your-app>.vercel.app
   ```
   *(If you also have a custom domain like `https://libraryease.org`, separate them with a comma: `https://<your-app>.vercel.app,https://libraryease.org`).*
3. Save changes. Render will restart the service to apply the CORS origin whitelist.

### Step 2: Test the Live Connection

1. Open your live Vercel website in Chrome or Firefox.
2. Press `F12` to open Developer Tools and select the **Network** tab.
3. Refresh the page:
   - Verify that requests to `https://<your-backend>.onrender.com/api/books` and `/api/info` return **HTTP 200 OK**.
   - Check the Response Headers to ensure `access-control-allow-origin` matches your Vercel URL.
   - Verify there are zero `CORS policy: No 'Access-Control-Allow-Origin' header` errors in the Console tab.

---

## 8. Post-Deployment Testing Checklist

Execute these 16 tests on your live production URL to verify all features before public release:

| # | Test Item | Action | Expected Result |
|---|---|---|---|
| 1 | **Home Page** | Visit root URL | Vintage editorial ribbon, hero search, and Mumbai highlights render cleanly. |
| 2 | **Catalog Loading** | Visit `#explore` | Verified books load from Render backend API. |
| 3 | **Catalog Search** | Search for "Python" | Instant client/server filtering displays "Python Crash Course". |
| 4 | **Mumbai Libraries** | Visit `#libraries` | 12 Mumbai libraries load from SQL database; interactive map pins render correctly. |
| 5 | **AI Search** | Search via AI modal | AI returns ranked book matches with match scores and curator rationale. |
| 6 | **AI Assistant** | Visit `#ai-assistant` | AI Literary Concierge responds to inquiries with zero React child errors. |
| 7 | **Patron Registration**| Open Auth Modal → Register | Complete form; card number (e.g. `PAT-XXXX`) is issued and saved to database. |
| 8 | **Password Visibility**| Click Eye Icon in password field | Password toggles between `password` dots and visible plain text. |
| 9 | **Header Status** | Inspect header after login | White/ivory badge displays member name with glowing green active status dot (`●`). |
| 10 | **Borrow Workflow** | Click "Borrow Book" on a book | Book moves to "My Library" dashboard; available copies decrement in database. |
| 11 | **Book Renewal** | Click "Renew" in My Library | Due date extends by 14 days; renewal count updates. |
| 12 | **Return Workflow** | Return book | Book returns to catalog; available copies increment in database. |
| 13 | **Book Request** | Services → Request a Book | Form submits successfully; record appears under user's pending requests. |
| 14 | **Librarian Login** | Log in with librarian credentials | "Librarian Desk" appears in header; Staff Console is accessible. |
| 15 | **Role Security** | Log in as patron and visit `/api/admin/stats` | Access is denied with `HTTP 403 Forbidden`. |
| 16 | **Persistence Test**| Restart Render service | Refresh website; verify previous borrowing records and user accounts persist. |

---

## 9. Production Security Checklist

- [x] **Zero Hardcoded Secrets in Git:** `backend/.env` is excluded by `.gitignore`.
- [x] **Secure JWT Secret:** Render `JWT_SECRET` is set to an independent 64-character random key, not the development fallback.
- [x] **No Wildcard CORS with Credentials:** `CORS_ORIGINS` explicitly targets the Vercel production domain. Wildcard `*` is filtered out by `config.py`.
- [x] **API Key Confidentiality:** `GEMINI_API_KEY` is configured solely on the Render backend. The frontend never possesses or transmits the Gemini API key.
- [x] **Role-Based Access Enforcement:** Admin/Librarian APIs (`/api/admin/*`, `/api/book-requests/*/status`) verify user role on the server side using `get_current_librarian`.
- [x] **HTTPS Everywhere:** Both Vercel and Render provide automatic TLS certificates and redirect all HTTP traffic to HTTPS.
- [x] **Database File Protection:** The SQLite file is stored on the server filesystem and is never placed in the web server's static file tree.
- [x] **Sanitized Input:** Pydantic schemas validate all payloads against SQL injection and malformed parameters.

---

## 10. Troubleshooting Guide

### 1. Render Build Failed (`pip install` error)
- **Symptom:** `error: externally-managed-environment` or missing compiler.
- **Fix:** Ensure the **Root Directory** in Render is set to `backend`. Verify all packages in `requirements.txt` use standard PyPI distribution names.

### 2. Render Port Binding Error (`Port scan timeout`)
- **Symptom:** `Web service failed to bind to $PORT`.
- **Fix:** Ensure the Start Command in Render is exactly:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
  Do not hardcode port `8000` or `8001`. Render requires `$PORT`.

### 3. CORS Error in Browser Console
- **Symptom:** `Access to fetch at ... has been blocked by CORS policy`.
- **Fix:** 
  1. Check the exact URL in the browser address bar (e.g. `https://libraryease.vercel.app`).
  2. Open Render Dashboard → `libraryease-backend` → **Environment**.
  3. Set `CORS_ORIGINS=https://libraryease.vercel.app` (no trailing slash).
  4. Save changes and wait for the restart.

### 4. Frontend Calling `localhost:8001` in Production
- **Symptom:** API calls fail with `ERR_CONNECTION_REFUSED` to `127.0.0.1`.
- **Fix:**
  1. In the Vercel Dashboard, go to **Settings** → **Environment Variables**.
  2. Confirm `VITE_API_URL` is set to `https://<your-render-app>.onrender.com/api`.
  3. Go to **Deployments** → **Redeploy** (check "Use existing build cache" OFF). Vite bakes environment variables into the static bundle during build time, so a full rebuild is required.

### 5. Render Free Tier Spin-Down Delay
- **Symptom:** The first request after 15 minutes of inactivity takes 40–50 seconds to respond.
- **Explanation:** Render's free tier puts inactive containers to sleep. Once a new request arrives, it spins up automatically.
- **Fix:** Upgrade to the \$7/month Render Starter plan for zero spin-down latency, or configure a free external monitoring ping (such as UptimeRobot) targeting `/api/health` every 10 minutes.

### 6. Gemini AI Assistant Shows "Demo Mode" in Production
- **Symptom:** AI banner says "Demo Mode: Rule-Based Recommendations".
- **Fix:** Verify `GEMINI_API_KEY` is added to Render's Environment Variables. Once added, test `/api/health` — it will report `"ai_enabled": true`.

---

## 11. Updating the Live Website

Continuous Deployment is active by default:

```bash
# 1. Make and test changes locally
git status

# 2. Commit and push to GitHub
git add .
git commit -m "feat: add new feature"
git push origin main
```

1. **Vercel** detects changes in `frontend/` and automatically builds and deploys a new release in ~30 seconds.
2. **Render** detects changes in `backend/` and automatically builds and restarts the web service with zero downtime.

To trigger a manual redeploy without committing code:
- **Render:** Open dashboard → Click **Manual Deploy** → **Deploy latest commit**.
- **Vercel:** Open dashboard → **Deployments** → Click three dots on latest deployment → **Redeploy**.

---

## 12. Final Deployment Architecture Diagram

```text
                                       +-----------------------------------+
                                       |            End User               |
                                       |   (Web Browser / Mobile Device)   |
                                       +-----------------+-----------------+
                                                         |
                                                         | HTTPS Requests
                                                         v
                                       +-----------------------------------+
                                       |          Vercel Platform          |
                                       |          (Edge CDN Layer)         |
                                       |                                   |
                                       |   * React 19 + Vite Frontend SPA  |
                                       |   * Static HTML / CSS / JS Assets |
                                       |   * Global Edge Distribution      |
                                       +-----------------+-----------------+
                                                         |
                                                         | Secure REST API Calls
                                                         | (JWT in Authorization Header)
                                                         v
                                       +-----------------------------------+
                                       |          Render Platform          |
                                       |       (Python Web Service)        |
                                       |                                   |
                                       |   * FastAPI Application (Async)   |
                                       |   * Uvicorn ASGI Server           |
                                       |   * APScheduler (Audit Jobs)      |
                                       |   * Strict CORS Validation        |
                                       +--------+-----------------+--------+
                                                |                 |
                   Google Generative Language   |                 | SQL Queries
                   API Calls (v1beta / HTTPS)   |                 | (via SQLAlchemy ORM)
                                                v                 v
                 +--------------------------------+   +--------------------------------+
                 |     Google Gemini 1.5 Flash    |   |     SQLite Database Engine     |
                 |      (Cloud AI Services)       |   |                                |
                 |                                |   |   Render Persistent Disk:      |
                 |   * Natural Language Reasoning |   |   /var/data/libraryease.db     |
                 |   * Semantic Book Pairings     |   |                                |
                 |   * Literary Concierge Chat    |   |   * Books & Mumbai Libraries   |
                 |   * Deterministic Fallback     |   |   * Users, Borrowings & Loans  |
                 +--------------------------------+   +--------------------------------+
```

---
*LibraryEase Deployment Guide — Documented and verified for production release.*
