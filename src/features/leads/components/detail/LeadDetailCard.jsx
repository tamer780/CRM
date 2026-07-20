import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SourceBadge from "../../../../components/ui/SourceBadge";
import { nestedEntityName } from "../../../../utils/api/nestedRelations";

function formatDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function Field({ label, value, dir, children, multiline = false }) {
	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			{children ?? (
				<p
					className={[
						"mt-1 text-sm text-text",
						multiline ? "whitespace-pre-wrap leading-relaxed" : "",
					].join(" ")}
					dir={dir}
				>
					{value == null || value === "" ? "—" : value}
				</p>
			)}
		</div>
	);
}

function isValidDate(value) {
	if (!value) return false;
	const date = new Date(value);
	return !Number.isNaN(date.getTime());
}

const LeadDetailCard = ({ lead, usersMap, children }) => {
	const { t } = useTranslation();

	const upcoming = useMemo(() => {
		const now = Date.now();
		const items = [
			{
				key: "scheduled_call",
				label: t("leads.form.scheduledCall"),
				value: lead.scheduled_call_at,
			},
			{
				key: "next_follow_up",
				label: t("leads.form.nextFollowUp"),
				value: lead.next_follow_up_at,
			},
		].filter((item) => isValidDate(item.value));

		return items
			.map((item) => ({
				...item,
				overdue: new Date(item.value).getTime() < now,
				sortAt: new Date(item.value).getTime(),
			}))
			.sort((a, b) => a.sortAt - b.sortAt);
	}, [lead.scheduled_call_at, lead.next_follow_up_at, t]);

	const history = useMemo(() => {
		const items = [
			{
				key: "last_action",
				label: t("leads.detail.lastAction"),
				value: lead.last_action_at,
			},
			{
				key: "first_action",
				label: t("leads.detail.firstAction"),
				value: lead.first_action_at,
			},
			{
				key: "qualified",
				label: t("leads.detail.qualifiedAt"),
				value: lead.qualified_at,
			},
			{
				key: "lost",
				label: t("leads.detail.lostAt"),
				value: lead.lost_at,
			},
			{
				key: "assigned",
				label: t("leads.detail.assignedAt"),
				value: lead.assigned_at,
			},
			{
				key: "updated",
				label: t("leads.detail.updatedAt"),
				value: lead.updated_at,
			},
			{
				key: "created",
				label: t("leads.columns.created"),
				value: lead.created_at,
			},
		].filter((item) => isValidDate(item.value));

		return items
			.map((item) => ({
				...item,
				sortAt: new Date(item.value).getTime(),
			}))
			.sort((a, b) => b.sortAt - a.sortAt);
	}, [
		lead.last_action_at,
		lead.first_action_at,
		lead.qualified_at,
		lead.lost_at,
		lead.assigned_at,
		lead.updated_at,
		lead.created_at,
		t,
	]);

	const hasDates = upcoming.length > 0 || history.length > 0;

	return (
		<div className="space-y-6">
			<section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
				<h2 className="mb-4 text-lg font-semibold text-text">
					{t("leads.detail.overview")}
				</h2>

				<div className="space-y-6">
					<div>
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
							{t("leads.detail.contact")}
						</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<Field label={t("leads.form.name")} value={lead.name} />
							<Field label={t("leads.form.phone")} dir="ltr">
								{lead.phone ? (
									<a
										href={`tel:${lead.phone}`}
										className="mt-1 block text-sm text-text transition hover:text-accent"
										dir="ltr"
									>
										{lead.phone}
									</a>
								) : (
									<p className="mt-1 text-sm text-text">—</p>
								)}
							</Field>
							<Field label={t("leads.form.email")}>
								{lead.email ? (
									<a
										href={`mailto:${lead.email}`}
										className="mt-1 block break-all text-sm text-text transition hover:text-accent"
									>
										{lead.email}
									</a>
								) : (
									<p className="mt-1 text-sm text-text">—</p>
								)}
							</Field>
						</div>
					</div>

					<div className="border-t border-border pt-6">
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
							{t("leads.detail.source")}
						</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<Field label={t("leads.form.source")}>
								<div className="mt-1.5">
									<SourceBadge source={lead.source} />
								</div>
							</Field>
							<Field
								label={t("leads.form.sourceDetails")}
								value={lead.source_details}
							/>
							<Field
								label={t("leads.form.project")}
								value={nestedEntityName(lead.project)}
							/>
							<Field
								label={t("leads.form.campaign")}
								value={nestedEntityName(lead.campaign)}
							/>
						</div>
					</div>

					<div className="border-t border-border pt-6">
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
							{t("leads.detail.assignment")}
						</p>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<Field
								label={t("leads.columns.assignedTo")}
								value={nestedEntityName(lead.assignee)}
							/>
							<Field
								label={t("leads.detail.assignedBy")}
								value={
									usersMap?.get(Number(lead.assigned_by))?.name ??
									usersMap?.get(String(lead.assigned_by))?.name ??
									lead.assigned_by ??
									"—"
								}
							/>
							<Field
								label={t("leads.detail.assignedAt")}
								value={formatDateTime(lead.assigned_at)}
							/>
							<Field
								label={t("leads.detail.createdBy")}
								value={
									usersMap?.get(Number(lead.created_by))?.name ??
									usersMap?.get(String(lead.created_by))?.name ??
									lead.created_by ??
									"—"
								}
							/>
						</div>
					</div>

					<div className="border-t border-border pt-6">
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
							{t("leads.detail.notes")}
						</p>
						<div className="grid grid-cols-1 gap-4">
							<Field
								label={t("leads.form.note")}
								value={lead.note}
								multiline
							/>
							<Field
								label={t("leads.form.lastCommunicationNote")}
								value={lead.last_communication_note}
								multiline
							/>
							<Field
								label={t("leads.detail.lostReason")}
								value={lead.lost_reason}
								multiline
							/>
						</div>
					</div>
				</div>
			</section>

			{children}

			<section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
				<h2 className="mb-4 text-lg font-semibold text-text">
					{t("leads.detail.keyDates")}
				</h2>

				{!hasDates && (
					<p className="text-sm text-muted">{t("leads.detail.noDates")}</p>
				)}

				{upcoming.length > 0 && (
					<div className={history.length > 0 ? "mb-6" : ""}>
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
							{t("leads.detail.upcoming")}
						</p>
						<ul className="relative">
							{upcoming.map((item, index) => (
								<li
									key={item.key}
									className="relative flex gap-3 pb-5 last:pb-0"
								>
									<span
										className={[
											"relative z-[1] mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-surface",
											item.overdue ? "bg-danger" : "bg-warning",
										].join(" ")}
										aria-hidden="true"
									/>
									{index < upcoming.length - 1 && (
										<span
											className="absolute start-[0.28rem] top-4 bottom-0 w-px bg-border"
											aria-hidden="true"
										/>
									)}
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
											<p className="text-sm font-medium text-text">
												{item.label}
											</p>
											{item.overdue && (
												<span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-danger">
													{t("leads.detail.overdue")}
												</span>
											)}
										</div>
										<p
											className={[
												"mt-0.5 text-sm",
												item.overdue
													? "font-medium text-danger"
													: "text-muted",
											].join(" ")}
										>
											{formatDateTime(item.value)}
										</p>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}

				{history.length > 0 && (
					<div>
						<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
							{t("leads.detail.history")}
						</p>
						<ul className="relative">
							{history.map((item, index) => (
								<li
									key={item.key}
									className="relative flex gap-3 pb-5 last:pb-0"
								>
									<span
										className="relative z-[1] mt-1.5 size-2.5 shrink-0 rounded-full bg-accent ring-4 ring-surface"
										aria-hidden="true"
									/>
									{index < history.length - 1 && (
										<span
											className="absolute start-[0.28rem] top-4 bottom-0 w-px bg-border"
											aria-hidden="true"
										/>
									)}
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-text">
											{item.label}
										</p>
										<p className="mt-0.5 text-sm text-muted">
											{formatDateTime(item.value)}
										</p>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</section>
		</div>
	);
};

export default LeadDetailCard;
