import { useTranslation } from "react-i18next";
import DateRangePicker from "./DateRangePicker";
import FilterDropdown from "./FilterDropdown";
import FilterMultiSelect from "./FilterMultiSelect";

const FilterPopover = ({
	draft,
	onDraftChange,
	statusOpts,
	sourceOpts,
	projectOpts,
	campaignOpts,
	userOpts,
	onApply,
	onReset,
	popoverRef,
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onDraftChange({ ...draft, [key]: value });

	return (
		<div
			ref={popoverRef}
			role="dialog"
			aria-label={t("leads.filters.button")}
			className="animate-popover-in absolute end-0 top-[calc(100%+0.5rem)] z-30 w-[min(calc(100vw-2rem),560px)] overflow-visible rounded-2xl border border-border bg-surface shadow-xl"
		>
			<div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
				<FilterMultiSelect
					label={t("leads.columns.status")}
					value={draft.status}
					onChange={(v) => {
						let next =
							Array.isArray(v) && v.length > 0 ? [...v].map(String) : ["default"];
						const hadAll = (draft.status ?? []).map(String).includes("all_status");
						const hasAll = next.includes("all_status");
						if (hasAll && !hadAll) {
							next = ["all_status"];
						} else if (hasAll && next.length > 1) {
							next = next.filter((s) => s !== "all_status");
						}
						set("status", next.length > 0 ? next : ["default"]);
					}}
					options={statusOpts}
					allLabel={t("leads.status.default")}
					clearValue={["default"]}
					placeholder={t("leads.columns.status")}
					selectedCountLabel={(count) =>
						t("leads.filters.statusSelected", { count })
					}
				/>
				<FilterDropdown
					label={t("leads.form.source")}
					value={draft.source}
					onChange={(v) => set("source", v)}
					options={sourceOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.form.source")}
				/>
				<FilterDropdown
					label={t("leads.form.project")}
					value={draft.projectId}
					onChange={(v) => set("projectId", v)}
					options={projectOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.form.project")}
				/>
				<FilterDropdown
					label={t("leads.form.campaign")}
					value={draft.campaignId}
					onChange={(v) => set("campaignId", v)}
					options={campaignOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.form.campaign")}
				/>
				<FilterDropdown
					label={t("leads.columns.assignedTo")}
					value={draft.assignedTo}
					onChange={(v) => set("assignedTo", v)}
					options={userOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.columns.assignedTo")}
					className="sm:col-span-2"
				/>
				<DateRangePicker
					dateFrom={draft.dateFrom}
					dateTo={draft.dateTo}
					onChangeFrom={(v) => set("dateFrom", v)}
					onChangeTo={(v) => set("dateTo", v)}
				/>
			</div>

			<div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
				<button
					type="button"
					onClick={onReset}
					className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-background hover:text-text"
				>
					{t("leads.filters.reset")}
				</button>
				<button
					type="button"
					onClick={onApply}
					className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:brightness-110"
				>
					{t("leads.filters.apply")}
				</button>
			</div>
		</div>
	);
};

export default FilterPopover;
