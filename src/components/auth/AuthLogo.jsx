import logo from "../../assets/logo-light.png";

const AuthLogo = () => (
	<div className="mb-6 flex flex-col items-center">
		<img
			src={logo}
			alt="EH"
			className="h-auto w-20 sm:w-24"
		/>
		<p className="mt-3 text-xs font-medium tracking-[0.25em] text-gold sm:text-sm">
			EH
		</p>
	</div>
);

export default AuthLogo;
