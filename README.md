# Personal Finance Management (PFM)

A full-stack personal finance management app built with **Next.js** (frontend) and **Django REST Framework** (backend).

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.12+ | [python.org](https://python.org) |
| npm | 9+ | Bundled with Node.js |

---

## Project Structure

```
pfm/
├── frontend/   # Next.js · React · TypeScript · Tailwind CSS
└── backend/    # Django · Django REST Framework · SQLite
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create and activate virtual environment (first time only)
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Apply migrations (first time only)
python manage.py migrate

# Start dev server → http://localhost:8000
python manage.py runserver
```

### 2. Frontend

Open a **separate terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server → http://localhost:3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Base URL

All backend API routes are prefixed with `/api/v1/`.

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/auth/login/` | POST | Obtain JWT access + refresh tokens | Public |
| `/api/v1/auth/refresh/` | POST | Refresh access token | Public |
| `/api/v1/users/` | POST | Register a new user | Public |
| `/api/v1/wallets/` | GET, POST | List / create wallets | Required |
| `/api/v1/categories/` | GET, POST | List / create categories | Required |
| `/api/v1/budgets/` | GET, POST | List / create budgets | Required |
| `/api/v1/transactions/` | GET, POST | List / create transactions | Required |
| `/api/v1/notifications/` | GET | List notifications | Required |

Include the JWT token in requests as:
```
Authorization: Bearer <access_token>
```

---

## Useful Commands

### Backend

```bash
# Create a superuser for the Django admin panel
python manage.py createsuperuser

# Open Django admin → http://localhost:8000/admin
```

### Frontend

```bash
# Type-check
npm run build

# Lint
npm run lint
```
