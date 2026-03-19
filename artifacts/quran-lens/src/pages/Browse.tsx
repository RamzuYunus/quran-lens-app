import { useState } from "react";
import { useGetSurahs, useGetVerses } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { VerseCard } from "@/components/VerseCard";
import { BookOpen } from "lucide-react";

export function Browse() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  
  const { data: surahs, isLoading: surahsLoading } = useGetSurahs();
  const { data: verses, isLoading: versesLoading } = useGetVerses({ surah: selectedSurah });

  return (
    <Layout>
      <div className="space-y-8 pb-24">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-stone-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Browse Scripture
          </h1>
          <p className="text-lg text-muted-foreground font-serif max-w-2xl">
            Explore the original Arabic text. Select a surah to begin your study.
          </p>
        </header>

        <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-4 items-center shadow-md">
          <label className="text-sm font-medium text-stone-300 whitespace-nowrap">
            Select Chapter:
          </label>
          <div className="relative w-full sm:w-72">
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(Number(e.target.value))}
              className="w-full appearance-none bg-secondary border border-border text-stone-200 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-serif"
              disabled={surahsLoading}
            >
              {surahsLoading && <option>Loading surahs...</option>}
              {surahs?.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.nameArabic})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {verses && (
            <div className="ml-auto text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-white/5">
              {verses.length} verses
            </div>
          )}
        </div>

        <div className="space-y-6">
          {versesLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-48"></div>
              ))}
            </div>
          ) : verses?.length ? (
            verses.map((verse) => (
              <VerseCard
                key={verse.id}
                surah={verse.surah}
                ayah={verse.ayah}
                arabic={verse.arabic}
                surahName={verse.surahName}
              />
            ))
          ) : (
            <div className="text-center py-24 bg-card/50 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground font-serif text-lg">No verses found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
