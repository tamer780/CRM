import { useTranslation } from "react-i18next";
import RateBar from "../dashboard/RateBar";

const COUNT_GROUPS = [
	{
		titleKey: "pipeline",
		items: [
			{ key: "scheduled", labelKey: "scheduled" },
			{ key: "visit", labelKey: "visit" },
			{ key: "reserved", labelKey: "reserved" },
		],
	},
	{
		titleKey: "outcomes",
		items: [
			{ key: "bought", labelKey: "bought" },
			{ key: "completed", labelKey: "completed" },
			{ key: "canceled", labelKey: "canceled" },
			{ key: "didnt_come", labelKey: "didntCome" },
		],
	},
];

const RATE_ITEMS = [
	{ key: "show_rate", labelKey: "showRate" },
	{ key: "visit_rate", labelKey: "visitRate" },
	{ key: "reservation_rate", labelKey: "reservationRate" },
	{ key: "purchase_rate", labelKey: "purchaseRate" },
];

const TeamKpiMeetingStats = ({ meetings }) => {
	const { t } = useTranslation();
	const data = meetings ?? {};

	return (
		<div className="space-y-6">
			{COUNT_GROUPS.map((group) => (
				<div key={group.titleKey}>
					<h3 className="text-sm font-semibold text-text">
						{t(`kpi.teams.meetings.${group.titleKey}`)}
					</h3>
					<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
						{group.items.map((item) => (
							<div
								key={item.key}
								className="rounded-xl border border-border bg-background/60 p-3"
							>
								<p className="text-xs text-muted">
									{t(`kpi.teams.meetings.${item.labelKey}`)}
								</p>
								<p className="mt-1 text-xl font-semibold text-text">
									{data[item.key] ?? 0}
								</p>
							</div>
						))}
					</div>
				</div>
			))}

			<div>
				<h3 className="text-sm font-semibold text-text">
					{t("kpi.teams.meetings.rates")}
				</h3>
				<div className="mt-3 space-y-3">
					{RATE_ITEMS.map((item) => (
						<div key={item.key}>
							<p className="mb-1 text-xs text-muted">
								{t(`kpi.teams.meetings.${item.labelKey}`)}
							</p>
							<RateBar value={data[item.key]} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default TeamKpiMeetingStats;
