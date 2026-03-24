import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import asgardBg from "@/assets/asgard-bg.jpg";
import asgardLogo from "@/assets/logo/asgard-logo.png";
import { Button, Input, Label } from "@/components/ui";
import { validateResetPassword } from "./config";
import { getErrorMessage } from "@/utils/feedback";

const inputIconClass = "h-4 w-4 shrink-0 text-muted-foreground";

export interface ResetPasswordUIProps {
  /** Quando omitido (ex.: Storybook), o fluxo usa simulação local. */
  onSubmit?: (data: { token: string; newPassword: string }) => Promise<void>;
}

export function ResetPassword({ onSubmit: onSubmitProp }: ResetPasswordUIProps = {}) {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateResetPassword(
      token,
      password,
      confirmPassword,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (onSubmitProp) {
        await onSubmitProp({
          token: token.trim(),
          newPassword: password,
        });
        setSuccess(true);
      } else {
        await new Promise((r) => setTimeout(r, 2000));
        setSuccess(true);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível redefinir a senha."));
    } finally {
      setLoading(false);
    }
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

      {/* Card */}
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
              {t("reset.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("reset.subtitle")}
            </p>
          </div>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {t("reset.successMessage")}
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-0 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:bg-white/20"
            >
              <Link to="/" className="inline-flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("reset.backToLogin")}
              </Link>
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-[3px]"
            >
              <Label htmlFor="reset-token" className="text-muted-foreground">
                {t("reset.tokenLabel")}
              </Label>
              <div className="glass-input flex h-11 items-center overflow-hidden rounded-[7px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
                <span className="flex shrink-0 items-center pl-3 text-muted-foreground" aria-hidden>
                  <KeyRound className={inputIconClass} />
                </span>
                <Input
                  id="reset-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t("reset.tokenPlaceholder")}
                  className="h-full flex-1 border-0 bg-transparent px-3 py-3 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="one-time-code"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="space-y-[3px]"
            >
              <Label htmlFor="reset-password" className="text-muted-foreground">
                {t("reset.passwordLabel")}
              </Label>
              <div className="glass-input flex h-11 items-center overflow-hidden rounded-[7px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
                <span className="flex shrink-0 items-center pl-3 text-muted-foreground" aria-hidden>
                  <Lock className={inputIconClass} />
                </span>
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("reset.passwordPlaceholder")}
                  className="h-full flex-1 border-0 bg-transparent px-3 py-3 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="new-password"
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

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-[3px]"
            >
              <Label htmlFor="reset-confirm" className="text-muted-foreground">
                {t("reset.confirmLabel")}
              </Label>
              <div className="glass-input flex h-11 items-center overflow-hidden rounded-[7px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
                <span className="flex shrink-0 items-center pl-3 text-muted-foreground" aria-hidden>
                  <Lock className={inputIconClass} />
                </span>
                <Input
                  id="reset-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("reset.confirmPlaceholder")}
                  className="h-full flex-1 border-0 bg-transparent px-3 py-3 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="shrink-0 rounded p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={showConfirm ? "Ocultar senha" : "Exibir senha"}
                  tabIndex={0}
                >
                  {showConfirm ? (
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
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col gap-3 border-0 pt-0"
            >
              <Button
                type="submit"
                disabled={loading}
                className="glass-button-primary w-full border-0 px-6 py-3 text-sm font-semibold tracking-wide ring-0 ring-offset-0"
              >
                {loading ? t("reset.submitting") : t("reset.submit")}
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                <Link to="/" className="inline-flex items-center justify-center gap-2 text-sm">
                  <ArrowLeft className="h-4 w-4" />
                  {t("reset.backToLogin")}
                </Link>
              </Button>
            </motion.div>
          </form>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          {t("reset.copyright")}
        </motion.p>
      </motion.div>
    </div>
  );
}

ResetPassword.displayName = "ResetPassword";
