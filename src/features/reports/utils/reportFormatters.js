export function formatNumber(value, options = {}) {
	if (value == null || value === "") return "—";
	const n = Number(value);
	if (!Number.isFinite(n)) return String(value);
	return n.toLocaleString(undefined, {
		maximumFractionDigits: 2,
		...options,
	});
}

export function formatInteger(value) {
	if (value == null || value === "") return "—";
	const n = Number(value);
	if (!Number.isFinite(n)) return String(value);
	return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatMoney(value) {
	if (value == null || value === "") return "—";
	const n = Number(value);
	if (!Number.isFinite(n)) return String(value);
	return n.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatRatio(value) {
	if (value == null || value === "") return "—";
	const n = Number(value);
	if (!Number.isFinite(n)) return String(value);
	return n.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatRoi(value) {
	if (value == null || value === "") return "—";
	const n = Number(value);
	if (!Number.isFinite(n)) return String(value);
	const formatted = n.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	return `${formatted}%`;
}

export function roiToneClass(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return "text-muted";
	if (n > 0) return "text-emerald-700";
	if (n < 0) return "text-red-600";
	return "text-muted";
}
