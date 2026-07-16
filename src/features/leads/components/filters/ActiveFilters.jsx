import { useTranslation } from "react-i18next";
import FilterChip from "./FilterChip";

const ActiveFilters = ({ chips, onRemove, onClearAll }) => {
	const { t } = useTranslation();

	if (!chips?.length) return null;

	return (
		<div className="flex flex-wrap items-center gap-2 pt-1">
			{chips.map((chip) => (
				<FilterChip
					key={chip.id}
					label={chip.label}
					onRemove={() => onRemove(chip.id)}
				/>
			))}
			<button
				type="button"
				onClick={onClearAll}
				className="text-xs font-semibold text-muted transition hover:text-primary"
			>
				{t("leads.filters.clearAll")}
			</button>
		</div>
	);
};

export default ActiveFilters;
