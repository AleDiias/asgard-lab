import { Navigate, Outlet } from "react-router-dom";

export interface ProtectedRouteProps {
  allowedRoles?: Array<"admin" | "supervisor" | "agent">;
}

// TODO: Integrar com contexto de autenticação quando estiver disponível em /contexts
export const ProtectedRoute = (_props: ProtectedRouteProps) => {
  // Placeholder simples até termos contexto de auth:
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

