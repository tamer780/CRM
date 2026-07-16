export function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

export function resolveEntityLabel(map, id) {
	if (id == null || id === "") return "—";
	const item = map?.get?.(Number(id)) ?? map?.get?.(String(id));
	if (!item) return String(id);
	return item.name ?? item.title ?? String(id);
}

export function resolveUserLabel(map, id) {
	if (id == null || id === "") return "—";
	const user = map?.get?.(Number(id)) ?? map?.get?.(String(id));
	if (!user) return String(id);
	return user.name ?? user.email ?? String(id);
}
