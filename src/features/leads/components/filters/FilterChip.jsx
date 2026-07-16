import { X } from "lucide-react";

const FilterChip = ({ label, onRemove }) => (
	<span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-text transition hover:border-gold/40 hover:bg-light-gold/40">
		<span className="truncate">{label}</span>
		<button
			type="button"
			onClick={onRemove}
			aria-label={`Remove ${label}`}
			className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-text"
		>
			<X className="size-3" aria-hidden="true" />
		</button>
	</span>
);

export default FilterChip;
