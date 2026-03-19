import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const versesTable = pgTable("verses", {
  id: serial("id").primaryKey(),
  surah: integer("surah").notNull(),
  ayah: integer("ayah").notNull(),
  arabic: text("arabic").notNull(),
  surahName: text("surah_name").notNull(),
});

export const insertVerseSchema = createInsertSchema(versesTable).omit({ id: true });
export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type Verse = typeof versesTable.$inferSelect;

export const lensRulesTable = pgTable("lens_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  rules: text("rules").notNull(),
  glossaryJson: text("glossary_json").notNull().default("[]"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLensRulesSchema = createInsertSchema(lensRulesTable).omit({ id: true, updatedAt: true });
export type InsertLensRules = z.infer<typeof insertLensRulesSchema>;
export type LensRules = typeof lensRulesTable.$inferSelect;

export const translationsTable = pgTable("translations", {
  id: serial("id").primaryKey(),
  verseId: integer("verse_id").notNull().references(() => versesTable.id),
  surah: integer("surah").notNull(),
  ayah: integer("ayah").notNull(),
  arabic: text("arabic").notNull(),
  surahName: text("surah_name").notNull(),
  lensName: text("lens_name").notNull(),
  translated: text("translated").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translationsTable).omit({ id: true, generatedAt: true });
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translationsTable.$inferSelect;
