import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const PendingLeadsHeader = ({ isRefreshing, onRefresh }) => {
	const { t } = useTranslation();

	return (
		<div className="min-w-0">
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
					{t("pendingLeads.title")}
				</h1>
				<button
					type="button"
					onClick={onRefresh}
					disabled={isRefreshing}
					className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted shadow-sm transition hover:bg-background hover:text-text disabled:opacity-60"
					aria-label={t("pendingLeads.refresh")}
				>
					<RefreshCw
						className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
						aria-hidden="true"
					/>
					{t("pendingLeads.refresh")}
				</button>
			</div>
			<p className="mt-1.5 max-w-xl text-muted">
				{t("pendingLeads.subtitle")}
			</p>
		</div>
	);
};

export default PendingLeadsHeader;
