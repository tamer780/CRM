const IGNORED_KEYS = new Set([
	"updated_at",
	"created_at",
	"normalized_phone",
	"deleted_at",
]);

/** High-signal fields shown first in diffs. */
export const PRIORITY_DIFF_KEYS = [
	"status",
	"assigned_to",
	"lost_reason",
	"project_id",
	"campaign_id",
	"lost_at",
	"qualified_at",
	"note",
	"last_communication_note",
	"scheduled_call_at",
	"next_follow_up_at",
];

function valuesEqual(a, b) {
	if (a === b) return true;
	if (a == null && b == null) return true;
	try {
		return JSON.stringify(a) === JSON.stringify(b);
	} catch {
		return String(a) === String(b);
	}
}

/**
 * Returns changed fields between activity old_value / new_value snapshots.
 * @returns {{ key: string, from: unknown, to: unknown }[]}
 */
export function getChangedFields(oldValue, newValue) {
	if (
		(oldValue == null || typeof oldValue !== "object") &&
		(newValue == null || typeof newValue !== "object")
	) {
		return [];
	}

	const oldObj = oldValue && typeof oldValue === "object" ? oldValue : {};
	const newObj = newValue && typeof newValue === "object" ? newValue : {};
	const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

	const changes = [];
	for (const key of keys) {
		if (IGNORED_KEYS.has(key)) continue;
		if (valuesEqual(oldObj[key], newObj[key])) continue;
		changes.push({
			key,
			from: oldObj[key] ?? null,
			to: newObj[key] ?? null,
		});
	}

	const priorityIndex = new Map(
		PRIORITY_DIFF_KEYS.map((k, i) => [k, i]),
	);
	changes.sort((a, b) => {
		const ai = priorityIndex.has(a.key)
			? priorityIndex.get(a.key)
			: PRIORITY_DIFF_KEYS.length;
		const bi = priorityIndex.has(b.key)
			? priorityIndex.get(b.key)
			: PRIORITY_DIFF_KEYS.length;
		if (ai !== bi) return ai - bi;
		return a.key.localeCompare(b.key);
	});

	return changes;
}

export function sortActivitiesDesc(activities) {
	return [...(activities ?? [])].sort((a, b) => {
		const ta = new Date(a?.occurred_at ?? a?.created_at ?? 0).getTime();
		const tb = new Date(b?.occurred_at ?? b?.created_at ?? 0).getTime();
		return tb - ta;
	});
}

export function sortCommentsDesc(comments) {
	return [...(comments ?? [])].sort((a, b) => {
		const ta = new Date(a?.created_at ?? 0).getTime();
		const tb = new Date(b?.created_at ?? 0).getTime();
		return tb - ta;
	});
}

export function sortAssignmentsDesc(assignments) {
	return [...(assignments ?? [])].sort((a, b) => {
		const ta = new Date(a?.assigned_at ?? a?.created_at ?? 0).getTime();
		const tb = new Date(b?.assigned_at ?? b?.created_at ?? 0).getTime();
		return tb - ta;
	});
}
