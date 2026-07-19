import { CalendarClock } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { fromDatetimeLocalValue } from "../../../../utils/leads/leadConstants";
import FormDateTime from "../form/FormDateTime";
import FormTextarea from "../form/FormTextarea";

const MEETING_NOTE_MAX = 5000;

const LeadMeetingScheduledModal = ({
	open,
	lead,
	isSubmitting = false,
	error = "",
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const [meetingDate, setMeetingDate] = useState("");
	const [meetingNote, setMeetingNote] = useState("");
	const [fieldError, setFieldError] = useState("");

	useEffect(() => {
		if (open) {
			setMeetingDate("");
			setMeetingNote("");
			setFieldError("");
		}
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (e) => {
			if (e.key === "Escape" && !isSubmitting) onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, isSubmitting, onClose]);

	if (!open || !lead) return null;

	const handleConfirm = () => {
		const trimmedNote = meetingNote.trim();
		if (trimmedNote.length > MEETING_NOTE_MAX) {
			setFieldError(
				t("leads.validation.meetingNoteMax", { max: MEETING_NOTE_MAX }),
			);
			return;
		}
		setFieldError("");
		onConfirm({
			meeting_date: fromDatetimeLocalValue(meetingDate),
			meeting_note: trimmedNote || null,
		});
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
				onClick={() => !isSubmitting && onClose()}
				aria-hidden="true"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="animate-card-in relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
			>
				<div className="px-5 py-5">
					<div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-50">
						<CalendarClock
							className="size-6 text-violet-600"
							aria-hidden="true"
						/>
					</div>
					<h2 id={titleId} className="text-lg font-semibold text-text">
						{t("leads.meetingScheduled.title")}
					</h2>
					<p className="mt-1.5 text-sm text-muted">
						{t("leads.meetingScheduled.message")}
					</p>
					<p className="mt-2 text-sm font-medium text-text">{lead.name}</p>

					<div className="mt-4 space-y-4">
						<FormDateTime
							label={t("leads.meetingScheduled.date")}
							value={meetingDate}
							onChange={(e) => setMeetingDate(e.target.value)}
							disabled={isSubmitting}
						/>
						<FormTextarea
							label={t("leads.meetingScheduled.note")}
							value={meetingNote}
							onChange={(e) => {
								setMeetingNote(e.target.value);
								if (fieldError) setFieldError("");
							}}
							disabled={isSubmitting}
							minRows={3}
							maxLength={MEETING_NOTE_MAX}
							placeholder={t("leads.meetingScheduled.notePlaceholder")}
							error={fieldError || undefined}
						/>
					</div>

					{error && (
						<p role="alert" className="mt-3 text-sm text-red-600">
							{error}
						</p>
					)}
				</div>
				<div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
					>
						{t("common.cancel")}
					</button>
					<button
						type="button"
						disabled={isSubmitting}
						onClick={handleConfirm}
						className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
					>
						{isSubmitting
							? t("common.loading")
							: t("leads.meetingScheduled.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default LeadMeetingScheduledModal;
