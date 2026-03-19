import { useState } from "react";
import { useGetLenses, useGetSurahs, useGetTranslations } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { BookText, Download, Copy } from "lucide-react";
import { VerseCard } from "@/components/VerseCard";

export function Translations() {
  const { data: lenses } = useGetLenses();
  const { data: surahs } = useGetSurahs();
  
  const [selectedLens, setSelectedLens] = useState<string>("");
  const [selectedSurah, setSelectedSurah] = useState<number | "">("");

  const { data: translations, isLoading } = useGetTranslations(
    selectedLens, 
    { surah: selectedSurah ? Number(selectedSurah) : undefined },
    { query: { enabled: !!selectedLens } }
  );

  const exportJson = () => {
    if (!translations || translations.length === 0) return;
    const dataStr = JSON.stringify(translations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translations_${selectedLens}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-8 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-stone-100 flex items-center gap-3">
              <BookText className="w-8 h-8 text-primary" />
              Translation Archive
            </h1>
            <p className="text-lg text-muted-foreground font-serif">
              Review and export completed AI translations.
            </p>
          </div>
          
          <button 
            onClick={exportJson}
            disabled={!translations || translations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-stone-200 border border-border rounded-lg hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </header>

        <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-4 shadow-md">
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1">Lens</label>
            <select
              value={selectedLens}
              onChange={(e) => setSelectedLens(e.target.value)}
              className="w-full appearance-none bg-secondary border border-border text-stone-200 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all font-serif"
            >
              <option value="" disabled>Select a Lens</option>
              {lenses?.map(l => (
                <option key={l.name} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1">Surah Filter (Optional)</label>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value ? Number(e.target.value) : "")}
              className="w-full appearance-none bg-secondary border border-border text-stone-200 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all font-serif"
            >
              <option value="">All Surahs</option>
              {surahs?.map(s => (
                <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {!selectedLens ? (
            <div className="text-center py-24 bg-card/50 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground font-serif text-lg">Select a lens to view translations.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-64"></div>
              ))}
            </div>
          ) : translations && translations.length > 0 ? (
            translations.map((t) => (
              <VerseCard
                key={`${t.lensName}-${t.surah}-${t.ayah}`}
                surah={t.surah}
                ayah={t.ayah}
                arabic={t.arabic}
                surahName={t.surahName}
                translations={[{ lensName: t.lensName, translated: t.translated }]}
              />
            ))
          ) : (
            <div className="text-center py-24 bg-card/50 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground font-serif text-lg">No translations found for these filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
