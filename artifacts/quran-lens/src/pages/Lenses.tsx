import { useState, useEffect } from "react";
import { useGetLenses, useGetLensRules, useSaveLensRules, LensRules } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Layers, Plus, Save, Trash2, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Lenses() {
  const { data: lenses, refetch: refetchLenses } = useGetLenses();
  const [selectedLensName, setSelectedLensName] = useState<string | null>(null);
  
  const { data: rulesData, isLoading: rulesLoading } = useGetLensRules(selectedLensName || "", {
    query: { enabled: !!selectedLensName }
  });

  const saveMutation = useSaveLensRules();

  // Form State
  const [formData, setFormData] = useState<LensRules>({
    name: "", description: "", rules: "", glossary: [], updatedAt: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (rulesData && !isCreating) {
      setFormData(rulesData);
    }
  }, [rulesData, isCreating]);

  const handleCreateNew = () => {
    setSelectedLensName(null);
    setIsCreating(true);
    setFormData({
      name: "new_lens",
      description: "",
      rules: "System prompt instructions here...",
      glossary: [],
      updatedAt: new Date().toISOString()
    });
  };

  const handleSelectLens = (name: string) => {
    setIsCreating(false);
    setSelectedLensName(name);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    try {
      await saveMutation.mutateAsync({
        lensName: formData.name,
        data: {
          description: formData.description,
          rules: formData.rules,
          glossary: formData.glossary
        }
      });
      setIsCreating(false);
      setSelectedLensName(formData.name);
      refetchLenses();
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const addGlossaryEntry = () => {
    setFormData(prev => ({
      ...prev,
      glossary: [...prev.glossary, { term: "", translation: "", notes: "" }]
    }));
  };

  const updateGlossary = (index: number, field: string, value: string) => {
    const newGlossary = [...formData.glossary];
    newGlossary[index] = { ...newGlossary[index], [field]: value };
    setFormData(prev => ({ ...prev, glossary: newGlossary }));
  };

  const removeGlossaryEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      glossary: prev.glossary.filter((_, i) => i !== index)
    }));
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 pb-24 h-[calc(100vh-4rem)]">
        
        {/* Left Column: Lens List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-100 flex items-center gap-2 font-serif">
              <Layers className="w-6 h-6 text-primary" />
              Your Lenses
            </h1>
            <button 
              onClick={handleCreateNew}
              className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
              title="Create New Lens"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {lenses?.map(lens => (
              <button
                key={lens.name}
                onClick={() => handleSelectLens(lens.name)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200 group",
                  selectedLensName === lens.name && !isCreating
                    ? "bg-card border-primary/50 shadow-md shadow-primary/5"
                    : "bg-secondary/50 border-border hover:border-stone-600 hover:bg-secondary"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn(
                    "font-medium", 
                    selectedLensName === lens.name && !isCreating ? "text-primary" : "text-stone-200"
                  )}>
                    {lens.name}
                  </h3>
                  <span className="text-xs bg-black/30 px-2 py-1 rounded text-muted-foreground border border-white/5">
                    {lens.translationCount} translated
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 font-serif">
                  {lens.description || "No description provided."}
                </p>
              </button>
            ))}
            {lenses?.length === 0 && (
              <div className="text-center p-6 bg-secondary/30 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground text-sm">No lenses found. Create one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="flex-1 bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {(!selectedLensName && !isCreating) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
              <Edit3 className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-serif text-stone-400 mb-2">Select a framework to edit</h2>
              <p className="max-w-md">Lenses define the rules, terminology, and scholarly approach the AI uses when translating the text.</p>
            </div>
          ) : rulesLoading && !isCreating ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-6 border-b border-border bg-black/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  {isCreating ? (
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="bg-transparent border-b border-primary/50 text-2xl font-serif font-bold text-stone-100 focus:outline-none focus:border-primary placeholder:text-stone-600 px-1 py-1"
                      placeholder="lens_name"
                    />
                  ) : (
                    <h2 className="text-2xl font-serif font-bold text-stone-100 px-1 py-1">{formData.name}</h2>
                  )}
                  {!isCreating && formData.updatedAt && (
                    <span className="text-xs text-muted-foreground">
                      Last updated: {new Date(formData.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || !formData.name}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? "Saving..." : "Save Lens"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-secondary border border-border rounded-xl p-4 text-stone-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all min-h-[100px] font-serif resize-y"
                    placeholder="Describe the interpretive framework..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex justify-between">
                    <span>System Rules (Markdown)</span>
                  </label>
                  <div className="relative group">
                    <textarea 
                      value={formData.rules}
                      onChange={e => setFormData({...formData, rules: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-border rounded-xl p-5 text-stone-300 font-mono text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all min-h-[300px] resize-y shadow-inner"
                      placeholder="You are an expert in..."
                      spellCheck={false}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">These instructions are sent to the AI alongside the glossary for every translation.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Terminology Glossary</label>
                      <p className="text-xs text-muted-foreground mt-1">Force the AI to use specific translations for specific Arabic roots/words.</p>
                    </div>
                    <button 
                      onClick={addGlossaryEntry}
                      className="flex items-center gap-1.5 text-xs font-medium bg-secondary text-stone-200 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Term
                    </button>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {formData.glossary.map((entry, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-3 items-start bg-secondary/30 p-3 rounded-xl border border-white/5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            <input 
                              type="text" 
                              value={entry.term}
                              onChange={e => updateGlossary(idx, 'term', e.target.value)}
                              placeholder="Arabic Term / Root"
                              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-primary w-full font-arabic"
                              dir="rtl"
                            />
                            <input 
                              type="text" 
                              value={entry.translation}
                              onChange={e => updateGlossary(idx, 'translation', e.target.value)}
                              placeholder="Required Translation"
                              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-primary w-full font-serif"
                            />
                            <input 
                              type="text" 
                              value={entry.notes || ""}
                              onChange={e => updateGlossary(idx, 'notes', e.target.value)}
                              placeholder="Context notes (optional)"
                              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-stone-400 focus:outline-none focus:border-primary w-full md:col-span-2 italic"
                            />
                          </div>
                          <button 
                            onClick={() => removeGlossaryEntry(idx)}
                            className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {formData.glossary.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground bg-black/20 rounded-xl border border-dashed border-white/10">
                        No glossary terms defined.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
