import { useState } from "react";
import { useGetLenses, useGetSurahs, useGenerateTranslations, useGetAiStatus } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Sparkles, Server, Cpu, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Generate() {
  const { data: lenses } = useGetLenses();
  const { data: surahs } = useGetSurahs();
  const { data: aiStatus } = useGetAiStatus();
  
  const [selectedLens, setSelectedLens] = useState<string>("");
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [useRemoteApi, setUseRemoteApi] = useState(false);
  
  const generateMutation = useGenerateTranslations();

  const toggleSurah = (num: number) => {
    setSelectedSurahs(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleGenerate = () => {
    if (!selectedLens) return;
    
    generateMutation.mutate({
      lensName: selectedLens,
      data: {
        surahNumbers: selectedSurahs.length > 0 ? selectedSurahs : undefined, // empty means all
        useRemoteApi
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-stone-100 flex items-center justify-center md:justify-start gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Generation
          </h1>
          <p className="text-lg text-muted-foreground font-serif">
            Process scripture through your interpretive lenses using local or remote LLMs.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="space-y-3 relative">
              <label className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Select Framework</label>
              <select 
                value={selectedLens}
                onChange={e => setSelectedLens(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl p-3.5 text-stone-200 focus:outline-none focus:border-primary font-serif text-lg appearance-none"
              >
                <option value="" disabled>-- Choose a Lens --</option>
                {lenses?.map(l => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 relative">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Target Surahs</label>
                <button 
                  onClick={() => setSelectedSurahs([])}
                  className="text-xs text-primary hover:underline"
                >
                  Clear (Process All)
                </button>
              </div>
              <div className="h-48 overflow-y-auto bg-black/20 border border-white/5 rounded-xl p-2 custom-scrollbar">
                {surahs?.map(s => (
                  <label key={s.number} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedSurahs.includes(s.number)}
                      onChange={() => toggleSurah(s.number)}
                      className="rounded border-border bg-secondary text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <span className="text-sm font-medium text-stone-300 w-6">{s.number}.</span>
                    <span className="text-sm font-serif text-stone-200">{s.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {selectedSurahs.length === 0 ? "No surahs selected. Entire Quran will be processed." : `${selectedSurahs.length} surahs selected.`}
              </p>
            </div>

            <div className="space-y-3 relative pt-4 border-t border-border">
              <label className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Compute Backend</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setUseRemoteApi(false)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                    !useRemoteApi 
                      ? "bg-primary/10 border-primary text-primary shadow-inner" 
                      : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  <Cpu className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">Local Ollama</span>
                  {aiStatus?.ollamaAvailable ? (
                    <span className="text-[10px] text-emerald-400 mt-1">Available</span>
                  ) : (
                    <span className="text-[10px] text-red-400 mt-1">Offline</span>
                  )}
                </button>

                <button 
                  onClick={() => setUseRemoteApi(true)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                    useRemoteApi 
                      ? "bg-primary/10 border-primary text-primary shadow-inner" 
                      : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  <Server className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">Remote API</span>
                  {aiStatus?.remoteApiConfigured ? (
                    <span className="text-[10px] text-emerald-400 mt-1">Configured</span>
                  ) : (
                    <span className="text-[10px] text-amber-400 mt-1">Check Keys</span>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedLens || generateMutation.isPending}
              className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Consulting the Archives...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Commence Translation
                </>
              )}
            </button>
          </div>

          {/* Results/Status Panel */}
          <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-lg">
            <div className="p-4 border-b border-border bg-black/20">
              <h3 className="font-semibold text-stone-200">Execution Log</h3>
            </div>
            
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-10">
              
              {!generateMutation.isPending && !generateMutation.data && !generateMutation.error && (
                <div className="text-center text-muted-foreground">
                  <BookText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-serif">Awaiting instructions.</p>
                </div>
              )}

              {generateMutation.isPending && (
                <div className="text-center w-full max-w-xs space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-200 mb-1">Generating</h3>
                    <p className="text-sm text-primary/80 animate-pulse">This may take a while depending on hardware...</p>
                  </div>
                </div>
              )}

              {generateMutation.error && (
                <div className="text-center text-destructive space-y-3">
                  <AlertCircle className="w-12 h-12 mx-auto" />
                  <h3 className="font-bold text-lg">Process Failed</h3>
                  <p className="text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 break-words text-left max-w-sm">
                    {generateMutation.error.message || "Unknown error occurred"}
                  </p>
                </div>
              )}

              {generateMutation.data && !generateMutation.isPending && (
                <div className="text-center space-y-6 w-full">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-100 mb-2">Generation Complete</h3>
                    <p className="text-muted-foreground font-serif">{generateMutation.data.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-secondary/50 p-4 rounded-xl border border-white/5">
                      <div className="text-2xl font-bold text-emerald-400">{generateMutation.data.successCount}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Success</div>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-xl border border-white/5">
                      <div className="text-2xl font-bold text-red-400">{generateMutation.data.errorCount}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Failed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
