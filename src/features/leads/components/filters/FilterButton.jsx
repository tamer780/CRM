import { ListFilter } from "lucide-react";
import { useTranslation } from "react-i18next";

const FilterButton = ({ count = 0, open = false, onClick, buttonRef }) => {
	const { t } = useTranslation();
	const label =
		count > 0
			? t("leads.filters.buttonWithCount", { count })
			: t("leads.filters.button");

	return (
		<button
			ref={buttonRef}
			type="button"
			aria-haspopup="dialog"
			aria-expanded={open}
			onClick={onClick}
			className={[
				"inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
				open || count > 0
					? "border-gold/40 bg-light-gold/50 text-primary"
					: "border-border bg-surface text-text hover:border-accent/50 hover:bg-background",
			].join(" ")}
		>
			<ListFilter className="size-4 shrink-0" aria-hidden="true" />
			<span>{label}</span>
			{count > 0 && (
				<span className="inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
					{count}
				</span>
			)}
		</button>
	);
};

export default FilterButton;
