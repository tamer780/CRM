import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

const actionBtnClass =
	"inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-40";

const LeadActionsMenu = ({ onEdit, canEdit = true, disabled = false }) => {
	const { t } = useTranslation();

	if (!canEdit) return null;

	return (
		<div
			className="flex items-center justify-end gap-0.5"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				className={actionBtnClass}
				onClick={onEdit}
				disabled={disabled}
				aria-label={t("leads.editLead")}
				title={t("leads.editLead")}
			>
				<Pencil className="size-4" aria-hidden="true" />
			</button>
		</div>
	);
};

export default LeadActionsMenu;
