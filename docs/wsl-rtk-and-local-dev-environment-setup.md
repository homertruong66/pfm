# WSL & RTK Setup (Windows)

[RTK](https://github.com/rtk-ai/rtk) optimises token usage for AI tools. On Windows, WSL is recommended for full hook support.

## 1. Install WSL and Ubuntu (Windows)

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

This installs WSL 2 and Ubuntu in one step. Restart your machine when prompted.

After restart, Ubuntu will launch automatically and ask you to create a Unix username and password.

> **Already have WSL but not Ubuntu?**
> ```powershell
> wsl --install -d Ubuntu
> ```

> **Verify WSL 2 is the default:**
> ```powershell
> wsl --set-default-version 2
> wsl --list --verbose   # confirm Ubuntu shows VERSION 2
> ```

## 2. Install RTK in WSL

Open an Ubuntu terminal, then:

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

Add to PATH if not already:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## 3. Initialise for Claude Code

```bash
rtk init -g
```

Then restart Claude Code. RTK auto-rewrite and hook support work identically to native Linux inside WSL.

## 4. Verify

```bash
rtk --version
rtk gain        # shows token savings stats
```

## Other AI tools

```bash
rtk init -g --gemini     # Gemini CLI
rtk init -g --codex      # Codex (OpenAI)
```

## Uninstall

```bash
rtk init -g --uninstall
```


# Project Setup

## Prerequisites

Before cloning the repo, ensure the following are installed on Windows:

| Tool | Version | Notes |
|---|---|---|
| Docker Desktop | Latest | Must be running before any `docker compose` command |
| WSL 2 + Ubuntu | — | See Section 1 above |
| Git (WSL) | Latest | Run `sudo apt install git` inside Ubuntu if not already installed |

## 1. SSH Key — First-Time Setup

> Skip this section if `~/.ssh/id_ed25519` already exists in WSL.

### Generate a key (WSL)

```bash
ssh-keygen -t ed25519 -C "your.email@globee.hk"
# Accept the default path (~/.ssh/id_ed25519)
# Set a passphrase or leave blank
```

### Copy your Windows SSH key into WSL (alternative)

If your key already lives at `C:\Users\<YourWindowsUsername>\.ssh\id_ed25519`:

```bash
mkdir -p ~/.ssh
cp /mnt/c/Users/$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r')/.ssh/id_ed25519 ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519
```

> The `$(cmd.exe /c "echo %USERNAME%")` expression resolves your Windows username automatically inside WSL. If it fails, replace it with your literal username (e.g. `cp /mnt/c/Users/GLOBEE/.ssh/id_ed25519 ...`).

### Add Bitbucket to known_hosts

Run from **Windows PowerShell**:

```powershell
ssh-keyscan bitbucket.org 2>$null | wsl -d Ubuntu -- sh -c "cat >> ~/.ssh/known_hosts"
```

### Register the public key on Bitbucket

1. Print the public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Copy the output.
3. Go to **Bitbucket → Personal settings → SSH keys → Add key** and paste it.

## 2. Clone the Repository (WSL)

Open Ubuntu from Windows PowerShell:

```powershell
wsl -d Ubuntu
```

### If the local repo does not exist yet

```bash
mkdir -p /home/app
cd /home/app
git clone git@bitbucket.org:globee-software/fresher01-grm.git
cd fresher01-grm
git checkout practice          # or your feature branch
```

### If the local repo already exists

```bash
cd /home/app/fresher01-grm
git pull origin practice       # or your feature branch
```

## 3. Start the Application

```bash
cd /home/app/fresher01-grm
docker compose up --build
```

Wait until all three containers are healthy. You will see log output from `postgres`, `backend`, and `frontend`.

## 4. Verify Services Are Running

```bash
# Backend liveness
curl http://localhost:9090/health
# Expected: ok

# Frontend (HTTP 200 = up)
curl -I http://localhost:3000
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:9090 |
| Swagger UI | http://localhost:9090/swagger-ui/index.html |

Default login: **grm / grm123**

## 5. Stop the Application

```bash
# Stop, keep database data
docker compose down

# Stop and wipe database (required after Flyway migration changes)
docker compose down -v
```

> See [RUNBOOK.md](../RUNBOOK.md) for the full operational reference.