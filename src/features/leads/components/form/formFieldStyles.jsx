const baseInputClass =
	"w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-sm font-medium text-text";

export function fieldClassName({ error, className } = {}) {
	return [
		baseInputClass,
		error
			? "border-red-400 ring-1 ring-red-100 focus:border-red-400 focus:ring-red-100"
			: "border-border",
		className,
	]
		.filter(Boolean)
		.join(" ");
}

export function FieldLabel({ htmlFor, label, required }) {
	if (!label) return null;
	return (
		<label htmlFor={htmlFor} className={labelClass}>
			{label}
			{required ? <span className="text-red-500"> *</span> : null}
		</label>
	);
}

export function FieldMessage({ error, helperText }) {
	if (error) {
		return <p className="mt-1.5 text-xs text-red-600">{error}</p>;
	}
	if (helperText) {
		return <p className="mt-1.5 text-xs text-muted">{helperText}</p>;
	}
	return null;
}

export function FieldLoading() {
	return (
		<div className="h-10 w-full animate-pulse rounded-xl bg-border/50" aria-hidden="true" />
	);
}
