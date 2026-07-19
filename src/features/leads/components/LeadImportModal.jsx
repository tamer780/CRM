import { Check, ChevronDown, FileUp } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { downloadLeadsImportTemplate } from "../../../services/leads/leadsService";
import { extractApiError } from "../../../utils/api/apiHelpers";
import { LEAD_SOURCES } from "../../../utils/leads/leadConstants";
import {
	FieldLabel,
	FieldMessage,
	fieldClassName,
} from "./formFieldStyles";

const LeadImportModal = ({
	open,
	isSubmitting = false,
	error = "",
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const sourceListId = useId();
	const sourceRef = useRef(null);
	const [file, setFile] = useState(null);
	const [source, setSource] = useState("import");
	const [sourceOpen, setSourceOpen] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});
	const [templateLoading, setTemplateLoading] = useState(false);
	const [templateError, setTemplateError] = useState("");

	const sourceOptions = useMemo(
		() =>
			LEAD_SOURCES.map((value) => ({
				value,
				label: t(`leads.sources.${value}`, { defaultValue: value }),
			})),
		[t],
	);

	const selectedSource = sourceOptions.find(
		(opt) => String(opt.value) === String(source),
	);

	useEffect(() => {
		if (open) {
			setFile(null);
			setSource("import");
			setSourceOpen(false);
			setFieldErrors({});
			setTemplateError("");
		}
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (e) => {
			if (e.key !== "Escape" || isSubmitting) return;
			if (sourceOpen) {
				setSourceOpen(false);
				return;
			}
			onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, isSubmitting, onClose, sourceOpen]);

	useEffect(() => {
		if (!sourceOpen) return undefined;
		const handlePointer = (e) => {
			if (!sourceRef.current?.contains(e.target)) setSourceOpen(false);
		};
		document.addEventListener("mousedown", handlePointer);
		return () => document.removeEventListener("mousedown", handlePointer);
	}, [sourceOpen]);

	if (!open) return null;

	const handleDownloadTemplate = async () => {
		setTemplateError("");
		setTemplateLoading(true);
		try {
			await downloadLeadsImportTemplate();
		} catch (err) {
			setTemplateError(
				extractApiError(err, t("leads.errors.templateFailed")),
			);
		} finally {
			setTemplateLoading(false);
		}
	};

	const handleConfirm = () => {
		const nextErrors = {};
		if (!file) nextErrors.file = t("leads.validation.fileRequired");
		if (!source) nextErrors.source = t("leads.validation.sourceRequired");
		if (Object.keys(nextErrors).length) {
			setFieldErrors(nextErrors);
			return;
		}
		setFieldErrors({});
		onConfirm({ file, source });
	};

	const selectSource = (value) => {
		setSource(value);
		setSourceOpen(false);
		if (fieldErrors.source) {
			setFieldErrors((prev) => {
				const next = { ...prev };
				delete next.source;
				return next;
			});
		}
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
				className="animate-card-in relative z-10 w-full max-w-md overflow-visible rounded-2xl border border-border bg-surface shadow-xl"
			>
				<div className="px-5 py-5">
					<div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-light-gold">
						<FileUp className="size-6 text-gold" aria-hidden="true" />
					</div>
					<h2 id={titleId} className="text-lg font-semibold text-text">
						{t("leads.import.title")}
					</h2>
					<p className="mt-1.5 text-sm text-muted">
						{t("leads.import.message")}
					</p>

					<button
						type="button"
						onClick={handleDownloadTemplate}
						disabled={isSubmitting || templateLoading}
						className="mt-3 text-sm font-medium text-accent underline-offset-2 transition hover:underline disabled:opacity-60"
					>
						{templateLoading
							? t("common.loading")
							: t("leads.import.downloadTemplate")}
					</button>
					{templateError && (
						<p role="alert" className="mt-1.5 text-sm text-red-600">
							{templateError}
						</p>
					)}

					<div className="mt-4 space-y-4">
						<div ref={sourceRef} className="relative">
							<FieldLabel
								htmlFor="lead-import-source"
								label={t("leads.import.source")}
								required
							/>
							<button
								type="button"
								id="lead-import-source"
								disabled={isSubmitting}
								aria-haspopup="listbox"
								aria-expanded={sourceOpen}
								aria-controls={sourceListId}
								aria-invalid={Boolean(fieldErrors.source)}
								onClick={() =>
									!isSubmitting && setSourceOpen((prev) => !prev)
								}
								className={fieldClassName({
									error: fieldErrors.source,
									className:
										"flex items-center justify-between gap-2 text-start focus-visible:ring-2 focus-visible:ring-accent/30",
								})}
							>
								<span className="min-w-0 flex-1 truncate text-text">
									{selectedSource?.label ?? t("leads.import.source")}
								</span>
								<ChevronDown
									className={`size-4 shrink-0 text-muted transition-transform duration-200 ${sourceOpen ? "rotate-180" : ""}`}
									aria-hidden="true"
								/>
							</button>
							{sourceOpen && (
								<ul
									id={sourceListId}
									role="listbox"
									className="animate-dropdown-in absolute inset-x-0 top-[calc(100%+0.35rem)] z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg"
								>
									{sourceOptions.map((option) => {
										const selectedOpt =
											String(option.value) === String(source);
										return (
											<li
												key={option.value}
												role="option"
												aria-selected={selectedOpt}
											>
												<button
													type="button"
													onClick={() => selectSource(option.value)}
													className={[
														"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
														selectedOpt
															? "bg-light-gold/60 font-medium text-text"
															: "text-text hover:bg-background",
													].join(" ")}
												>
													<span className="truncate">{option.label}</span>
													{selectedOpt && (
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
							<FieldMessage error={fieldErrors.source} />
						</div>

						<label className="block">
							<span className="mb-1.5 block text-sm font-medium text-text">
								{t("leads.import.file")}
								<span className="text-red-500"> *</span>
							</span>
							<input
								type="file"
								accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								disabled={isSubmitting}
								onChange={(e) => {
									setFile(e.target.files?.[0] ?? null);
									if (fieldErrors.file) {
										setFieldErrors((prev) => {
											const next = { ...prev };
											delete next.file;
											return next;
										});
									}
								}}
								className="block w-full text-sm text-text file:me-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-secondary disabled:opacity-60"
							/>
							{(fieldErrors.file || error) && (
								<p role="alert" className="mt-1.5 text-sm text-red-600">
									{fieldErrors.file || error}
								</p>
							)}
						</label>
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
						type="button"
						disabled={isSubmitting}
						onClick={handleConfirm}
						className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-110 disabled:opacity-60"
					>
						{isSubmitting
							? t("common.loading")
							: t("leads.import.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default LeadImportModal;
