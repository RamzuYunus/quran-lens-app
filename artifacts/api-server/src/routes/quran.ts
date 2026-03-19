import { Router, type IRouter } from "express";
import { db, versesTable, lensRulesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetVersesQueryParams,
  GetVersesResponse,
  GetSurahsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/quran/verses", async (req, res): Promise<void> => {
  const query = GetVersesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(versesTable).$dynamic();

  if (query.data.surah) {
    dbQuery = dbQuery.where(eq(versesTable.surah, query.data.surah));
  }

  const verses = await dbQuery.orderBy(versesTable.surah, versesTable.ayah);

  const limited = query.data.limit ? verses.slice(0, query.data.limit) : verses;

  res.json(GetVersesResponse.parse(limited));
});

router.get("/quran/surahs", async (_req, res): Promise<void> => {
  const verses = await db.select().from(versesTable).orderBy(versesTable.surah, versesTable.ayah);

  const surahMap = new Map<number, { number: number; name: string; nameArabic: string; verseCount: number }>();
  for (const v of verses) {
    if (!surahMap.has(v.surah)) {
      surahMap.set(v.surah, {
        number: v.surah,
        name: v.surahName,
        nameArabic: v.surahName,
        verseCount: 0,
      });
    }
    surahMap.get(v.surah)!.verseCount++;
  }

  const surahs = Array.from(surahMap.values()).sort((a, b) => a.number - b.number);
  res.json(GetSurahsResponse.parse(surahs));
});

export default router;
