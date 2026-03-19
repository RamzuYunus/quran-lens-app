# Quran Lens App

A powerful, offline-capable Quran visualization and translation tool that applies multiple interpretive lenses to Islamic sacred texts. Perfect for personal scholarly study on your own PC.

**Features:**
- 📖 Browse the Quran with large, right-to-left Arabic typography
- 📥 **Download the full Quran locally** (all 114 surahs, 6,236 verses) for offline use
- 🔍 Apply multiple "lenses" (interpretive frameworks) to any verse
- 🤖 AI-powered translations via local Ollama or remote APIs (OpenAI, Perplexity)
- 💾 Fully local — runs entirely on your machine, no cloud required
- 📊 Create custom lenses with glossaries (term → translation mappings)
- 🚀 Fast, responsive React + Vite frontend with dark scholarly theme

## Quick Start

### For Replit Users
The app is already running in this environment. Check the preview pane to interact with it.

### For Local Ubuntu Installation
Follow the **complete installation guide** in [`INSTALL.md`](./INSTALL.md).

TL;DR:
```bash
# Install Node.js, PostgreSQL, Ollama (optional)
# Clone/extract this project
cd quran-lens-app
pnpm install
pnpm --filter @workspace/db run push

# Option A: Quick test with 29 sample verses
pnpm --filter @workspace/scripts run seed-quran

# Option B: Download complete Quran (6,236 verses) for offline use
pnpm --filter @workspace/scripts run fetch-full-quran

# In separate terminals:
ollama serve          # Terminal 1 (optional, for local AI)
pnpm --filter @workspace/api-server run dev  # Terminal 2 (backend)
pnpm --filter @workspace/quran-lens run dev  # Terminal 3 (frontend)
```

Then open http://localhost:5173 (or whatever port is shown).

See **detailed instructions** in [`INSTALL.md`](./INSTALL.md).

## Project Structure

```
quran-lens-app/
├── artifacts/
│   ├── api-server/              # Express.js API (all routes)
│   └── quran-lens/              # React + Vite frontend
├── lib/
│   ├── api-spec/                # OpenAPI specification
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod validation schemas
│   └── db/                      # Drizzle ORM + PostgreSQL schema
├── scripts/
│   └── src/seed-quran.ts        # Seed script (29 verses + 2 example lenses)
├── INSTALL.md                   # Detailed local installation guide
└── README.md                    # This file
```

## Offline Storage & Full Quran Download

The app is designed for **complete offline use**:

1. **Download the full Quran once** — Run `pnpm --filter @workspace/scripts run fetch-full-quran` to download all 6,236 verses from the free alquran-api.pages.dev API
2. **Stored in local PostgreSQL** — All verses are saved in your local database for instant offline access
3. **No internet required** — Once downloaded, browse, search, and apply lenses without any internet connection
4. **AI translations offline** — Use local Ollama models for AI-powered translations without calling external APIs

The initial download takes 2-5 minutes (one-time), then everything is cached locally in PostgreSQL.

## What are "Lenses"?

A **lens** is an interpretive framework that reframes Quranic concepts through a modern scientific or scholarly perspective. The app comes with two example lenses:

### 1. Quantum Field Coherence
Interprets Quranic terms using quantum physics concepts:
- Allah → "The Omnipresent Quantum Field / Unified Field of Consciousness"
- Mala'ikah (angels) → "Field Operators / Regulatory Quantum Patterns"
- Salat (prayer) → "Quantum Alignment / Phase Synchronization"

### 2. Economics
Reads the Quran as a treatise on economic systems:
- Allah → "The Market / Universal Allocator / Price Mechanism"
- Rabb (Lord) → "The Regulator / Central Planner / Institutional Framework"
- Zakat (charity tax) → "Redistributive Tax / Pigouvian Transfer"

**You can create your own lenses** for any interpretive framework (neuroscience, ecology, political science, etc.).

## API Routes

All routes are under `/api`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/quran/verses?surah=X` | Fetch verses (optionally filtered by surah) |
| GET | `/quran/surahs` | List all surahs with verse counts |
| GET | `/lenses` | List all available lenses |
| GET | `/lenses/:lensName` | Get a specific lens's rules and glossary |
| PUT | `/lenses/:lensName` | Create or update a lens |
| GET | `/translations/:lensName` | Get existing translations for a lens |
| POST | `/translations/:lensName/generate` | Trigger AI translation generation |
| GET | `/ai/status` | Check Ollama/remote API availability |

## AI Integration

### Local Ollama (Recommended for Privacy)
The app defaults to using **Ollama** — a local AI server. You keep all data on your machine.

- Models: `llama3.2:3b` (default, 2GB), `llama2:7b` (faster), etc.
- Download: https://ollama.ai
- Start: `ollama serve`

### Remote APIs
Alternatively, use OpenAI, Perplexity, or any OpenAI-compatible API:

```bash
export USE_REMOTE_API=true
export REMOTE_API_URL="https://api.perplexity.ai/chat/completions"
export REMOTE_API_KEY="your-api-key"
export REMOTE_MODEL="llama-3.1-sonar-small-128k-chat"
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quran_lens"

# AI Backend (Local Ollama)
OLLAMA_URL="http://localhost:11434/api/generate"
OLLAMA_MODEL="llama3.2:3b"
USE_REMOTE_API=false

# OR: AI Backend (Remote API)
USE_REMOTE_API=true
REMOTE_API_URL="https://api.perplexity.ai/chat/completions"
REMOTE_API_KEY="pplx-xxxxxxxxxxxx"
REMOTE_MODEL="llama-3.1-sonar-small-128k-chat"
```

## Database

Uses PostgreSQL with three main tables:
- **verses** — Quranic verses (surah, ayah, Arabic text)
- **lens_rules** — Interpretive lenses (name, description, rules, glossary)
- **translations** — AI-generated translations (verse, lens, translated text)

All managed via **Drizzle ORM**.

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

The app is **not** a mobile-optimized web app — it's designed for desktop/laptop study.

## Technology Stack

**Frontend:**
- React 18
- Vite (fast build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Lucide Icons (UI icons)
- React Query (data fetching)

**Backend:**
- Node.js 20+
- Express.js 5
- Drizzle ORM (TypeScript-first database)
- Zod (validation)

**Database:**
- PostgreSQL 15+

**AI:**
- Ollama (local models)
- OpenAI/Perplexity-compatible APIs

**Build & Dev:**
- pnpm (monorepo package manager)
- TypeScript
- Orval (API code generation from OpenAPI spec)

## Customization

### Add More Verses
Edit `scripts/src/seed-quran.ts`, add verse objects, then:
```bash
pnpm --filter @workspace/scripts run seed-quran
```

### Create a New Lens in the UI
1. Go to **Manage Lenses**
2. Click **Create New Lens**
3. Fill in name, description, rules (markdown), and glossary
4. Save

Then trigger generation to translate all verses with that lens.

### Modify the Frontend
Frontend code is in `artifacts/quran-lens/src/`.
- `App.tsx` — Main app layout
- `pages/` — Page components (Browse, Manage Lenses, Generate, Translations)
- `components/` — Reusable UI components
- `src/index.css` — Tailwind theming

### Modify the Backend
Backend code is in `artifacts/api-server/src/`.
- `routes/quran.ts` — Verse endpoints
- `routes/lenses.ts` — Lens management endpoints
- `routes/translations.ts` — Translation and AI endpoints

## Troubleshooting

### "Cannot connect to Ollama"
Make sure `ollama serve` is running in a separate terminal.

### "Database connection refused"
Check PostgreSQL is running: `sudo systemctl status postgresql`

### "Port already in use"
Change the port by setting `PORT` environment variable or killing the process on that port.

See **full troubleshooting** in [`INSTALL.md`](./INSTALL.md#troubleshooting).

## License

This project is for personal, non-commercial use. Respect the sanctity of the Quran and use this tool responsibly.

## References

- [OpenAPI Specification](./lib/api-spec/openapi.yaml)
- [Database Schema](./lib/db/src/schema/verses.ts)
- [Installation Guide](./INSTALL.md)
- [Replit Documentation](https://replit.com/docs)

---

**Happy studying!** 📖✨

For detailed setup instructions, see [`INSTALL.md`](./INSTALL.md).
