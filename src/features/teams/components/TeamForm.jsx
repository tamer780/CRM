import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../../leads/components/FormInput";
import SearchableSelect from "../../leads/components/SearchableSelect";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";

const TeamForm = ({
	mode = "create",
	values,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	users = [],
	usersLoading = false,
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onChange({ ...values, [key]: value });

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

	const renderOption = (option, { selected }) => (
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

	const renderValue = (option) =>
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

				<div className="grid grid-cols-1 gap-4">
					<FormInput
						label={t("teams.form.name")}
						required
						value={values.name}
						onChange={(e) => set("name", e.target.value)}
						error={errors.name}
						disabled={isSubmitting}
					/>

					<SearchableSelect
						label={t("teams.form.leader")}
						value={values.team_leader_id}
						onChange={(v) =>
							set("team_leader_id", v == null ? "" : String(v))
						}
						options={userOptions}
						loading={usersLoading}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.team_leader_id}
						disabled={isSubmitting}
						renderOption={renderOption}
						renderValue={renderValue}
					/>

					<SearchableSelect
						label={t("teams.form.supervisor")}
						value={values.supervisor_id}
						onChange={(v) =>
							set("supervisor_id", v == null ? "" : String(v))
						}
						options={userOptions}
						loading={usersLoading}
						placeholder={t("leads.form.none")}
						clearLabel={t("leads.form.none")}
						error={errors.supervisor_id}
						disabled={isSubmitting}
						renderOption={renderOption}
						renderValue={renderValue}
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
					{isSubmitting
						? t("common.loading")
						: mode === "edit"
							? t("teams.form.save")
							: t("teams.form.create")}
				</button>
			</div>
		</form>
	);
};

export default TeamForm;
