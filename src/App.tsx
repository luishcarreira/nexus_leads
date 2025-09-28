import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/hooks/use-auth";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, isLoading, processIdpRedirect } = useAuth();

  // Processar redirect do IdP na inicialização
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idpToken = urlParams.get("token");

    if (idpToken) {
      processIdpRedirect();
    }
  }, [processIdpRedirect]);

  // Tela de loading durante autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Autenticando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login ou redirecionar
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-6">
            Você precisa estar autenticado para acessar esta aplicação.
          </p>
          <button
            onClick={() => {
              // Redirecionar para o IdP ou página de login
              window.location.href = "/login"; // Ajustar conforme sua configuração
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
