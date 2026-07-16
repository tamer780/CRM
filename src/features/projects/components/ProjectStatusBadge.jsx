import { useTranslation } from "react-i18next";
import {
	PROJECT_STATUS_DOT_COLORS,
	PROJECT_STATUS_STYLES,
} from "../utils/projectConstants";

const ProjectStatusBadge = ({ status }) => {
	const { t } = useTranslation();

	if (!status) {
		return <span className="text-sm text-muted">—</span>;
	}

	const styles =
		PROJECT_STATUS_STYLES[status] ??
		"bg-background text-muted ring-1 ring-inset ring-border";
	const dot = PROJECT_STATUS_DOT_COLORS[status] ?? "bg-muted";
	const label = t(`projects.status.${status}`, { defaultValue: status });

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

export default ProjectStatusBadge;
