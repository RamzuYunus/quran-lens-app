# Quran Lens App - Installation Guide for Ubuntu 24.04

This guide walks you through setting up and running the Quran Lens App locally on Ubuntu 24.04 with PostgreSQL.

## Prerequisites

You'll need:
- Ubuntu 24.04 or similar Linux
- Node.js 20+ (with npm)
- pnpm (package manager)
- PostgreSQL 15+ (local installation)
- Ollama (optional, for local AI; or use a remote API)

## Step 1: Install Node.js and pnpm

### Install Node.js

If you don't have Node.js 20+ installed:

```bash
# Install Node.js from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be v20.x or higher
```

### Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

## Step 2: Install PostgreSQL

### Install PostgreSQL 15 (or later)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable at boot

# Verify installation
psql --version
```

### Create a Database and User

```bash
# Switch to the postgres system user
sudo -u postgres psql

# Inside the PostgreSQL prompt, run:
CREATE DATABASE quran_lens;
CREATE USER quran_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE quran_user SET client_encoding TO 'utf8';
ALTER ROLE quran_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE quran_user SET default_transaction_deferrable TO on;
ALTER ROLE quran_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE quran_lens TO quran_user;
\q  # Exit PostgreSQL prompt
```

## Step 3: Download and Extract the Project

```bash
# Navigate to your home directory (or preferred location)
cd ~

# Download the project (replace with actual URL or extract from zip)
# Option A: If you have a zip file
unzip quran-lens-app.zip
cd quran-lens-app

# Option B: If cloning from git
git clone <repository-url>
cd quran-lens-app
```

## Step 4: Set Up Environment Variables

Create a `.env.local` file in the project root with your PostgreSQL connection details:

```bash
# From the project root directory
cat > .env.local << 'EOF'
# PostgreSQL Connection
DATABASE_URL="postgresql://quran_user:your_secure_password_here@localhost:5432/quran_lens"

# AI Backend (choose one)
# For local Ollama:
OLLAMA_URL="http://localhost:11434/api/generate"
OLLAMA_MODEL="llama3.2:3b"
USE_REMOTE_API=false

# For remote API (Perplexity/OpenAI-compatible), uncomment and fill in:
# USE_REMOTE_API=true
# REMOTE_API_URL="https://api.perplexity.ai/chat/completions"
# REMOTE_MODEL="llama-3.1-sonar-small-128k-chat"
# REMOTE_API_KEY="your-api-key-here"

# Server port (optional, defaults to 8080)
PORT=8080
EOF
```

Replace `your_secure_password_here` with the password you created for `quran_user`.

## Step 5: Install Project Dependencies

```bash
# From the project root
pnpm install

# This installs all workspace packages and their dependencies
```

## Step 6: Set Up the Database Schema

```bash
# Push the Drizzle schema to your PostgreSQL database
pnpm --filter @workspace/db run push

# You should see output like:
# [✓] Pulling schema from database...
# [✓] Changes applied
```

## Step 7: Seed the Database

The project comes with sample Quran verses and interpretive lenses. Seed them:

```bash
# Seed 29 sample verses and 2 example lenses
pnpm --filter @workspace/scripts run seed-quran

# You should see:
# Seeding Quran verses...
# Inserted 29 verses
# Seeding lens rules...
# Inserted 2 lens configurations
# Seeding complete!
```

## Step 8: (Optional) Install and Start Ollama

If you want to use local AI models for translation (recommended for privacy):

### Install Ollama

```bash
# Download and install Ollama from https://ollama.ai/download/linux
# Or use:
curl https://ollama.ai/install.sh | sh

# Verify installation
ollama --version
```

### Download a Model

The project is pre-configured to use `llama3.2:3b` (fast, lightweight):

```bash
# In a separate terminal, download the model
ollama pull llama3.2:3b

# This may take a few minutes (about 2GB download)
```

### Start Ollama Server

```bash
# In a separate terminal, start the Ollama server
ollama serve

# You should see:
# Listening on 127.0.0.1:11434
```

The server will stay running in that terminal. Leave it open while using the app.

## Step 9: Start the Backend API

```bash
# From the project root, in a NEW terminal
pnpm --filter @workspace/api-server run dev

# You should see:
# > @workspace/api-server@0.0.0 dev
# [HH:MM:SS.sss] INFO (PID): Server listening
#     port: 8080
```

The API is now running on `http://localhost:8080/api`.

## Step 10: Start the Frontend

```bash
# From the project root, in ANOTHER NEW terminal
pnpm --filter @workspace/quran-lens run dev

# You should see:
# > @workspace/quran-lens@0.0.0 dev
# ➜  Local:   http://localhost:XXXXX/
# ➜  Network: http://172.31.x.x:XXXXX/
```

Note the port number (e.g., 3000, 5173, etc.).

## Step 11: Open the App in Your Browser

Open your browser and navigate to the localhost address shown in the frontend terminal, e.g.:
```
http://localhost:5173
```

You should see:
- The Quran Lens App with a dark scholarly theme
- Left sidebar with navigation (Browse Verses, Manage Lenses, Generate, Translations)
- Browse Verses showing surahs from the seeded data
- Arabic text displayed right-to-left
- AI Engine status showing "Local Ollama" with a green dot (if running) or red dot (if not running)

## Terminal Setup (Summary)

You'll need 4 terminals open simultaneously:

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `ollama serve` | Ollama AI server (optional, if using local models) |
| 2 | `pnpm --filter @workspace/api-server run dev` | Backend API server |
| 3 | `pnpm --filter @workspace/quran-lens run dev` | Frontend dev server |
| 4 | (for any other tasks) | — |

## Using the App

### Browse Verses
1. Go to **Browse Verses**
2. Select a surah from the dropdown
3. View the Arabic text in large RTL format

### Create a New Lens
1. Go to **Manage Lenses**
2. Click "Create New Lens"
3. Fill in:
   - **Name**: e.g., "neuroscience"
   - **Description**: What this lens interprets
   - **Rules**: Markdown text for the AI system prompt
   - **Glossary**: Term → Translation pairs
4. Save

### Generate AI Translations
1. Go to **Generate**
2. Select a lens from the dropdown
3. Optionally select which surahs to translate (leave empty for all)
4. Click "Generate"
5. Watch the progress bar as the AI processes each verse
6. Results appear in the table below

### View Translations
1. Go to **Translations**
2. Select a lens and optionally a surah
3. See all generated translations
4. Copy any translation to clipboard

## Troubleshooting

### "Database connection failed"
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check the `DATABASE_URL` in `.env.local` is correct
- Verify the database and user exist: `sudo -u postgres psql -l`

### "Cannot find module @workspace/db"
- Run `pnpm install` from the project root
- If still failing, run `pnpm install --force`

### "Ollama connection refused"
- Make sure Ollama is running: `ollama serve` in a separate terminal
- Verify the `OLLAMA_URL` in `.env.local` is `http://localhost:11434/api/generate`
- Check Ollama is listening: `curl http://localhost:11434/api/tags`

### "Translation generation times out"
- Ollama models can take 5-30 seconds per verse depending on your hardware
- For faster results, use a remote API with `USE_REMOTE_API=true` and provide credentials
- Or use a smaller model like `llama2:7b` instead of `llama3.2:3b`

### "Port already in use"
- If port 8080 (API) or 5173 (frontend) is in use:
  - Find the process: `lsof -i :8080` or `lsof -i :5173`
  - Kill it: `kill -9 <PID>`
  - Or choose a different port by setting the `PORT` environment variable

## Using a Remote API Instead of Ollama

If you don't want to run Ollama locally, use Perplexity AI or OpenAI:

```bash
# Edit .env.local
USE_REMOTE_API=true
REMOTE_API_URL="https://api.perplexity.ai/chat/completions"
REMOTE_MODEL="llama-3.1-sonar-small-128k-chat"
REMOTE_API_KEY="pplx-xxxxxxxxxxxx"

# Or for OpenAI:
REMOTE_API_URL="https://api.openai.com/v1/chat/completions"
REMOTE_MODEL="gpt-3.5-turbo"
REMOTE_API_KEY="sk-xxxxxxxxxxxx"
```

Then restart the backend API.

## Database Backups

To back up your Quran translations:

```bash
# Export database to a file
pg_dump -U quran_user -h localhost quran_lens > quran_lens_backup.sql

# Restore from backup
psql -U quran_user -h localhost quran_lens < quran_lens_backup.sql
```

## Advanced: Adding More Verses

To add more Quranic verses to the database, edit `scripts/src/seed-quran.ts`, then re-run:

```bash
pnpm --filter @workspace/scripts run seed-quran
```

(Note: This will only add new verses; existing ones won't be duplicated.)

## Support

For issues or questions, check:
- The app's sidebar shows "AI ENGINE" status
- Backend logs in terminal 2 (pnpm api-server)
- Frontend logs in browser console (F12 → Console tab)
- PostgreSQL logs: `sudo journalctl -u postgresql -n 50`
- Ollama logs in terminal 1 (ollama serve)

---

**Happy studying!** 📖✨
