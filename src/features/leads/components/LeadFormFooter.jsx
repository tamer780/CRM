import { useTranslation } from "react-i18next";

const LeadFormFooter = ({ mode, isSubmitting, onCancel }) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end sm:gap-3">
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
	);
};

export default LeadFormFooter;
