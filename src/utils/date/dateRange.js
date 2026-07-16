function toLocalDateString(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getLast30DaysRange() {
	const to = new Date();
	const from = new Date();
	from.setDate(from.getDate() - 29);

	return {
		date_from: toLocalDateString(from),
		date_to: toLocalDateString(to),
	};
}
