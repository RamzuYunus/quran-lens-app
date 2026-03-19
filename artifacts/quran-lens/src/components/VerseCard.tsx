import { motion } from "framer-motion";
import { Copy, Sparkles } from "lucide-react";

interface VerseCardProps {
  surah: number;
  ayah: number;
  arabic: string;
  surahName: string;
  translations?: { lensName: string; translated: string }[];
}

export function VerseCard({ surah, ayah, arabic, surahName, translations = [] }: VerseCardProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-xs font-semibold text-stone-300 border border-border">
              {surah}:{ayah}
            </span>
            <span className="font-serif text-sm text-muted-foreground">{surahName}</span>
          </div>
          <button 
            onClick={() => handleCopy(arabic)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Copy Arabic"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <p 
            dir="rtl" 
            className="font-arabic text-3xl md:text-4xl leading-loose text-stone-100 text-right"
            style={{ wordSpacing: '0.2em' }}
          >
            {arabic}
          </p>
        </div>

        {translations.length > 0 && (
          <div className="pt-6 space-y-4 border-t border-border/50">
            {translations.map((t, idx) => (
              <div key={idx} className="bg-secondary/30 rounded-xl p-5 border border-white/5 relative group/trans">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {t.lensName} Lens
                  </span>
                </div>
                <p className="font-serif text-lg leading-relaxed text-stone-300">
                  {t.translated}
                </p>
                <button 
                  onClick={() => handleCopy(t.translated)}
                  className="absolute top-4 right-4 p-2 opacity-0 group-hover/trans:opacity-100 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  title="Copy Translation"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
