import { REPORT_TABS } from "../utils/reportFilters";
import { useTranslation } from "react-i18next";

const ReportsTabs = ({ tab, onTabChange }) => {
	const { t } = useTranslation();

	return (
		<nav
			className="flex gap-1 overflow-x-auto border-b border-border pb-px"
			aria-label={t("reports.tabsLabel")}
		>
			{REPORT_TABS.map((id) => {
				const isActive = tab === id;
				return (
					<button
						key={id}
						type="button"
						onClick={() => onTabChange(id)}
						className={[
							"shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
							isActive
								? "border-b-2 border-gold text-text"
								: "text-muted hover:text-text",
						].join(" ")}
					>
						{t(`reports.tabs.${id}`)}
					</button>
				);
			})}
		</nav>
	);
};

export default ReportsTabs;
