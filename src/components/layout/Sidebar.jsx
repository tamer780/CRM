import { useMemo } from "react";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo-light.png";
import { canAccessPath } from "../../features/users/utils/permissions";
import { useAuthMe } from "../../hooks/auth/useAuthMe";
import { useLogout } from "../../hooks/auth/useLogout";
import LanguageSwitcher from "./LanguageSwitcher";
import { navGroups } from "./navConfig";
import SidebarItem from "./SidebarItem";

const Sidebar = ({ collapsed, onToggleCollapse }) => {
	const { t, i18n } = useTranslation();
	const logoutMutation = useLogout();
	const { data: user, isLoading: isAuthLoading } = useAuthMe();
	const isRtl = i18n.dir() === "rtl";
	const CollapseIcon = collapsed
		? isRtl
			? ChevronsLeft
			: ChevronsRight
		: isRtl
			? ChevronsRight
			: ChevronsLeft;

	const visibleGroups = useMemo(() => {
		if (isAuthLoading || !user) return [];
		return navGroups
			.map((group) => ({
				...group,
				items: group.items.filter((item) => canAccessPath(user, item.path)),
			}))
			.filter((group) => group.items.length > 0);
	}, [user, isAuthLoading]);

	return (
		<aside
			className={[
				"fixed inset-y-0 start-0 z-40 hidden h-screen flex-col bg-primary text-white transition-[width] duration-300 lg:flex",
				collapsed ? "w-[72px]" : "w-64",
			].join(" ")}
		>
			<div
				className={[
					"flex h-16 shrink-0 items-center border-b border-white/10 px-4",
					collapsed ? "justify-center" : "justify-between gap-2",
				].join(" ")}
			>
				{!collapsed && (
					<div className="flex min-w-0 items-center gap-2">
						<img
							src={logo}
							alt={t("common.appName")}
							className="h-10 max-h-10 w-auto max-w-[56px] shrink-0 object-contain"
						/>
						<span className="truncate text-sm font-semibold tracking-wide text-white">
							Amair CRM
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					className="rounded-lg p-2 text-white/70 transition-colors hover:bg-secondary hover:text-white"
					aria-label={
						collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")
					}
				>
					<CollapseIcon className="size-5" />
				</button>
			</div>

			<nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
				{visibleGroups.map((group) => (
					<div key={group.id} className="space-y-1">
						{group.labelKey && !collapsed && (
							<p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
								{t(group.labelKey)}
							</p>
						)}
						{group.labelKey && collapsed && (
							<div
								className="mx-auto my-2 h-px w-6 bg-white/15"
								aria-hidden="true"
							/>
						)}
						{group.items.map((item) => (
							<SidebarItem
								key={item.path}
								item={item}
								collapsed={collapsed}
							/>
						))}
					</div>
				))}
			</nav>

			<div
				className={[
					"mt-auto flex shrink-0 items-center gap-2 border-t border-white/10 p-3",
					collapsed ? "flex-col" : "",
				].join(" ")}
			>
				<LanguageSwitcher
					variant="sidebar"
					className={collapsed ? "flex-col" : "flex-1 justify-center"}
				/>
				<button
					type="button"
					onClick={() => logoutMutation.mutate()}
					disabled={logoutMutation.isPending}
					title={t("common.logout")}
					className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-2.5 py-1.5 text-sm font-medium text-white/75 transition-colors hover:bg-secondary hover:text-white disabled:opacity-60"
					aria-label={t("common.logout")}
				>
					<LogOut className="size-4 shrink-0" aria-hidden="true" />
					{!collapsed && (
						<span className="truncate">
							{logoutMutation.isPending
								? t("common.loading")
								: t("common.logout")}
						</span>
					)}
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
