import { useTranslation } from "react-i18next";

const LeadFormFooter = ({
	mode,
	isSubmitting,
	onCancel,
	onDelete,
	canDelete = false,
}) => {
	const { t } = useTranslation();
	const showDelete = mode === "edit" && canDelete && typeof onDelete === "function";

	return (
		<div
			className={`flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:gap-3 ${
				showDelete ? "sm:justify-between" : "sm:justify-end"
			}`}
		>
			{showDelete && (
				<button
					type="button"
					onClick={onDelete}
					disabled={isSubmitting}
					className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40"
				>
					{t("leads.bulk.delete")}
				</button>
			)}
			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
				<button
					type="button"
					onClick={onCancel}
					disabled={isSubmitting}
					className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
				>
					{t("common.cancel")}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
				>
					{isSubmitting
						? t("common.loading")
						: mode === "create"
							? t("leads.form.create")
							: t("leads.form.save")}
				</button>
			</div>
		</div>
	);
};

export default LeadFormFooter;
