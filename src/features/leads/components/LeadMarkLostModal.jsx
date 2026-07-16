import { Ban } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

const LeadMarkLostModal = ({
	open,
	lead,
	isSubmitting = false,
	error = "",
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const [reason, setReason] = useState("");
	const [fieldError, setFieldError] = useState("");

	useEffect(() => {
		if (open) {
			setReason("");
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
		const trimmed = reason.trim();
		if (!trimmed) {
			setFieldError(t("leads.validation.lostReasonRequired"));
			return;
		}
		setFieldError("");
		onConfirm(trimmed);
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
					<div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-50">
						<Ban className="size-6 text-red-600" aria-hidden="true" />
					</div>
					<h2 id={titleId} className="text-lg font-semibold text-text">
						{t("leads.markLost.title")}
					</h2>
					<p className="mt-1.5 text-sm text-muted">
						{t("leads.markLost.message")}
					</p>
					<p className="mt-2 text-sm font-medium text-text">{lead.name}</p>

					<label className="mt-4 block">
						<span className="mb-1.5 block text-sm font-medium text-text">
							{t("leads.markLost.reason")}
							<span className="text-red-500"> *</span>
						</span>
						<textarea
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								if (fieldError) setFieldError("");
							}}
							disabled={isSubmitting}
							rows={3}
							className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
							placeholder={t("leads.markLost.reasonPlaceholder")}
						/>
						{(fieldError || error) && (
							<p role="alert" className="mt-1.5 text-sm text-red-600">
								{fieldError || error}
							</p>
						)}
					</label>
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
						className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
					>
						{isSubmitting
							? t("common.loading")
							: t("leads.markLost.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default LeadMarkLostModal;
