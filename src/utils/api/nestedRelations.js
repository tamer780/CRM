/** Display name from nested API relation ({ id, name, email }). */
export function nestedEntityName(entity) {
	if (!entity) return "—";
	return entity.name ?? entity.title ?? entity.email ?? "—";
}

/** Collect unique entities from loaded rows by relation key. */
export function collectNestedOptions(rows, relationKey) {
	const seen = new Map();
	for (const row of rows ?? []) {
		const entity = row?.[relationKey];
		if (entity?.id == null) continue;
		const id = String(entity.id);
		if (seen.has(id)) continue;
		seen.set(id, {
			id: entity.id,
			name: entity.name ?? entity.title ?? entity.email ?? `#${entity.id}`,
		});
	}
	return Array.from(seen.values()).sort((a, b) =>
		String(a.name).localeCompare(String(b.name)),
	);
}

/** Merge API list items with nested entities from loaded rows (dedupe by id). */
export function mergeEntityLists(apiList = [], rows = [], relationKey) {
	const seen = new Map();
	for (const item of apiList ?? []) {
		if (item?.id == null) continue;
		seen.set(String(item.id), item);
	}
	for (const option of collectNestedOptions(rows, relationKey)) {
		const key = String(option.id);
		if (!seen.has(key)) {
			seen.set(key, option);
		}
	}
	return Array.from(seen.values());
}

/** Resolve relation id from nested object or legacy *_id field. */
export function relationId(row, relationKey, idKey) {
	return row?.[relationKey]?.id ?? row?.[idKey] ?? null;
}
