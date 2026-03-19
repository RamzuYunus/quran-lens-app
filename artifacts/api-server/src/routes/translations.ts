import { Router, type IRouter } from "express";
import { db, versesTable, lensRulesTable, translationsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  GetTranslationsParams,
  GetTranslationsQueryParams,
  GenerateTranslationsParams,
  GenerateTranslationsBody,
  GetTranslationsResponse,
  GenerateTranslationsResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const OLLAMA_URL = process.env["OLLAMA_URL"] ?? "http://localhost:11434/api/generate";
const DEFAULT_MODEL = process.env["OLLAMA_MODEL"] ?? "llama3.2:3b";
const REMOTE_API_URL = process.env["REMOTE_API_URL"] ?? "https://api.perplexity.ai/chat/completions";
const REMOTE_MODEL = process.env["REMOTE_MODEL"] ?? "llama-3.1-sonar-small-128k-chat";
const REMOTE_API_KEY = process.env["REMOTE_API_KEY"] ?? "";
const USE_REMOTE_API = process.env["USE_REMOTE_API"] === "true";

async function callOllama(prompt: string, model: string): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { response?: string };
  return data.response ?? "[No response from model]";
}

async function callRemoteApi(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(REMOTE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${REMOTE_API_KEY}`,
    },
    body: JSON.stringify({
      model: REMOTE_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(`Remote API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "[No response from API]";
}

function buildSystemPrompt(rules: string, glossaryJson: string): string {
  let glossary: Array<{ term: string; translation: string; notes?: string | null }> = [];
  try {
    glossary = JSON.parse(glossaryJson);
  } catch {
    glossary = [];
  }

  const glossaryText =
    glossary.length > 0
      ? "\n\nGLOSSARY (use these translations consistently):\n" +
        glossary.map((g) => `- ${g.term} → ${g.translation}${g.notes ? ` (${g.notes})` : ""}`).join("\n")
      : "";

  return `You are a Quranic scholar applying a specialized interpretive lens to translate and interpret Quran verses.

${rules}${glossaryText}

Instructions:
- Provide a single coherent translation/interpretation of the verse using the lens above
- Apply the glossary terms consistently
- Keep the translation concise (1-3 sentences maximum)
- Do not include the original Arabic, surah/ayah references, or explanatory notes in your output
- Output ONLY the translated/interpreted text, nothing else`;
}

router.get("/translations/:lensName", async (req, res): Promise<void> => {
  const params = GetTranslationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const queryParams = GetTranslationsQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  let dbQuery = db.select().from(translationsTable).$dynamic();

  if (queryParams.data.surah) {
    dbQuery = dbQuery.where(
      and(
        eq(translationsTable.lensName, params.data.lensName),
        eq(translationsTable.surah, queryParams.data.surah)
      )
    );
  } else {
    dbQuery = dbQuery.where(eq(translationsTable.lensName, params.data.lensName));
  }

  const translations = await dbQuery.orderBy(translationsTable.surah, translationsTable.ayah);

  if (translations.length === 0) {
    res.status(404).json({ error: "No translations found for this lens" });
    return;
  }

  res.json(
    GetTranslationsResponse.parse(
      translations.map((t) => ({
        ...t,
        generatedAt: t.generatedAt.toISOString(),
      }))
    )
  );
});

router.post("/translations/:lensName/generate", async (req, res): Promise<void> => {
  const params = GenerateTranslationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = GenerateTranslationsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [lensRow] = await db
    .select()
    .from(lensRulesTable)
    .where(eq(lensRulesTable.name, params.data.lensName));

  if (!lensRow) {
    res.status(404).json({ error: "Lens not found. Please create lens rules first." });
    return;
  }

  let versesQuery = db.select().from(versesTable).$dynamic();
  if (body.data.surahNumbers && body.data.surahNumbers.length > 0) {
    versesQuery = versesQuery.where(inArray(versesTable.surah, body.data.surahNumbers));
  }
  const verses = await versesQuery.orderBy(versesTable.surah, versesTable.ayah);

  if (verses.length === 0) {
    res.status(400).json({ error: "No verses found. Please seed the database first." });
    return;
  }

  const systemPrompt = buildSystemPrompt(lensRow.rules, lensRow.glossaryJson);
  const useRemote = body.data.useRemoteApi ?? USE_REMOTE_API;
  const model = body.data.model ?? DEFAULT_MODEL;

  const results: Array<{
    id: number;
    surah: number;
    ayah: number;
    arabic: string;
    surahName: string;
    lensName: string;
    translated: string;
    generatedAt: string;
  }> = [];

  let successCount = 0;
  let errorCount = 0;

  for (const verse of verses) {
    const userPrompt = `Surah ${verse.surah} (${verse.surahName}), Ayah ${verse.ayah}:\n${verse.arabic}`;

    let translated = "";
    try {
      if (useRemote) {
        translated = await callRemoteApi(systemPrompt, userPrompt);
      } else {
        const fullPrompt = `${systemPrompt}\n\nVerse: ${userPrompt}\n\nTranslation:`;
        translated = await callOllama(fullPrompt, model);
      }
      successCount++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.error({ err: errMsg, surah: verse.surah, ayah: verse.ayah }, "Translation error");
      translated = `[Error: ${errMsg}]`;
      errorCount++;
    }

    const generatedAt = new Date();

    const [saved] = await db
      .insert(translationsTable)
      .values({
        verseId: verse.id,
        surah: verse.surah,
        ayah: verse.ayah,
        arabic: verse.arabic,
        surahName: verse.surahName,
        lensName: params.data.lensName,
        translated,
      })
      .onConflictDoNothing()
      .returning();

    results.push({
      id: saved?.id ?? 0,
      surah: verse.surah,
      ayah: verse.ayah,
      arabic: verse.arabic,
      surahName: verse.surahName,
      lensName: params.data.lensName,
      translated,
      generatedAt: (saved?.generatedAt ?? generatedAt).toISOString(),
    });
  }

  res.json(
    GenerateTranslationsResponse.parse({
      lensName: params.data.lensName,
      totalVerses: verses.length,
      successCount,
      errorCount,
      results,
      message: `Generated ${successCount} translations, ${errorCount} errors.`,
    })
  );
});

router.get("/ai/status", async (_req, res): Promise<void> => {
  let ollamaAvailable = false;
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(3000),
    });
    ollamaAvailable = response.ok;
  } catch {
    ollamaAvailable = false;
  }

  res.json({
    ollamaAvailable,
    ollamaUrl: OLLAMA_URL,
    defaultModel: DEFAULT_MODEL,
    useRemoteApi: USE_REMOTE_API,
    remoteApiConfigured: REMOTE_API_KEY.length > 0,
  });
});

export default router;
