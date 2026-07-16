import { useTranslation } from "react-i18next";

const DateRangePicker = ({ dateFrom, dateTo, onChangeFrom, onChangeTo }) => {
	const { t } = useTranslation();

	return (
		<div className="col-span-full">
			<span className="mb-1.5 block text-xs font-medium text-muted">
				{t("leads.filters.createdRange")}
			</span>
			<div className="flex flex-wrap items-center gap-2">
				<label className="min-w-[8rem] flex-1">
					<span className="sr-only">{t("leads.columns.created")} from</span>
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => onChangeFrom(e.target.value)}
						className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
					/>
				</label>
				<span className="text-sm text-muted" aria-hidden="true">
					—
				</span>
				<label className="min-w-[8rem] flex-1">
					<span className="sr-only">{t("leads.columns.created")} to</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => onChangeTo(e.target.value)}
						className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
					/>
				</label>
			</div>
		</div>
	);
};

export default DateRangePicker;
