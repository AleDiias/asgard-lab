import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Login } from "@/components/screens/auth";
import type { LoginFormData } from "@/components/screens/auth";
import { loginFn } from "@/api/auth/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { validateLogin } from "@/components/screens/auth/config";
import { getErrorMessage, successMessages } from "@/utils/feedback";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (data: LoginFormData) => {
    setError(null);
    const validationError = validateLogin(data.email, data.password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginFn({ email: data.email, password: data.password });
      setAuth({ token: result.token, user: result.user });
      toast.success(successMessages.login);
      navigate("/app", { replace: true });
    } catch (err) {
      const message = getErrorMessage(err, "Erro ao fazer login.");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Login
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
