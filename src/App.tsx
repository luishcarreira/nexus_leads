import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Clientes from "./pages/Clientes";
import NotFound from "./pages/NotFound";
import Pipeline from "./pages/Pipeline";
import RelatorioMotivosPerda from "./pages/RelatorioMotivosPerda";

const queryClient = new QueryClient();

const App = () => {
  // Captura parâmetros da URL quando a aplicação é carregada
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    ["usrcod", "empcod", "filcod"].forEach((key) => {
      const value = urlParams.get(key);
      if (value) {
        localStorage.setItem(key, value);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="nexus-leads-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/leads"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pipeline"
                    element={
                      <ProtectedRoute>
                        <Pipeline />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clientes"
                    element={
                      <ProtectedRoute>
                        <Clientes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/relatorios/motivos-perda"
                    element={
                      <ProtectedRoute>
                        <RelatorioMotivosPerda />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <div className="flex-1 space-y-8 p-8">
                          <div>
                            <h1 className="text-3xl font-bold">
                              Configurações
                            </h1>
                            <p className="text-muted-foreground">
                              Página de configurações em desenvolvimento
                            </p>
                          </div>
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
