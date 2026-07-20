import { useTranslation } from "react-i18next";
import { formatRate } from "./kpiFormatters";

const STAGES = [
	{ key: "total_assigned", rateKey: null, labelKey: "totalAssigned" },
	{ key: "contacted", rateKey: "contact_rate", labelKey: "contacted" },
	{ key: "qualified", rateKey: "qualification_rate", labelKey: "qualified" },
	{ key: "converted", rateKey: "conversion_rate", labelKey: "converted" },
];

const TeamKpiFunnelStrip = ({ leads }) => {
	const { t } = useTranslation();
	const data = leads ?? {};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{STAGES.map((stage, index) => (
					<div
						key={stage.key}
						className={[
							"relative rounded-xl border border-border bg-background/60 p-4",
							index < STAGES.length - 1
								? "after:absolute after:top-1/2 after:hidden after:h-px after:w-3 after:-translate-y-1/2 after:bg-border sm:after:block ltr:after:-right-1.5 rtl:after:-left-1.5"
								: "",
						].join(" ")}
					>
						<p className="text-xs font-medium uppercase tracking-wide text-muted">
							{t(`kpi.sales.${stage.labelKey}`)}
						</p>
						<p className="mt-1 text-2xl font-semibold text-text">
							{data[stage.key] ?? 0}
						</p>
						{stage.rateKey && (
							<p className="mt-1 text-xs text-muted">
								{formatRate(data[stage.rateKey])}
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default TeamKpiFunnelStrip;
