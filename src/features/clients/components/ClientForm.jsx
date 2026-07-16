import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../../leads/components/FormInput";
import SearchableSelect from "../../leads/components/SearchableSelect";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { CLIENT_STATUSES } from "../utils/clientConstants";
import CampaignSelect from "../../campaigns/components/CampaignSelect";

const ClientForm = ({
	values,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	projects = [],
	campaigns = [],
	users = [],
	projectsLoading = false,
	campaignsLoading = false,
	usersLoading = false,
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onChange({ ...values, [key]: value });

	const statusOptions = useMemo(
		() =>
			CLIENT_STATUSES.map((s) => ({
				value: s,
				label: t(`clients.status.${s}`),
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

	const campaignOptions = useMemo(
		() =>
			campaigns.map((campaign) => ({
				value: campaign.id,
				label: campaign.name ?? `#${campaign.id}`,
			})),
		[campaigns],
	);

	const userOptions = useMemo(
		() =>
			users.map((user) => {
				const name = user.name ?? user.email ?? `#${user.id}`;
				return {
					value: user.id,
					label: name,
					searchText: [user.name, user.email].filter(Boolean).join(" "),
					avatarTone: getAvatarTone(name),
					initials: getInitials(name),
				};
			}),
		[users],
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
							label={t("clients.form.name")}
							required
							value={values.name}
							onChange={(e) => set("name", e.target.value)}
							error={errors.name}
							disabled={isSubmitting}
						/>
					</div>

					<FormInput
						label={t("clients.form.phone")}
						required
						value={values.phone}
						onChange={(e) => set("phone", e.target.value)}
						error={errors.phone}
						disabled={isSubmitting}
						dir="ltr"
					/>

					<FormInput
						label={t("clients.form.email")}
						type="email"
						value={values.email}
						onChange={(e) => set("email", e.target.value)}
						error={errors.email}
						disabled={isSubmitting}
						dir="ltr"
					/>

					<SearchableSelect
						label={t("clients.form.project")}
						value={values.project_id}
						onChange={(v) => set("project_id", v == null ? "" : String(v))}
						options={projectOptions}
						loading={projectsLoading}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.project_id}
						disabled={isSubmitting}
					/>

					<SearchableSelect
						label={t("clients.form.campaign")}
						value={values.campaign_id}
						onChange={(v) => set("campaign_id", v == null ? "" : String(v))}
						options={campaignOptions}
						loading={campaignsLoading}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.campaign_id}
						disabled={isSubmitting}
					/>

					<SearchableSelect
						label={t("clients.form.assignedTo")}
						value={values.assigned_to}
						onChange={(v) => set("assigned_to", v == null ? "" : String(v))}
						options={userOptions}
						loading={usersLoading}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.assigned_to}
						disabled={isSubmitting}
						renderOption={(option, { selected }) => (
							<span className="flex min-w-0 items-center gap-2">
								<span
									className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${option.avatarTone}`}
								>
									{option.initials}
								</span>
								<span
									className={`truncate ${selected ? "font-medium" : ""}`}
								>
									{option.label}
								</span>
							</span>
						)}
						renderValue={(option) =>
							option ? (
								<span className="flex min-w-0 items-center gap-2">
									<span
										className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${option.avatarTone}`}
									>
										{option.initials}
									</span>
									<span className="truncate">{option.label}</span>
								</span>
							) : null
						}
					/>

					<CampaignSelect
						label={t("clients.form.status")}
						value={values.status}
						onChange={(v) => set("status", v)}
						options={statusOptions}
						placeholder={t("clients.status.active")}
						clearable={false}
						disabled={isSubmitting}
					/>
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
					{isSubmitting ? t("common.loading") : t("clients.form.save")}
				</button>
			</div>
		</form>
	);
};

export default ClientForm;
