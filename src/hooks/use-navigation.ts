import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useNavigation = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string>("");

  useEffect(() => {
    // Determinar item ativo baseado na rota atual
    const path = location.pathname;

    if (path === "/") {
      setActiveItem("dashboard");
    } else if (path.startsWith("/leads")) {
      setActiveItem("leads");
    } else if (path.startsWith("/pipeline")) {
      setActiveItem("pipeline");
    } else if (path.startsWith("/clientes")) {
      setActiveItem("clientes");
    } else if (path.startsWith("/relatorios")) {
      setActiveItem("reports");
    } else if (path.startsWith("/users")) {
      setActiveItem("users");
    } else if (path.startsWith("/settings")) {
      setActiveItem("settings");
    } else {
      setActiveItem("");
    }
  }, [location.pathname]);

  const isActive = (itemId: string) => activeItem === itemId;

  return {
    activeItem,
    isActive,
  };
};
