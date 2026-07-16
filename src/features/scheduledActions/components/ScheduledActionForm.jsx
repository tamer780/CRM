import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormDateTime from "../../leads/components/FormDateTime";
import FormTextarea from "../../leads/components/FormTextarea";
import SearchableSelect from "../../leads/components/SearchableSelect";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { SCHEDULED_ACTION_TYPES } from "../utils/scheduledActionConstants";

const ScheduledActionForm = ({
	mode = "create",
	values,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	users = [],
	usersLoading = false,
	leads = [],
	leadsLoading = false,
	clients = [],
	clientsLoading = false,
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onChange({ ...values, [key]: value });

	const typeOptions = useMemo(
		() =>
			SCHEDULED_ACTION_TYPES.map((type) => ({
				value: type,
				label: t(`scheduledActions.types.${type}`),
				searchText: type,
			})),
		[t],
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

	const leadOptions = useMemo(
		() =>
			leads.map((lead) => {
				const name = lead.name ?? lead.phone ?? `#${lead.id}`;
				return {
					value: lead.id,
					label: name,
					searchText: [lead.name, lead.phone, lead.email]
						.filter(Boolean)
						.join(" "),
				};
			}),
		[leads],
	);

	const clientOptions = useMemo(
		() =>
			clients.map((client) => {
				const name = client.name ?? client.phone ?? `#${client.id}`;
				return {
					value: client.id,
					label: name,
					searchText: [client.name, client.phone, client.email]
						.filter(Boolean)
						.join(" "),
				};
			}),
		[clients],
	);

	const handleRelatedTypeChange = (relatedType) => {
		onChange({
			...values,
			related_type: relatedType,
			lead_id: relatedType === "lead" ? values.lead_id : "",
			client_id: relatedType === "client" ? values.client_id : "",
		});
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		onSubmit(values);
	};

	const renderUserOption = (option, { selected }) => (
		<span className="flex min-w-0 items-center gap-2">
			<span
				className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${option.avatarTone}`}
			>
				{option.initials}
			</span>
			<span className={`truncate ${selected ? "font-medium" : ""}`}>
				{option.label}
			</span>
		</span>
	);

	const renderUserValue = (option) =>
		option ? (
			<span className="flex min-w-0 items-center gap-2">
				<span
					className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${option.avatarTone}`}
				>
					{option.initials}
				</span>
				<span className="truncate">{option.label}</span>
			</span>
		) : null;

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
						<p className="mb-2 text-sm font-medium text-text">
							{t("scheduledActions.form.relatedTo")}
							<span className="ms-1 text-red-500">*</span>
						</p>
						<div className="flex gap-2">
							{(["lead", "client"]).map((type) => {
								const active = values.related_type === type;
								return (
									<button
										key={type}
										type="button"
										disabled={isSubmitting}
										onClick={() => handleRelatedTypeChange(type)}
										className={[
											"flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
											active
												? "border-gold bg-light-gold/60 text-primary"
												: "border-border bg-surface text-muted hover:bg-background hover:text-text",
										].join(" ")}
									>
										{t(`scheduledActions.form.relatedTypes.${type}`)}
									</button>
								);
							})}
						</div>
					</div>

					{values.related_type === "client" ? (
						<div className="sm:col-span-2">
							<SearchableSelect
								label={t("scheduledActions.form.client")}
								required
								value={values.client_id}
								onChange={(v) =>
									set("client_id", v == null ? "" : String(v))
								}
								options={clientOptions}
								loading={clientsLoading}
								placeholder={t("scheduledActions.form.clientPlaceholder")}
								clearLabel={t("leads.form.none")}
								error={errors.client_id}
								disabled={isSubmitting}
							/>
						</div>
					) : (
						<div className="sm:col-span-2">
							<SearchableSelect
								label={t("scheduledActions.form.lead")}
								required
								value={values.lead_id}
								onChange={(v) => set("lead_id", v == null ? "" : String(v))}
								options={leadOptions}
								loading={leadsLoading}
								placeholder={t("scheduledActions.form.leadPlaceholder")}
								clearLabel={t("leads.form.none")}
								error={errors.lead_id}
								disabled={isSubmitting}
							/>
						</div>
					)}

					<SearchableSelect
						label={t("scheduledActions.form.type")}
						required
						value={values.type}
						onChange={(v) => set("type", v == null ? "" : String(v))}
						options={typeOptions}
						placeholder={t("scheduledActions.form.typePlaceholder")}
						clearLabel={t("leads.form.none")}
						error={errors.type}
						disabled={isSubmitting}
					/>

					<SearchableSelect
						label={t("scheduledActions.form.assignee")}
						required
						value={values.assigned_to}
						onChange={(v) =>
							set("assigned_to", v == null ? "" : String(v))
						}
						options={userOptions}
						loading={usersLoading}
						placeholder={t("scheduledActions.form.assigneePlaceholder")}
						clearLabel={t("leads.form.none")}
						error={errors.assigned_to}
						disabled={isSubmitting}
						renderOption={renderUserOption}
						renderValue={renderUserValue}
					/>

					<div className="sm:col-span-2">
						<FormDateTime
							label={t("scheduledActions.form.scheduledAt")}
							required
							value={values.scheduled_at}
							onChange={(e) => set("scheduled_at", e.target.value)}
							error={errors.scheduled_at}
							disabled={isSubmitting}
						/>
					</div>

					<div className="sm:col-span-2">
						<FormTextarea
							label={t("scheduledActions.form.note")}
							value={values.note}
							onChange={(e) => set("note", e.target.value)}
							error={errors.note}
							disabled={isSubmitting}
							rows={3}
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
							? t("scheduledActions.form.save")
							: t("scheduledActions.form.create")}
				</button>
			</div>
		</form>
	);
};

export default ScheduledActionForm;
