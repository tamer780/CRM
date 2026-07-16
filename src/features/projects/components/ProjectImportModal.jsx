import { FileUp } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

const ProjectImportModal = ({
	open,
	project,
	isSubmitting = false,
	error = "",
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const [file, setFile] = useState(null);
	const [fieldError, setFieldError] = useState("");

	useEffect(() => {
		if (open) {
			setFile(null);
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

	if (!open || !project) return null;

	const handleConfirm = () => {
		if (!file) {
			setFieldError(t("projects.validation.fileRequired"));
			return;
		}
		setFieldError("");
		onConfirm(file);
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
					<div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-light-gold">
						<FileUp className="size-6 text-gold" aria-hidden="true" />
					</div>
					<h2 id={titleId} className="text-lg font-semibold text-text">
						{t("projects.import.title")}
					</h2>
					<p className="mt-1.5 text-sm text-muted">
						{t("projects.import.message")}
					</p>
					<p className="mt-2 text-sm font-medium text-text">{project.name}</p>

					<label className="mt-4 block">
						<span className="mb-1.5 block text-sm font-medium text-text">
							{t("projects.import.file")}
							<span className="text-red-500"> *</span>
						</span>
						<input
							type="file"
							accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							disabled={isSubmitting}
							onChange={(e) => {
								setFile(e.target.files?.[0] ?? null);
								if (fieldError) setFieldError("");
							}}
							className="block w-full text-sm text-text file:me-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-secondary disabled:opacity-60"
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
						className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
					>
						{isSubmitting
							? t("common.loading")
							: t("projects.import.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProjectImportModal;
