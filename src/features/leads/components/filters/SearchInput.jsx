import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const SearchInput = ({ value, onChange, className = "" }) => {
	const { t } = useTranslation();

	return (
		<label
			className={`relative min-w-[12rem] flex-1 basis-full sm:basis-64 ${className}`}
		>
			<span className="sr-only">{t("leads.searchPlaceholder")}</span>
			<Search
				className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
				aria-hidden="true"
			/>
			<input
				type="search"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={t("leads.searchPlaceholder")}
				className="w-full rounded-xl border border-border bg-surface py-2.5 pe-3 ps-10 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
			/>
		</label>
	);
};

export default SearchInput;
