import { useLanguage } from "../../hooks/i18n/useLanguage";

const LanguageSwitcher = ({ className = "", variant = "default" }) => {
	const { currentLanguage, changeLanguage } = useLanguage();
	const isAuth = variant === "auth";
	const isSidebar = variant === "sidebar";

	const activeClass = isAuth || isSidebar
		? "bg-gold text-primary"
		: "bg-primary text-white";
	const inactiveClass = isAuth || isSidebar
		? "text-white/70 hover:text-white"
		: "text-muted hover:text-text";
	const borderClass = isSidebar
		? "border-white/15"
		: isAuth
			? "border-white/20"
			: "border-border";

	return (
		<div
			className={`flex items-center gap-1 rounded-lg border p-0.5 text-xs font-medium ${borderClass} ${className}`}
			role="group"
			aria-label="Language"
		>
			<button
				type="button"
				onClick={() => changeLanguage("ar")}
				className={`rounded-md px-2.5 py-1 transition-colors ${
					currentLanguage === "ar" ? activeClass : inactiveClass
				}`}
			>
				AR
			</button>
			<button
				type="button"
				onClick={() => changeLanguage("en")}
				className={`rounded-md px-2.5 py-1 transition-colors ${
					currentLanguage === "en" ? activeClass : inactiveClass
				}`}
			>
				EN
			</button>
		</div>
	);
};

export default LanguageSwitcher;
