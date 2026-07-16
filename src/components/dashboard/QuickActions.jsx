import {
	CalendarClock,
	ClipboardList,
	PlusCircle,
	UserPlus,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const managerActions = [
	{
		key: "reviewPending",
		to: "/pending-leads?status=pending",
		icon: ClipboardList,
	},
	{
		key: "openDueItems",
		to: "/scheduled-actions?status=pending",
		icon: CalendarClock,
	},
	{
		key: "assignLeads",
		to: "/leads",
		icon: Users,
	},
	{
		key: "addLead",
		to: "/leads?create=1",
		icon: UserPlus,
	},
];

function salesActions(userId) {
	const assigned =
		userId != null ? `?status=pending&assigned=${userId}` : "?status=pending";
	return [
		{
			key: "myScheduledActions",
			to: `/scheduled-actions${assigned}`,
			icon: CalendarClock,
		},
		{
			key: "myLeads",
			to: "/leads",
			icon: Users,
		},
		{
			key: "addLead",
			to: "/leads?create=1",
			icon: UserPlus,
		},
		{
			key: "scheduleAction",
			to: "/scheduled-actions?create=1",
			icon: PlusCircle,
		},
	];
}

const QuickActions = ({ variant = "manager", userId }) => {
	const { t } = useTranslation();
	const actions =
		variant === "sales" ? salesActions(userId) : managerActions;

	return (
		<section className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
			<h2 className="text-lg font-semibold tracking-tight text-text">
				{t("dashboard.quickActions.title")}
			</h2>
			<p className="mt-1 text-sm text-muted">
				{t(
					variant === "sales"
						? "dashboard.quickActions.subtitleSales"
						: "dashboard.quickActions.subtitle",
				)}
			</p>

			<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
				{actions.map((action) => {
					const Icon = action.icon;
					return (
						<Link
							key={action.key}
							to={action.to}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md"
						>
							<Icon className="size-4" aria-hidden="true" />
							{t(`dashboard.quickActions.${action.key}`)}
						</Link>
					);
				})}
			</div>
		</section>
	);
};

export default QuickActions;
