import { useTranslation } from "react-i18next";
import {
	CLIENT_STATUS_DOT_COLORS,
	CLIENT_STATUS_STYLES,
} from "../utils/clientConstants";

const ClientStatusBadge = ({ status }) => {
	const { t } = useTranslation();

	if (!status) {
		return <span className="text-sm text-muted">—</span>;
	}

	const styles =
		CLIENT_STATUS_STYLES[status] ??
		"bg-background text-muted ring-1 ring-inset ring-border";
	const dot = CLIENT_STATUS_DOT_COLORS[status] ?? "bg-muted";
	const label = t(`clients.status.${status}`, { defaultValue: status });

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
		>
			<span
				className={`size-1.5 shrink-0 rounded-full ${dot}`}
				aria-hidden="true"
			/>
			{label}
		</span>
	);
};

export default ClientStatusBadge;
