import { Trash2 } from "lucide-react";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";

const TeamDeleteDialog = ({
	open,
	team,
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

	if (!open || !team) return null;

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
						<Trash2 className="size-6 text-red-600" aria-hidden="true" />
					</div>
					<h2 id={titleId} className="text-lg font-semibold text-text">
						{t("teams.delete.title")}
					</h2>
					<p className="mt-1.5 text-sm text-muted">
						{t("teams.delete.message")}
					</p>
					<p className="mt-2 text-sm font-medium text-text">{team.name}</p>
					<p className="mt-1 text-xs text-muted">
						{t("teams.delete.cannotUndo")}
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
						className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
					>
						{isSubmitting ? t("common.loading") : t("teams.delete.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default TeamDeleteDialog;
