import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ReportsEmptyState = ({ filtered = false }) => {
	const { t } = useTranslation();

	return (
		<section className="rounded-2xl border border-border bg-surface shadow-sm">
			<div className="flex flex-col items-center justify-center px-6 py-16 text-center">
				<div className="relative mb-5">
					<div
						className="absolute inset-0 scale-150 rounded-full bg-light-gold/50 blur-xl"
						aria-hidden="true"
					/>
					<div className="relative flex size-16 items-center justify-center rounded-2xl bg-light-gold shadow-sm">
						<BarChart3 className="size-8 text-gold" aria-hidden="true" />
					</div>
				</div>
				<h3 className="text-lg font-semibold text-text">
					{filtered
						? t("reports.empty.filteredTitle")
						: t("reports.empty.title")}
				</h3>
				<p className="mt-1.5 max-w-sm text-sm text-muted">
					{filtered
						? t("reports.empty.filteredSubtitle")
						: t("reports.empty.subtitle")}
				</p>
			</div>
		</section>
	);
};

export default ReportsEmptyState;
