export function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

function labelFromEntity(item) {
	if (!item) return null;
	return item.name ?? item.title ?? null;
}

/**
 * Prefer lookup-map name when available (admin lists).
 * Otherwise show the id from the leads API as-is.
 */
export function resolveEntityLabel(map, id) {
	if (id == null || id === "") return "—";
	const item = map?.get?.(Number(id)) ?? map?.get?.(String(id));
	const name = labelFromEntity(item);
	if (name) return name;
	return String(id);
}

export function resolveProjectLabel(map, lead) {
	return resolveEntityLabel(map, lead?.project_id);
}

export function resolveCampaignLabel(map, lead) {
	return resolveEntityLabel(map, lead?.campaign_id);
}

export function resolveUserLabel(map, id) {
	if (id == null || id === "") return "—";
	const user = map?.get?.(Number(id)) ?? map?.get?.(String(id));
	if (!user) return String(id);
	return user.name ?? user.email ?? String(id);
}
