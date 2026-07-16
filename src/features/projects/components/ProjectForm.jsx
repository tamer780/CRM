import { Check } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../../leads/components/FormInput";
import FormTextarea from "../../leads/components/FormTextarea";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import CampaignSelect from "../../campaigns/components/CampaignSelect";
import { PROJECT_STATUSES } from "../utils/projectConstants";

const ProjectForm = ({
	mode = "create",
	values,
	onChange,
	onSubmit,
	onCancel,
	isSubmitting = false,
	errors = {},
	teams = [],
	teamsLoading = false,
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onChange({ ...values, [key]: value });

	const statusOptions = useMemo(
		() =>
			PROJECT_STATUSES.map((s) => ({
				value: s,
				label: t(`projects.status.${s}`),
			})),
		[t],
	);

	const selectedSet = useMemo(
		() => new Set((values.team_ids ?? []).map(String)),
		[values.team_ids],
	);

	const toggleTeam = (teamId) => {
		const id = String(teamId);
		const next = new Set(selectedSet);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		set("team_ids", Array.from(next));
	};

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
							label={t("projects.form.name")}
							required
							value={values.name}
							onChange={(e) => set("name", e.target.value)}
							error={errors.name}
							disabled={isSubmitting}
						/>
					</div>

					<div className="sm:col-span-2">
						<FormTextarea
							label={t("projects.form.description")}
							value={values.description}
							onChange={(e) => set("description", e.target.value)}
							error={errors.description}
							disabled={isSubmitting}
							rows={3}
						/>
					</div>

					<FormInput
						label={t("projects.form.startedAt")}
						type="date"
						value={values.started_at}
						onChange={(e) => set("started_at", e.target.value)}
						error={errors.started_at}
						disabled={isSubmitting}
					/>

					<CampaignSelect
						label={t("projects.form.status")}
						required
						value={values.status}
						onChange={(v) => set("status", v)}
						options={statusOptions}
						placeholder={t("projects.status.upcoming")}
						clearable={false}
						error={errors.status}
						disabled={isSubmitting}
					/>

					<div className="sm:col-span-2">
						<p className="mb-2 text-sm font-medium text-text">
							{t("projects.form.teams")}
						</p>
						{teamsLoading ? (
							<div className="space-y-2">
								{Array.from({ length: 3 }).map((_, i) => (
									<div
										key={i}
										className="h-11 animate-pulse rounded-xl bg-border/50"
									/>
								))}
							</div>
						) : teams.length === 0 ? (
							<p className="rounded-xl border border-border bg-background/40 px-3 py-3 text-sm text-muted">
								{t("projects.form.noTeams")}
							</p>
						) : (
							<ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
								{teams.map((team) => {
									const id = String(team.id);
									const selected = selectedSet.has(id);
									const name = team.name ?? `#${team.id}`;
									return (
										<li key={team.id}>
											<button
												type="button"
												disabled={isSubmitting}
												onClick={() => toggleTeam(team.id)}
												className={[
													"flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm transition",
													selected
														? "bg-light-gold/60 font-medium text-text"
														: "text-text hover:bg-background",
													isSubmitting ? "opacity-60" : "",
												].join(" ")}
											>
												<span
													className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(name)}`}
												>
													{getInitials(name)}
												</span>
												<span className="min-w-0 flex-1 truncate">{name}</span>
												{selected && (
													<Check
														className="size-4 shrink-0 text-gold"
														aria-hidden="true"
													/>
												)}
											</button>
										</li>
									);
								})}
							</ul>
						)}
						{errors.team_ids && (
							<p className="mt-1.5 text-sm text-red-600">{errors.team_ids}</p>
						)}
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
							? t("projects.form.save")
							: t("projects.form.create")}
				</button>
			</div>
		</form>
	);
};

export default ProjectForm;
