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
      <ThemeProvider defaultTheme="light" storageKey="nexus-leads-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                    <Layout sidebar={true}>
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/leads"
                  element={
                    <Layout sidebar={true}>
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <Layout sidebar={true}>
                      <ProtectedRoute>
                        <Users />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/pipeline"
                  element={
                    <Layout sidebar={true}>
                      <ProtectedRoute>
                        <Pipeline />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <Layout sidebar={false}>
                      <ProtectedRoute>
                        <Clientes />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/relatorios/motivos-perda"
                  element={
                    <Layout sidebar={true}>
                      <ProtectedRoute>
                        <RelatorioMotivosPerda />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Layout sidebar={true}>
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
                    </Layout>
                  }
                />

                {/* Catch-all route */}
                <Route
                  path="*"
                  element={
                    <Layout sidebar={true}>
                      <NotFound />
                    </Layout>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
