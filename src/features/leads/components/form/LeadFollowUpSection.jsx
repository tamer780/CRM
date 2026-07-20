import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	SCHEDULED_CALL_MAX_AHEAD_MS,
	toDatetimeLocalValue,
} from "../../../../utils/leads/leadConstants";
import FormDateTime from "./FormDateTime";
import LeadFormSection from "./LeadFormSection";

const LeadFollowUpSection = ({ values, onFieldChange, errors = {}, disabled }) => {
	const { t } = useTranslation();
	const scheduledCallMax = toDatetimeLocalValue(
		new Date(Date.now() + SCHEDULED_CALL_MAX_AHEAD_MS),
	);

	return (
		<LeadFormSection
			icon={CalendarClock}
			title={t("leads.detail.timeline")}
			description={t("leads.subtitle")}
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FormDateTime
					id="lead-scheduled-call"
					label={t("leads.form.scheduledCall")}
					value={values.scheduled_call_at}
					onChange={(e) => onFieldChange("scheduled_call_at", e.target.value)}
					error={errors.scheduled_call_at}
					max={scheduledCallMax}
					disabled={disabled}
				/>
				<FormDateTime
					id="lead-follow-up"
					label={t("leads.form.nextFollowUp")}
					value={values.next_follow_up_at}
					onChange={(e) => onFieldChange("next_follow_up_at", e.target.value)}
					error={errors.next_follow_up_at}
					disabled={disabled}
				/>
			</div>
		</LeadFormSection>
	);
};

export default LeadFollowUpSection;
