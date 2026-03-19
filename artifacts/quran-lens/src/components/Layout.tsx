import { Link, useLocation } from "wouter";
import { BookOpen, Layers, Sparkles, BookText, Settings2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAiStatus } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/", label: "Browse Verses", icon: BookOpen },
  { href: "/lenses", label: "Manage Lenses", icon: Layers },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/translations", label: "Translations", icon: BookText },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: aiStatus } = useGetAiStatus();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-sidebar z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3 text-primary">
            <BookOpen className="w-6 h-6" />
            <span className="font-serif text-xl font-semibold tracking-wide text-stone-100">
              Quran <span className="text-primary">Lens</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-stone-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "opacity-70")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider px-1">
              <span>AI Engine</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            
            <div className="bg-card border border-border rounded-lg p-3 shadow-inner">
              {aiStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-300">Local Ollama</span>
                    <span className="relative flex h-2.5 w-2.5">
                      {aiStatus.ollamaAvailable ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500/50"></span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate" title={aiStatus.defaultModel}>
                    {aiStatus.defaultModel || 'No model loaded'}
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-secondary rounded w-3/4"></div>
                    <div className="h-2 bg-secondary rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-scholarly.png)`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 100%)'
             }} 
        />
        <div className="relative z-10 p-8 max-w-6xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
