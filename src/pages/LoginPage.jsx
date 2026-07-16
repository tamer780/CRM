import { useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import AuthLogo from "../components/auth/AuthLogo";
import Spinner from "../components/auth/Spinner";
import { getLoginErrorMessage, useLogin } from "../hooks/auth/useLogin";
import {
  clearRememberedEmail,
  getRememberedEmail,
  setRememberedEmail,
} from "../utils/token/tokenStorage";
import {
  validateEmail,
  validatePassword,
} from "../utils/validation/validation";
import LanguageSwitcher from "../components/layout/LanguageSwitcher";

const LoginPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const registered = location.state?.registered;
  const rememberedEmail = getRememberedEmail();
  const loginMutation = useLogin();

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const isPending = loginMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    setApiError("");

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const errors = {};

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    if (emailError || passwordError) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          if (rememberMe) {
            setRememberedEmail(email);
          } else {
            clearRememberedEmail();
          }
        },
        onError: (error) => {
          setApiError(getLoginErrorMessage(error));
        },
      },
    );
  };

  return ( 
    <AuthLayout>
      <AuthLogo />

      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {t("auth.login.title")}
        </h1>
        <p className="mt-2 text-sm text-white/70">{t("auth.login.subtitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        aria-busy={isPending}
        noValidate
      >
        {registered && (
          <div
            className="rounded-lg border border-emerald-400/40 bg-emerald-400/20 p-3 text-sm text-emerald-200"
            role="status"
          >
            {t("auth.login.registeredSuccess")}
          </div>
        )}

        {apiError && (
          <div
            className="rounded-lg border border-red-500/40 bg-red-500/20 p-3 text-sm text-red-200"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <AuthInput
          id="email"
          label={t("auth.login.emailLabel")}
          type="email"
          icon={Mail}
          placeholder={t("auth.login.emailPlaceholder")}
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          disabled={isPending}
          error={fieldErrors.email}
        />

        <AuthInput
          id="password"
          label={t("auth.login.passwordLabel")}
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder={t("auth.login.passwordPlaceholder")}
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: "" }));
            }
          }}
          disabled={isPending}
          error={fieldErrors.password}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={isPending}
              aria-label={
                showPassword
                  ? t("auth.login.hidePassword")
                  : t("auth.login.showPassword")
              }
              className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={isPending}
              className="size-4 rounded border-white/30 accent-gold focus:ring-2 focus:ring-gold"
            />
            <span className="text-sm text-white/70">
              {t("auth.login.rememberMe")}
            </span>
          </label>
          <a
            href="#"
            className="text-sm text-light-gold transition-colors hover:text-gold hover:underline"
            onClick={(event) => event.preventDefault()}
          >
            {t("auth.login.forgotPassword")}
          </a>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="auth-button-primary flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold cursor-pointer"
        >
          {isPending ? (
            <>
              <Spinner />
              <span>{t("auth.login.signingIn")}</span>
            </>
          ) : (
            <>
              <span>{t("auth.login.signIn")}</span>
              <ArrowRight
                className="size-[18px] rtl:rotate-180"
                aria-hidden="true"
              />
            </>
          )}
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30 rtl:bg-gradient-to-l" />

          <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold/60">
            {t("common.or")}
          </span>

          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30 rtl:bg-gradient-to-r" />
        </div>

        <p className="text-center text-sm text-white/70">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-gold transition-colors hover:underline"
          >
            {t("auth.login.register")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
