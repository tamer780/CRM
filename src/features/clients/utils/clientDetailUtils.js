export const CLIENT_DETAIL_TAB_ORDER = [
	"overview",
	"activities",
	"comments",
	"timeline",
	"scheduledActions",
];

export function clientDetailQueryKey(clientId) {
	return ["clients", "detail", String(clientId)];
}

function hasItems(value) {
	return Array.isArray(value) && value.length > 0;
}

export function normalizeClientDetail(data) {
	if (!data || typeof data !== "object") return data;

	return {
		...data,
		activities: Array.isArray(data.activities) ? data.activities : [],
		comments: Array.isArray(data.comments) ? data.comments : [],
		timeline: Array.isArray(data.timeline) ? data.timeline : [],
		scheduled_actions: Array.isArray(data.scheduled_actions)
			? data.scheduled_actions
			: [],
	};
}

export function mergeClientDetailCache(existing, patch) {
	if (!patch || typeof patch !== "object") return existing ?? patch;
	if (!existing || typeof existing !== "object") {
		return normalizeClientDetail(patch);
	}

	return normalizeClientDetail({
		...existing,
		...patch,
		activities: patch.activities ?? existing.activities,
		comments: patch.comments ?? existing.comments,
		timeline: patch.timeline ?? existing.timeline,
		scheduled_actions:
			patch.scheduled_actions ?? existing.scheduled_actions,
	});
}

export function formatClientDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function sortByOccurredAtDesc(items, dateKey = "occurred_at") {
	return [...(items ?? [])].sort((a, b) => {
		const aTs = new Date(a?.[dateKey] ?? a?.created_at ?? 0).getTime();
		const bTs = new Date(b?.[dateKey] ?? b?.created_at ?? 0).getTime();
		return bTs - aTs;
	});
}

export function dedupeTimeline(items) {
	const seen = new Set();
	return (items ?? []).filter((item) => {
		const key = `${item?.type ?? "unknown"}-${item?.data?.id ?? "none"}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export function getClientDetailTabs(client) {
	const tabs = ["overview"];

	if (hasItems(client?.activities)) tabs.push("activities");
	if (hasItems(client?.comments)) tabs.push("comments");
	if (hasItems(client?.timeline)) tabs.push("timeline");
	if (hasItems(client?.scheduled_actions)) tabs.push("scheduledActions");

	return tabs;
}

export function clientHasLostInfo(client) {
	if (!client) return false;
	return (
		client.status === "lost" ||
		Boolean(client.lost_at) ||
		Boolean(client.lost_reason) ||
		client.lost_by != null
	);
}

export function resolveActivityActor(activity) {
	return (
		activity?.user?.name ??
		(activity?.user_id != null ? `#${activity.user_id}` : null)
	);
}

export function resolveCommentAuthor(comment) {
	return (
		comment?.user?.name ??
		(comment?.user_id != null ? `#${comment.user_id}` : null)
	);
}

export function resolveUserName(users, userId) {
	if (userId == null) return null;
	const id = String(userId);
	const user = (users ?? []).find((entry) => String(entry.id) === id);
	if (!user) return `#${userId}`;
	return user.name ?? user.email ?? `#${userId}`;
}
