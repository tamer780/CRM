export function formatCurrency(value, currency = "EGP") {
	const n = Number(value);
	if (!Number.isFinite(n)) {
		return `${currency} 0`;
	}
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			maximumFractionDigits: 0,
			minimumFractionDigits: 0,
		}).format(n);
	} catch {
		return `${currency} ${n.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		})}`;
	}
}
