# PFM Runbook — Home LAN Deployment

This runbook is for the **ADMIN** (see SRS §1.5): the family member who sets up and maintains the PFM app so every other family member (**USER**: Dad, Mom, Sister, Brother…) can reach it from their own phone/laptop over the home Wi-Fi. No internet-facing hosting, domain, or cloud account is required — everything runs on one machine on the LAN (a home PC, mini-PC, or NAS-like box left on the network).

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.12+ | [python.org](https://python.org) |
| npm | 9+ | Bundled with Node.js |

The host machine and every family member's device must be on the **same Wi-Fi/LAN**.

---

## 2. Find the host machine's LAN IP

On the machine that will run PFM (Windows):

```powershell
ipconfig
```

Note the **IPv4 Address** under your active adapter (e.g. `192.168.1.50`). This is the address family members will use to reach the app — it's referred to as `<HOST_IP>` below.

> The LAN IP can change if the router reassigns it (DHCP). If family members lose access after a router reboot, re-run `ipconfig` and check whether `<HOST_IP>` changed; for a more permanent setup, reserve a static IP for this machine in your router's DHCP settings.

---

## 3. Configure the backend for LAN access

By default the backend only trusts `localhost`. Edit `backend/config/settings.py`:

```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '<HOST_IP>']
```

Add the same address to `CORS_ALLOWED_ORIGINS` in the same file so the frontend (served from `<HOST_IP>:3000`) is allowed to call the API:

```python
CORS_ALLOWED_ORIGINS = [
    # ...existing entries...
    'http://<HOST_IP>:3000',
]
```

---

## 4. Configure the frontend to call the LAN backend

Edit `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://<HOST_IP>:8000
```

This is what makes family members' browsers (on their own devices) call the backend on the host machine instead of their own `localhost`.

---

## 5. First-time setup

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
```

```bash
# Frontend
cd frontend
npm install
```

---

## 6. Run the app, bound to the LAN

Open two terminals on the host machine.

**Backend** (bind to all interfaces, not just localhost):

```bash
cd backend
.venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

**Frontend**:

```bash
cd frontend
npm run dev -- -H 0.0.0.0
```

Family members can now open `http://<HOST_IP>:3000` from any device on the LAN.

> Leave both terminals running for as long as the family needs access. Closing them (or letting the host machine sleep) takes the app down for everyone.

---

## 7. Windows Firewall

The first time each server starts, Windows may prompt to allow the connection — choose **Allow** for **Private networks**. If devices still can't connect, confirm inbound rules exist for ports `3000` and `8000` (Windows Defender Firewall → Advanced Settings → Inbound Rules).

---

## 8. Creating family member accounts (ADMIN task)

Each USER needs their own account so their Wallets, Transactions, Budgets, and Goals stay private (SRS §4.4.2). Options:

- Have each family member self-register via the app's sign-up flow (`POST /api/v1/users/`), or
- The ADMIN creates a Django superuser for backend administration only:

  ```bash
  cd backend
  python manage.py createsuperuser
  ```

  Then manage accounts via the Django admin panel at `http://<HOST_IP>:8000/admin`.

The ADMIN role is for app/account setup only — it does not grant visibility into other family members' financial data.

---

## 9. Backup and restore

All data lives in a single SQLite file: `backend/db.sqlite3`.

- **Backup:** stop the backend, copy `db.sqlite3` somewhere safe (e.g. a USB drive or cloud folder), restart the backend.
- **Restore:** stop the backend, replace `db.sqlite3` with the backup copy, restart the backend.

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| A family member's browser can't reach the app at all | Not on the same LAN, or `<HOST_IP>` changed | Confirm same Wi-Fi network; re-check `ipconfig` on the host |
| App loads but login/data requests fail | `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS` not updated, or frontend still points at `localhost` | Re-check steps 3 and 4 |
| "Port already in use" on `manage.py runserver` or `npm run dev` | A previous server instance is still running | Stop the earlier process, or use a different port consistently across steps 3–6 |
| Everyone loses access at the same time | Host machine went to sleep, or one of the two terminals was closed | Restart both servers (step 6); consider disabling sleep on the host machine |
| Family member sees another member's data | Accounts not set up per-person (shared login) | Ensure each USER has their own account (step 8) — do not share logins |

---

## 11. Stopping the app

In each terminal, press `Ctrl+C` to stop the backend and frontend servers.
