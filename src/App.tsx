
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FolderSetupScreen from "@/components/FolderSetupScreen";
import { useProtocolFolder } from "@/hooks/useProtocolFolder";

const queryClient = new QueryClient();

function AppContent() {
  const { isFirstLaunch, selectFolder, isLoading, error } = useProtocolFolder();

  // Пока проверяем хранилище — сплэш экран
  if (isFirstLaunch === null) {
    return (
      <div className="min-h-screen bg-background grid-bg flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl text-foreground">OBD Pro</div>
          <div className="text-xs text-muted-foreground mt-1">Загрузка...</div>
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  // Первый запуск — экран выбора папки
  if (isFirstLaunch) {
    return <FolderSetupScreen onSelect={selectFolder} isLoading={isLoading} error={error} />;
  }

  // Основное приложение
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;