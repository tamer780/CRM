import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormInput from "./FormInput";
import LeadFormSection from "./LeadFormSection";

const LeadPersonalSection = ({ values, onFieldChange, errors = {}, disabled }) => {
	const { t } = useTranslation();

	return (
		<LeadFormSection
			icon={User}
			title={t("leads.detail.contact")}
			description={t("leads.subtitle")}
		>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<FormInput
					id="lead-name"
					label={t("leads.form.name")}
					required
					maxLength={255}
					value={values.name}
					onChange={(e) => onFieldChange("name", e.target.value)}
					error={errors.name}
					disabled={disabled}
				/>
				<FormInput
					id="lead-phone"
					label={t("leads.form.phone")}
					required
					maxLength={255}
					dir="ltr"
					value={values.phone}
					onChange={(e) => onFieldChange("phone", e.target.value)}
					error={errors.phone}
					disabled={disabled}
				/>
				<div className="md:col-span-2">
					<FormInput
						id="lead-email"
						label={t("leads.form.email")}
						type="email"
						maxLength={255}
						dir="ltr"
						value={values.email}
						onChange={(e) => onFieldChange("email", e.target.value)}
						error={errors.email}
						disabled={disabled}
					/>
				</div>
			</div>
		</LeadFormSection>
	);
};

export default LeadPersonalSection;
