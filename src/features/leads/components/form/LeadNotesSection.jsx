import { NotebookPen } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormTextarea from "./FormTextarea";
import LeadFormSection from "./LeadFormSection";

const LeadNotesSection = ({ values, onFieldChange, errors = {}, disabled }) => {
	const { t } = useTranslation();

	return (
		<LeadFormSection
			icon={NotebookPen}
			title={t("leads.detail.notes")}
			description={t("leads.subtitle")}
		>
			<div className="space-y-4">
				<FormTextarea
					id="lead-note"
					label={t("leads.form.note")}
					value={values.note}
					onChange={(e) => onFieldChange("note", e.target.value)}
					error={errors.note}
					disabled={disabled}
					maxLength={2000}
					minRows={3}
				/>
				<FormTextarea
					id="lead-last-comm"
					label={t("leads.form.lastCommunicationNote")}
					value={values.last_communication_note}
					onChange={(e) =>
						onFieldChange("last_communication_note", e.target.value)
					}
					error={errors.last_communication_note}
					disabled={disabled}
					maxLength={2000}
					minRows={3}
				/>
			</div>
		</LeadFormSection>
	);
};

export default LeadNotesSection;
