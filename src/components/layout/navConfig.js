import {
	Activity,
	BarChart3,
	FolderKanban,
	LayoutDashboard,
	Megaphone,
	Users,
	UsersRound,
	UserPlus,
	ScrollText,
	Gauge,
	Clock,
} from "lucide-react";

export const navGroups = [
	{
		id: "dashboard",
		labelKey: null,
		items: [
			{ path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
		],
	},
	{
		id: "sales",
		labelKey: "nav.groups.sales",
		items: [
			{ path: "/leads", labelKey: "nav.leads", icon: UserPlus },
			{ path: "/pending-leads", labelKey: "nav.pending", icon: Clock },
			{ path: "/clients", labelKey: "nav.clients", icon: Users },
			{
				path: "/scheduled-actions",
				labelKey: "nav.scheduledActions",
				icon: Activity,
			},
		],
	},
	{
		id: "marketing",
		labelKey: "nav.groups.marketing",
		items: [
			{ path: "/campaigns", labelKey: "nav.campaigns", icon: Megaphone },
			{ path: "/projects", labelKey: "nav.projects", icon: FolderKanban },
		],
	},
	{
		id: "management",
		labelKey: "nav.groups.management",
		items: [
			{ path: "/teams", labelKey: "nav.teams", icon: UsersRound },
			{ path: "/users", labelKey: "nav.users", icon: Users },
		],
	},
	{
		id: "analytics",
		labelKey: "nav.groups.analytics",
		items: [
			{ path: "/reports", labelKey: "nav.reports", icon: BarChart3 },
			{ path: "/kpi", labelKey: "nav.kpi", icon: Gauge },
		],
	},
	{
		id: "settings",
		labelKey: "nav.groups.settings",
		items: [
			{ path: "/audit-logs", labelKey: "nav.auditLogs", icon: ScrollText },
		],
	},
];

/** Flat list for lookups and coming-soon checks */
export const navItems = navGroups.flatMap((group) => group.items);

const implementedPaths = new Set(navItems.map((item) => item.path));

export const comingSoonPaths = navItems
	.filter((item) => !implementedPaths.has(item.path))
	.map((item) => item.path);

export function getNavLabelKey(pathname) {
	const item = navItems.find((entry) => entry.path === pathname);
	return item?.labelKey ?? "nav.dashboard";
}
