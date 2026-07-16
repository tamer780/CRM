import backgroundImage from "../../assets/Bachground.jpeg";
import { useLanguage } from "../../hooks/i18n/useLanguage";

const AuthLayout = ({ children }) => {
	const { isRtl } = useLanguage();

	return (
		<div
			className={`relative flex min-h-screen items-center px-4 ${
				isRtl
					? "justify-start ps-6 sm:ps-12 lg:ps-20"
					: "justify-end pe-6 sm:pe-12 lg:pe-20"
			}`}
		>
			<div
				className="fixed inset-0 bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: `url(${backgroundImage})` }}
				aria-hidden="true"
			/>
			<div
				className={`fixed inset-0 ${
					isRtl
						? "bg-gradient-to-l from-black/20 via-black/40 to-primary/80"
						: "bg-gradient-to-r from-black/20 via-black/40 to-primary/80"
				}`}
				aria-hidden="true"
			/>
			<div className="auth-card relative z-10 w-full max-w-lg animate-card-in rounded-2xl p-6 sm:p-10">
				{children}
			</div>
		</div>
	);
};

export default AuthLayout;
