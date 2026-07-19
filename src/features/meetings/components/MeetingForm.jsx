import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormDateTime from "../../leads/components/form/FormDateTime";
import FormTextarea from "../../leads/components/form/FormTextarea";
import SearchableSelect from "../../leads/components/form/SearchableSelect";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { MEETING_STATUSES } from "../utils/meetingConstants";

const MeetingForm = ({
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
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onChange({ ...values, [key]: value });
	const isEdit = mode === "edit";

	const statusOptions = useMemo(
		() =>
			MEETING_STATUSES.map((status) => ({
				value: status,
				label: t(`meetings.statuses.${status}`),
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

	const selectedLead = leadOptions.find(
		(o) => String(o.value) === String(values.lead_id),
	);

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
						{isEdit ? (
							<div>
								<p className="mb-1.5 text-sm font-medium text-text">
									{t("meetings.form.lead")}
								</p>
								<p className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm text-text">
									{selectedLead?.label ??
										(values.lead_id ? `#${values.lead_id}` : "—")}
								</p>
							</div>
						) : (
							<SearchableSelect
								label={t("meetings.form.lead")}
								required
								value={values.lead_id}
								onChange={(v) => set("lead_id", v == null ? "" : String(v))}
								options={leadOptions}
								loading={leadsLoading}
								placeholder={t("meetings.form.leadPlaceholder")}
								clearLabel={t("leads.form.none")}
								error={errors.lead_id}
								disabled={isSubmitting}
							/>
						)}
					</div>

					<SearchableSelect
						label={t("meetings.form.assignee")}
						required
						value={values.assigned_to}
						onChange={(v) =>
							set("assigned_to", v == null ? "" : String(v))
						}
						options={userOptions}
						loading={usersLoading}
						placeholder={t("meetings.form.assigneePlaceholder")}
						clearLabel={t("leads.form.none")}
						error={errors.assigned_to}
						disabled={isSubmitting}
						renderOption={renderUserOption}
						renderValue={renderUserValue}
					/>

					<SearchableSelect
						label={t("meetings.form.status")}
						required
						value={values.status}
						onChange={(v) => set("status", v == null ? "" : String(v))}
						options={statusOptions}
						placeholder={t("meetings.form.statusPlaceholder")}
						clearable={false}
						searchable={false}
						error={errors.status}
						disabled={isSubmitting}
					/>

					<div className="sm:col-span-2">
						<FormDateTime
							label={t("meetings.form.meetingDate")}
							required
							value={values.meeting_date}
							onChange={(e) => set("meeting_date", e.target.value)}
							error={errors.meeting_date}
							disabled={isSubmitting}
						/>
					</div>

					<div className="sm:col-span-2">
						<FormTextarea
							label={t("meetings.form.notes")}
							value={values.notes}
							onChange={(e) => set("notes", e.target.value)}
							error={errors.notes}
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
						: isEdit
							? t("meetings.form.save")
							: t("meetings.form.create")}
				</button>
			</div>
		</form>
	);
};

export default MeetingForm;
