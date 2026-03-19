# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

This workspace contains the **Quran Lens App** — a personal scholarly tool for studying the Quran through multiple interpretive lenses (quantum field coherence, economics, etc.), with AI-powered translation via local Ollama or external APIs.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all routes)
│   └── quran-lens/         # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed-quran.ts   # Seeds verses + lens rules into DB
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

Three tables in PostgreSQL:
- **verses** — Quran verses (surah, ayah, arabic text, surah name)
- **lens_rules** — Interpretive lens configurations (name, description, rules markdown, glossary JSON)
- **translations** — AI-generated translations (verse FK, lens name, translated text, timestamp)

## API Routes

All routes are under `/api`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quran/verses?surah=X&limit=N` | Get verses (optionally filtered) |
| GET | `/api/quran/surahs` | Get list of surahs with verse counts |
| GET | `/api/lenses` | List all lens configurations |
| GET | `/api/lenses/:lensName` | Get specific lens rules + glossary |
| PUT | `/api/lenses/:lensName` | Create or update a lens |
| GET | `/api/translations/:lensName?surah=X` | Get AI translations for a lens |
| POST | `/api/translations/:lensName/generate` | Run AI generation for a lens |
| GET | `/api/ai/status` | Check Ollama/remote API status |

## Frontend Pages

1. **Browse Verses** — Select surah, view Arabic text RTL with any lens translations
2. **Manage Lenses** — Create/edit interpretive lenses with glossaries
3. **Generate** — Trigger AI translation using Ollama (local) or remote API
4. **Translations** — View and export translations per lens

## AI Integration

The app supports two AI backends, configured via environment variables:
- **Local Ollama** (default): `http://localhost:11434` — model `llama3.2:3b`
- **Remote API** (Perplexity-compatible): set `USE_REMOTE_API=true`, `REMOTE_API_KEY=...`, `REMOTE_API_URL=...`

Environment variables for AI:
- `OLLAMA_URL` — Ollama endpoint (default: `http://localhost:11434/api/generate`)
- `OLLAMA_MODEL` — Model name (default: `llama3.2:3b`)
- `USE_REMOTE_API` — Set to `true` to use remote API
- `REMOTE_API_URL` — Remote API endpoint
- `REMOTE_MODEL` — Remote model name
- `REMOTE_API_KEY` — API key for remote service

## Seeding

To seed the database with Quran verses and example lenses:
```bash
pnpm --filter @workspace/scripts run seed-quran
```

## Codegen

After changing `lib/api-spec/openapi.yaml`:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
