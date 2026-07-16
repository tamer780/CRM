import { useTranslation } from "react-i18next";
import {
	DUPLICATE_STATUS_DOT_COLORS,
	DUPLICATE_STATUS_STYLES,
} from "../../features/pendingLeads/utils/pendingLeadConstants";

const DuplicateStatusBadge = ({ status }) => {
	const { t } = useTranslation();

	if (!status) {
		return <span className="text-sm text-muted">—</span>;
	}

	const styles =
		DUPLICATE_STATUS_STYLES[status] ??
		"bg-background text-muted ring-1 ring-inset ring-border";
	const dot =
		DUPLICATE_STATUS_DOT_COLORS[status] ?? "bg-muted";
	const label = t(`pendingLeads.status.${status}`, {
		defaultValue: status,
	});

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
		>
			<span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
			{label}
		</span>
	);
};

export default DuplicateStatusBadge;
