import { GitMerge } from "lucide-react";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";

const PendingLeadMergeModal = ({
	open,
	lead,
	isSubmitting = false,
	error = "",
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const titleId = useId();

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (e) => {
			if (e.key === "Escape" && !isSubmitting) onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, isSubmitting, onClose]);

	if (!open || !lead) return null;

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
					<div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-light-gold">
						<GitMerge className="size-6 text-gold" aria-hidden="true" />
					</div>
					<h2 id={titleId} className="text-lg font-semibold text-text">
						{t("pendingLeads.merge.title")}
					</h2>
					<p className="mt-1.5 text-sm text-muted">
						{t("pendingLeads.merge.message")}
					</p>
					{error && (
						<p
							role="alert"
							className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
						>
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
						onClick={onConfirm}
						className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
					>
						{isSubmitting
							? t("common.loading")
							: t("pendingLeads.merge.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PendingLeadMergeModal;
