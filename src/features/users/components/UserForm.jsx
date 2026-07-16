import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../../leads/components/FormInput";
import SearchableSelect from "../../leads/components/SearchableSelect";
import { USER_ROLES } from "../utils/userConstants";

const UserForm = ({
	mode = "create",
	values,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onChange({ ...values, [key]: value });

	const roleOptions = useMemo(
		() =>
			USER_ROLES.map((role) => ({
				value: role,
				label: t(`users.roles.${role}`, { defaultValue: role }),
				searchText: role,
			})),
		[t],
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
							label={t("users.form.name")}
							required
							value={values.name}
							onChange={(e) => set("name", e.target.value)}
							error={errors.name}
							disabled={isSubmitting}
							autoComplete="name"
						/>
					</div>

					<div className="sm:col-span-2">
						<FormInput
							label={t("users.form.email")}
							required
							type="email"
							value={values.email}
							onChange={(e) => set("email", e.target.value)}
							error={errors.email}
							disabled={isSubmitting}
							autoComplete="email"
						/>
					</div>

					<SearchableSelect
						label={t("users.form.role")}
						required
						value={values.role}
						onChange={(v) => set("role", v == null ? "" : String(v))}
						options={roleOptions}
						placeholder={t("users.form.rolePlaceholder")}
						clearLabel={t("leads.form.none")}
						error={errors.role}
						disabled={isSubmitting}
					/>

					<FormInput
						label={t("users.form.jobTitle")}
						value={values.job_title}
						onChange={(e) => set("job_title", e.target.value)}
						error={errors.job_title}
						disabled={isSubmitting}
					/>

					<div className="sm:col-span-2">
						{mode === "edit" && (
							<p className="mb-3 text-xs text-muted">
								{t("users.form.passwordHint")}
							</p>
						)}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput
								label={t("users.form.password")}
								required={mode === "create"}
								type="password"
								value={values.password}
								onChange={(e) => set("password", e.target.value)}
								error={errors.password}
								disabled={isSubmitting}
								autoComplete={
									mode === "create" ? "new-password" : "new-password"
								}
							/>
							<FormInput
								label={t("users.form.confirmPassword")}
								required={mode === "create"}
								type="password"
								value={values.password_confirmation}
								onChange={(e) =>
									set("password_confirmation", e.target.value)
								}
								error={errors.password_confirmation}
								disabled={isSubmitting}
								autoComplete="new-password"
							/>
						</div>
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
							? t("users.form.save")
							: t("users.form.create")}
				</button>
			</div>
		</form>
	);
};

export default UserForm;
