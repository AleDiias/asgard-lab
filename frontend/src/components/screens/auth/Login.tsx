import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import asgardBg from "@/assets/asgard-bg.jpg";
import asgardLogo from "@/assets/logo/asgard-logo.png";
import { Button, Input, Label } from "@/components/ui";

const inputIconClass = "h-4 w-4 shrink-0 text-muted-foreground";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginUIProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function Login({
  onSubmit,
  isLoading = false,
  error = null,
}: LoginUIProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation("auth");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <img
        src={asgardBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-background/60" />

      {/* Floating orbs */}
      <div
        className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, hsla(170, 60%, 40%, 0.4), transparent 70%)",
          animation: "aurora 8s ease-in-out infinite",
        }}
      />

      <div
        className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsla(38, 80%, 55%, 0.4), transparent 70%)",
          animation: "aurora 10s ease-in-out infinite 2s",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative z-10 mx-4 w-full max-w-md rounded-2xl p-8 sm:p-10"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <img src={asgardLogo} alt="Asgard LAB" className="h-24 w-24" />
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("login.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("login.subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-[3px]"
          >
            <Label htmlFor="login-email" className="text-muted-foreground">
              {t("login.emailLabel")}
            </Label>
            <div className="glass-input flex h-11 items-center overflow-hidden rounded-[7px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
              <span className="flex shrink-0 items-center pl-3 text-muted-foreground" aria-hidden>
                <Mail className={inputIconClass} />
              </span>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                className="h-full flex-1 border-0 bg-transparent px-3 py-3 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="email"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-[3px]"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-muted-foreground">
                {t("login.passwordLabel")}
              </Label>
              <Link
                to="/forgot"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>
            <div className="glass-input flex h-11 items-center overflow-hidden rounded-[7px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
              <span className="flex shrink-0 items-center pl-3 text-muted-foreground" aria-hidden>
                <Lock className={inputIconClass} />
              </span>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="h-full flex-1 border-0 bg-transparent px-3 py-3 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 rounded p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </motion.div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="border-0 pt-0"
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="glass-button-primary w-full border-0 px-6 py-3 text-sm font-semibold tracking-wide ring-0 ring-offset-0"
            >
              {isLoading ? t("login.submitting") : t("login.submit")}
            </Button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          {t("login.copyright")}
        </motion.p>
      </motion.div>
    </div>
  );
}

Login.displayName = "Login";
