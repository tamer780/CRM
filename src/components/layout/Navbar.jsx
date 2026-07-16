import { Menu, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthMe } from "../../hooks/auth/useAuthMe";

const Navbar = ({ onOpenMobileMenu }) => {
	const { t } = useTranslation();
	const { data: user, isLoading } = useAuthMe();

	const displayName =
		user?.name ??
		user?.email ??
		(isLoading ? t("common.loading") : t("common.user"));
	const role = user?.roles?.[0] ?? t("common.user");

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:px-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onOpenMobileMenu}
						className="rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-text lg:hidden"
						aria-label={t("nav.openMenu")}
					>
						<Menu className="size-5" />
					</button>
					<p className="hidden text-sm text-muted sm:block lg:hidden">
						{t("common.appName")}
					</p>
				</div>

				<div className="flex items-center gap-2 text-sm">
					<div className="flex size-8 items-center justify-center rounded-full bg-light-gold">
						<User className="size-4 text-gold" aria-hidden="true" />
					</div>
					<div className="hidden min-w-0 sm:block">
						<p className="truncate font-medium text-text">{displayName}</p>
						<p className="truncate text-xs text-muted">{role}</p>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
