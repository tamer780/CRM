import { useTranslation } from "react-i18next";
import {
	LEAD_STATUS_DOT_COLORS,
	LEAD_STATUS_STYLES,
} from "../../../../utils/leads/leadConstants";

const LeadStatusBadge = ({ status }) => {
	const { t } = useTranslation();
	const key = String(status ?? "").toLowerCase();
	const styles = LEAD_STATUS_STYLES[key] ?? "bg-background text-muted";
	const dot = LEAD_STATUS_DOT_COLORS[key] ?? "bg-muted";
	const label = t(`leads.status.${key}`, {
		defaultValue: t(`dashboard.status.${key}`, {
			defaultValue: status ? String(status).replaceAll("_", " ") : "—",
		}),
	});

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ring-black/5 ${styles}`}
		>
			<span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
			{label}
		</span>
	);
};

export default LeadStatusBadge;
