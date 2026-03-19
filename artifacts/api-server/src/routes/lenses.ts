import { Router, type IRouter } from "express";
import { db, lensRulesTable, translationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  GetLensRulesParams,
  SaveLensRulesParams,
  SaveLensRulesBody,
  GetLensesResponse,
  GetLensRulesResponse,
  SaveLensRulesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lenses", async (_req, res): Promise<void> => {
  const lenses = await db.select().from(lensRulesTable).orderBy(lensRulesTable.name);

  const translationCounts = await db
    .select({ lensName: translationsTable.lensName, count: sql<number>`count(*)::int` })
    .from(translationsTable)
    .groupBy(translationsTable.lensName);

  const countMap = new Map<string, number>();
  for (const tc of translationCounts) {
    countMap.set(tc.lensName, tc.count);
  }

  const result = lenses.map((l) => ({
    name: l.name,
    description: l.description,
    translationCount: countMap.get(l.name) ?? 0,
  }));

  res.json(GetLensesResponse.parse(result));
});

router.get("/lenses/:lensName", async (req, res): Promise<void> => {
  const params = GetLensRulesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lens] = await db
    .select()
    .from(lensRulesTable)
    .where(eq(lensRulesTable.name, params.data.lensName));

  if (!lens) {
    res.status(404).json({ error: "Lens not found" });
    return;
  }

  let glossary: Array<{ term: string; translation: string; notes?: string | null }> = [];
  try {
    glossary = JSON.parse(lens.glossaryJson);
  } catch {
    glossary = [];
  }

  res.json(
    GetLensRulesResponse.parse({
      name: lens.name,
      description: lens.description,
      rules: lens.rules,
      glossary,
      updatedAt: lens.updatedAt.toISOString(),
    })
  );
});

router.put("/lenses/:lensName", async (req, res): Promise<void> => {
  const params = SaveLensRulesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SaveLensRulesBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const glossaryJson = JSON.stringify(body.data.glossary);

  const [existing] = await db
    .select()
    .from(lensRulesTable)
    .where(eq(lensRulesTable.name, params.data.lensName));

  let lens;
  if (existing) {
    [lens] = await db
      .update(lensRulesTable)
      .set({
        description: body.data.description,
        rules: body.data.rules,
        glossaryJson,
        updatedAt: new Date(),
      })
      .where(eq(lensRulesTable.name, params.data.lensName))
      .returning();
  } else {
    [lens] = await db
      .insert(lensRulesTable)
      .values({
        name: params.data.lensName,
        description: body.data.description,
        rules: body.data.rules,
        glossaryJson,
      })
      .returning();
  }

  let glossary: Array<{ term: string; translation: string; notes?: string | null }> = [];
  try {
    glossary = JSON.parse(lens.glossaryJson);
  } catch {
    glossary = [];
  }

  res.json(
    SaveLensRulesResponse.parse({
      name: lens.name,
      description: lens.description,
      rules: lens.rules,
      glossary,
      updatedAt: lens.updatedAt.toISOString(),
    })
  );
});

export default router;
