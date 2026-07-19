import { FileText, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LeadCommentsSection from "./LeadCommentsSection";

function NotesEmpty() {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center justify-center px-4 py-10 text-center">
			<div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-light-gold">
				<FileText className="size-6 text-gold" aria-hidden="true" />
			</div>
			<p className="text-sm font-medium text-text">
				{t("leads.detail.notesEmptyTitle")}
			</p>
			<p className="mt-1 max-w-xs text-sm text-muted">
				{t("leads.detail.notesEmptyMessage")}
			</p>
		</div>
	);
}

function NoteBlock({ label, value }) {
	if (!value) return null;
	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			<p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm leading-relaxed text-text">
				{value}
			</p>
		</div>
	);
}

function LeadNotesTab({ lead }) {
	const { t } = useTranslation();
	const hasNotes =
		Boolean(lead?.note) ||
		Boolean(lead?.last_communication_note) ||
		Boolean(lead?.lost_reason);

	if (!hasNotes) return <NotesEmpty />;

	return (
		<div className="space-y-4 px-5 py-5 sm:px-6">
			<NoteBlock label={t("leads.form.note")} value={lead.note} />
			<NoteBlock
				label={t("leads.form.lastCommunicationNote")}
				value={lead.last_communication_note}
			/>
			<NoteBlock
				label={t("leads.detail.lostReason")}
				value={lead.lost_reason}
			/>
		</div>
	);
}

const LeadActivityPanel = ({ leadId, lead, users = [] }) => {
	const { t } = useTranslation();
	const [tab, setTab] = useState("comments");

	const tabs = [
		{
			id: "comments",
			label: t("leads.comments.title"),
			icon: MessageSquareText,
		},
		{
			id: "notes",
			label: t("leads.detail.notes"),
			icon: FileText,
		},
	];

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
			<div className="border-b border-border px-5 pt-4 sm:px-6">
				<div className="mb-3">
					<h2 className="text-lg font-semibold text-text">
						{t("leads.detail.activity")}
					</h2>
				</div>
				<div
					className="flex gap-1"
					role="tablist"
					aria-label={t("leads.detail.activity")}
				>
					{tabs.map(({ id, label, icon: Icon }) => {
						const selected = tab === id;
						return (
							<button
								key={id}
								type="button"
								role="tab"
								aria-selected={selected}
								id={`lead-activity-tab-${id}`}
								aria-controls={`lead-activity-panel-${id}`}
								onClick={() => setTab(id)}
								className={[
									"inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition",
									selected
										? "border-gold text-text"
										: "border-transparent text-muted hover:text-text",
								].join(" ")}
							>
								<Icon className="size-3.5" aria-hidden="true" />
								{label}
							</button>
						);
					})}
				</div>
			</div>

			<div
				role="tabpanel"
				id="lead-activity-panel-comments"
				aria-labelledby="lead-activity-tab-comments"
				hidden={tab !== "comments"}
			>
				{tab === "comments" && (
					<LeadCommentsSection
						leadId={leadId}
						users={users}
						variant="embedded"
					/>
				)}
			</div>

			<div
				role="tabpanel"
				id="lead-activity-panel-notes"
				aria-labelledby="lead-activity-tab-notes"
				hidden={tab !== "notes"}
			>
				{tab === "notes" && <LeadNotesTab lead={lead} />}
			</div>
		</section>
	);
};

export default LeadActivityPanel;
