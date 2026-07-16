import logoLight from "../../assets/logo-light.png";

const AuthLogo = () => (
	<div className="mb-6 flex flex-col items-center">
		<img
			src={logoLight}
			alt="Amair CRM"
			className="h-auto w-20 sm:w-24"
		/>
		<p className="mt-3 text-xs font-medium tracking-[0.25em] text-gold sm:text-sm">
			AMAIR CRM
		</p>
	</div>
);

export default AuthLogo;
