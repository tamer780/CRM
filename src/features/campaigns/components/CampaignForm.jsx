import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../../leads/components/form/FormInput";
import {
	CAMPAIGN_PLATFORMS,
	CAMPAIGN_STATUSES,
} from "../utils/campaignConstants";
import { LEAD_SOURCES } from "../../../utils/leads/leadConstants";
import CampaignSelect from "./CampaignSelect";

const CampaignForm = ({
	mode = "create",
	values,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	projects = [],
	projectsLoading = false,
}) => {
	const { t } = useTranslation();

	const set = (key, value) => onChange({ ...values, [key]: value });

	const platformOptions = useMemo(
		() =>
			CAMPAIGN_PLATFORMS.map((p) => ({
				value: p,
				label: t(`campaigns.platforms.${p}`, {
					defaultValue: t(`leads.sources.${p}`, { defaultValue: p }),
				}),
			})),
		[t],
	);

	const sourceOptions = useMemo(
		() =>
			LEAD_SOURCES.map((s) => ({
				value: s,
				label: t(`leads.sources.${s}`),
			})),
		[t],
	);

	const statusOptions = useMemo(
		() =>
			CAMPAIGN_STATUSES.map((s) => ({
				value: s,
				label: t(`campaigns.status.${s}`),
			})),
		[t],
	);

	const projectOptions = useMemo(
		() =>
			projects.map((project) => ({
				value: project.id,
				label: project.name ?? project.title ?? `#${project.id}`,
			})),
		[projects],
	);

	const handleSubmit = (event) => {
		event.preventDefault();
		onSubmit(values);
	};

	return (
		<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
				{errors.api && (
					<p
						role="alert"
						className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
					>
						{errors.api}
					</p>
				)}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<FormInput
							label={t("campaigns.form.name")}
							required
							value={values.name}
							onChange={(e) => set("name", e.target.value)}
							error={errors.name}
							disabled={isSubmitting}
						/>
					</div>

					<CampaignSelect
						label={t("campaigns.form.platform")}
						required
						value={values.platform}
						onChange={(v) => set("platform", v)}
						options={platformOptions}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.platform}
						disabled={isSubmitting}
					/>

					<CampaignSelect
						label={t("campaigns.form.project")}
						value={values.project_id}
						onChange={(v) => set("project_id", v == null ? "" : String(v))}
						options={projectOptions}
						loading={projectsLoading}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.project_id}
						disabled={isSubmitting}
					/>

					<CampaignSelect
						label={t("campaigns.form.source")}
						value={values.source}
						onChange={(v) => set("source", v)}
						options={sourceOptions}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						disabled={isSubmitting}
					/>

					<CampaignSelect
						label={t("campaigns.form.status")}
						value={values.status}
						onChange={(v) => set("status", v)}
						options={statusOptions}
						placeholder={t("campaigns.status.draft")}
						clearable={false}
						disabled={isSubmitting}
					/>

					<FormInput
						label={t("campaigns.form.budget")}
						type="number"
						min="0"
						step="any"
						value={values.budget}
						onChange={(e) => set("budget", e.target.value)}
						error={errors.budget}
						disabled={isSubmitting}
					/>

					<FormInput
						label={t("campaigns.form.spent")}
						type="number"
						min="0"
						step="any"
						value={values.spent_amount}
						onChange={(e) => set("spent_amount", e.target.value)}
						error={errors.spent_amount}
						disabled={isSubmitting}
					/>

					<FormInput
						label={t("campaigns.form.revenue")}
						type="number"
						min="0"
						step="any"
						value={values.revenue}
						onChange={(e) => set("revenue", e.target.value)}
						error={errors.revenue}
						disabled={isSubmitting}
					/>

					<FormInput
						label={t("campaigns.form.startedAt")}
						type="date"
						value={values.started_at}
						onChange={(e) => set("started_at", e.target.value)}
						error={errors.started_at}
						disabled={isSubmitting}
					/>

					<FormInput
						label={t("campaigns.form.endedAt")}
						type="date"
						value={values.ended_at}
						onChange={(e) => set("ended_at", e.target.value)}
						error={errors.ended_at}
						disabled={isSubmitting}
					/>

					<div className="sm:col-span-2">
						<FormInput
							label={t("campaigns.form.externalReference")}
							value={values.external_reference}
							onChange={(e) => set("external_reference", e.target.value)}
							error={errors.external_reference}
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</div>

			<div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
				<button
					type="button"
					onClick={onCancel}
					disabled={isSubmitting}
					className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
				>
					{t("common.cancel")}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
				>
					{isSubmitting
						? t("common.loading")
						: mode === "edit"
							? t("campaigns.form.save")
							: t("campaigns.form.create")}
				</button>
			</div>
		</form>
	);
};

export default CampaignForm;
