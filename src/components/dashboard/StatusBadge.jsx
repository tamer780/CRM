import { useTranslation } from "react-i18next";
import { LEAD_STATUS_STYLES } from "../../utils/leads/leadConstants";

const StatusBadge = ({ status }) => {
	const { t } = useTranslation();
	const key = String(status ?? "").toLowerCase();
	const styles = LEAD_STATUS_STYLES[key] ?? "bg-background text-muted";
	const label = t(`leads.status.${key}`, {
		defaultValue: t(`dashboard.status.${key}`, {
			defaultValue: status ? String(status).replaceAll("_", " ") : "—",
		}),
	});

	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
		>
			{label}
		</span>
	);
};

export default StatusBadge;
