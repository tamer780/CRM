import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import AuthLogo from "../components/auth/AuthLogo";
import Spinner from "../components/auth/Spinner";
import { getRegisterErrorMessage, useRegister } from "../hooks/auth/useRegister";
import {
	validateEmail,
	validateName,
	validatePassword,
	validatePasswordConfirmation,
} from "../utils/validation/validation";

const RegisterPage = () => {
	const { t } = useTranslation();
	const registerMutation = useRegister();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});
	const [apiError, setApiError] = useState("");

	const isPending = registerMutation.isPending;

	const handleSubmit = (event) => {
		event.preventDefault();
		setApiError("");

		const nameError = validateName(name);
		const emailError = validateEmail(email);
		const passwordError = validatePassword(password);
		const confirmError = validatePasswordConfirmation(
			password,
			passwordConfirmation,
		);
		const errors = {};

		if (nameError) errors.name = nameError;
		if (emailError) errors.email = emailError;
		if (passwordError) errors.password = passwordError;
		if (confirmError) errors.passwordConfirmation = confirmError;

		setFieldErrors(errors);
		if (nameError || emailError || passwordError || confirmError) return;

		registerMutation.mutate(
			{
				name,
				email,
				password,
				password_confirmation: passwordConfirmation,
			},
			{
				onError: (error) => {
					setApiError(getRegisterErrorMessage(error));
				},
			},
		);
	};

	return (
		<AuthLayout>
			<AuthLogo />

			<div className="mb-6 text-center">
				<h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					{t("auth.register.title")}
				</h1>
				<p className="mt-2 text-sm text-white/70">{t("auth.register.subtitle")}</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-5"
				aria-busy={isPending}
				noValidate
			>
				{apiError && (
					<div
						className="rounded-lg border border-red-500/40 bg-red-500/20 p-3 text-sm text-red-200"
						role="alert"
					>
						{apiError}
					</div>
				)}

				<AuthInput
					id="name"
					label={t("auth.register.nameLabel")}
					type="text"
					icon={User}
					placeholder={t("auth.register.namePlaceholder")}
					autoComplete="name"
					value={name}
					onChange={(event) => {
						setName(event.target.value);
						if (fieldErrors.name) {
							setFieldErrors((prev) => ({ ...prev, name: "" }));
						}
					}}
					disabled={isPending}
					error={fieldErrors.name}
				/>

				<AuthInput
					id="email"
					label={t("auth.register.emailLabel")}
					type="email"
					icon={Mail}
					placeholder={t("auth.register.emailPlaceholder")}
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
					label={t("auth.register.passwordLabel")}
					type={showPassword ? "text" : "password"}
					icon={Lock}
					placeholder={t("auth.register.passwordPlaceholder")}
					autoComplete="new-password"
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
									? t("auth.register.hidePassword")
									: t("auth.register.showPassword")
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

				<AuthInput
					id="password_confirmation"
					label={t("auth.register.confirmPasswordLabel")}
					type={showConfirmPassword ? "text" : "password"}
					icon={Lock}
					placeholder={t("auth.register.confirmPasswordPlaceholder")}
					autoComplete="new-password"
					value={passwordConfirmation}
					onChange={(event) => {
						setPasswordConfirmation(event.target.value);
						if (fieldErrors.passwordConfirmation) {
							setFieldErrors((prev) => ({
								...prev,
								passwordConfirmation: "",
							}));
						}
					}}
					disabled={isPending}
					error={fieldErrors.passwordConfirmation}
					suffix={
						<button
							type="button"
							onClick={() => setShowConfirmPassword((value) => !value)}
							disabled={isPending}
							aria-label={
								showConfirmPassword
									? t("auth.register.hidePassword")
									: t("auth.register.showPassword")
							}
							className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
						>
							{showConfirmPassword ? (
								<EyeOff className="size-[18px]" />
							) : (
								<Eye className="size-[18px]" />
							)}
						</button>
					}
				/>

				<button
					type="submit"
					disabled={isPending}
					className="auth-button-primary flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold"
				>
					{isPending ? (
						<>
							<Spinner />
							<span>{t("auth.register.creatingAccount")}</span>
						</>
					) : (
						<>
							<span>{t("auth.register.createAccount")}</span>
							<ArrowRight className="size-[18px] rtl:rotate-180" aria-hidden="true" />
						</>
					)}
				</button>

				<p className="text-center text-sm text-white/70">
					{t("auth.register.hasAccount")}{" "}
					<Link
						to="/login"
						className="font-medium text-light-gold transition-colors hover:text-gold hover:underline"
					>
						{t("auth.register.signIn")}
					</Link>
				</p>
			</form>
		</AuthLayout>
	);
};

export default RegisterPage;
