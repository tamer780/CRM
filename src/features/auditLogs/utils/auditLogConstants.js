function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

export function shortModelName(auditableType) {
	if (!auditableType) return "";
	const parts = String(auditableType).split(/\\|\//);
	return parts[parts.length - 1] || String(auditableType);
}

export function formatJson(value) {
	if (value == null) return null;
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

export function hasOldValues(log) {
	return log?.old_values != null && typeof log.old_values === "object";
}

export function computeAuditLogKpis(list) {
	const items = list ?? [];
	const total = items.length;
	let changes = 0;
	let creates = 0;
	const actors = new Set();

	for (const item of items) {
		if (hasOldValues(item)) changes += 1;
		else creates += 1;
		if (item.user_id != null) actors.add(String(item.user_id));
	}

	return {
		total,
		changes,
		creates,
		actors: actors.size,
		totalShare: "100%",
		changesShare: shareOfTotal(changes, total),
		createsShare: shareOfTotal(creates, total),
		actorsShare: shareOfTotal(actors.size, total),
	};
}

export function collectUniqueActions(list) {
	const set = new Set();
	for (const item of list ?? []) {
		if (item?.action) set.add(item.action);
	}
	return Array.from(set).sort();
}

export function collectUniqueModels(list) {
	const set = new Set();
	for (const item of list ?? []) {
		const name = shortModelName(item?.auditable_type);
		if (name) set.add(name);
	}
	return Array.from(set).sort();
}
