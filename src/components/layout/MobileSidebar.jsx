import { LogOut, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoLight from "../../assets/logo-light.png";
import { useLogout } from "../../hooks/auth/useLogout";
import LanguageSwitcher from "./LanguageSwitcher";
import { navGroups } from "./navConfig";
import SidebarItem from "./SidebarItem";

const MobileSidebar = ({ open, onClose }) => {
	const { t } = useTranslation();
	const logoutMutation = useLogout();

	return (
		<>
			<div
				className={[
					"fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
					open ? "opacity-100" : "pointer-events-none opacity-0",
				].join(" ")}
				onClick={onClose}
				aria-hidden="true"
			/>

			<aside
				className={[
					"fixed inset-y-0 start-0 z-50 flex h-screen w-72 flex-col bg-primary text-white shadow-xl transition-transform duration-300 lg:hidden",
					open
						? "translate-x-0"
						: "ltr:-translate-x-full rtl:translate-x-full",
				].join(" ")}
				aria-hidden={!open}
			>
				<div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
					<img
						src={logoLight}
						alt={t("common.appName")}
						className="h-9 w-auto"
					/>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-white/70 transition-colors hover:bg-secondary hover:text-white"
						aria-label={t("nav.closeMenu")}
					>
						<X className="size-5" />
					</button>
				</div>

				<nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
					{navGroups.map((group) => (
						<div key={group.id} className="space-y-1">
							{group.labelKey && (
								<p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
									{t(group.labelKey)}
								</p>
							)}
							{group.items.map((item) => (
								<SidebarItem
									key={item.path}
									item={item}
									collapsed={false}
									onNavigate={onClose}
								/>
							))}
						</div>
					))}
				</nav>

				<div className="mt-auto flex shrink-0 items-center gap-2 border-t border-white/10 p-3">
					<LanguageSwitcher
						variant="sidebar"
						className="flex-1 justify-center"
					/>
					<button
						type="button"
						onClick={() => logoutMutation.mutate()}
						disabled={logoutMutation.isPending}
						className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-2.5 py-1.5 text-sm font-medium text-white/75 transition-colors hover:bg-secondary hover:text-white disabled:opacity-60"
						aria-label={t("common.logout")}
					>
						<LogOut className="size-4 shrink-0" aria-hidden="true" />
						<span className="truncate">
							{logoutMutation.isPending
								? t("common.loading")
								: t("common.logout")}
						</span>
					</button>
				</div>
			</aside>
		</>
	);
};

export default MobileSidebar;
