import { useTranslation } from "react-i18next";
import { SOURCE_BADGE_STYLES } from "../../features/pendingLeads/utils/pendingLeadConstants";

const SourceBadge = ({ source }) => {
	const { t } = useTranslation();

	if (!source) {
		return <span className="text-sm text-muted">—</span>;
	}

	const styles =
		SOURCE_BADGE_STYLES[source] ?? "bg-background text-muted";
	const label = t(`leads.sources.${source}`, { defaultValue: source });

	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
		>
			{label}
		</span>
	);
};

export default SourceBadge;
