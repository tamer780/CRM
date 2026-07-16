import { CheckCircle2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../../leads/components/FormInput";
import FormTextarea from "../../leads/components/FormTextarea";
import { validateCompleteForm } from "../utils/scheduledActionConstants";

const ScheduledActionCompleteModal = ({
	open,
	action,
	isSubmitting = false,
	apiError = "",
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const [values, setValues] = useState({ outcome: "", note: "" });
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (open) {
			setValues({
				outcome: "",
				note: action?.note ?? "",
			});
			setErrors({});
		}
	}, [open, action?.id, action?.note]);

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (e) => {
			if (e.key === "Escape" && !isSubmitting) onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, isSubmitting, onClose]);

	if (!open || !action) return null;

	const handleSubmit = (event) => {
		event.preventDefault();
		const nextErrors = validateCompleteForm(values, t);
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}
		onConfirm({
			outcome: values.outcome.trim(),
			note: values.note.trim() || null,
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
				<form onSubmit={handleSubmit}>
					<div className="px-5 py-5">
						<div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50">
							<CheckCircle2
								className="size-6 text-emerald-600"
								aria-hidden="true"
							/>
						</div>
						<h2 id={titleId} className="text-lg font-semibold text-text">
							{t("scheduledActions.complete.title")}
						</h2>
						<p className="mt-1.5 text-sm text-muted">
							{t("scheduledActions.complete.message")}
						</p>

						{(apiError || errors.api) && (
							<p
								role="alert"
								className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
							>
								{apiError || errors.api}
							</p>
						)}

						<div className="mt-4 space-y-4">
							<FormInput
								label={t("scheduledActions.complete.outcome")}
								required
								value={values.outcome}
								onChange={(e) => {
									setValues((prev) => ({ ...prev, outcome: e.target.value }));
									if (errors.outcome) setErrors((prev) => ({ ...prev, outcome: "" }));
								}}
								error={errors.outcome}
								disabled={isSubmitting}
							/>
							<FormTextarea
								label={t("scheduledActions.complete.note")}
								value={values.note}
								onChange={(e) =>
									setValues((prev) => ({ ...prev, note: e.target.value }))
								}
								error={errors.note}
								disabled={isSubmitting}
								rows={3}
							/>
						</div>
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
							type="submit"
							disabled={isSubmitting}
							className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
						>
							{isSubmitting
								? t("common.loading")
								: t("scheduledActions.complete.confirm")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ScheduledActionCompleteModal;
