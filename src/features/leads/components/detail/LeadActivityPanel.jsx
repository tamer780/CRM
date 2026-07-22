import { useTranslation } from "react-i18next";
import LeadCommentsSection from "./LeadCommentsSection";

const LeadActivityPanel = ({ leadId, leadStatus, users = [] }) => {
	const { t } = useTranslation();

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
			<div className="border-b border-border px-5 py-4 sm:px-6">
				<h2 className="text-lg font-semibold text-text">
					{t("leads.comments.title")}
				</h2>
			</div>

			<LeadCommentsSection
				leadId={leadId}
				leadStatus={leadStatus}
				users={users}
				variant="embedded"
			/>
		</section>
	);
};

export default LeadActivityPanel;
