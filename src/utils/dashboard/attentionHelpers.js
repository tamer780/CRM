/**
 * Hybrid attention helpers.
 *
 * Today: compose from list payloads (leads, scheduledActions, pendingLeads).
 * Later: a GET /dashboards/attention response can feed the same shapes:
 *   computeAttentionSummary → { overdue, dueToday, unassigned, pendingDuplicates, myAssigned }
 *   buildWorkQueue → Array<{ kind, id, title, subtitle, href, urgency, dueAt, leadId? }>
 *   getTeamExceptions → Array<team>
 */

const TERMINAL_LEAD_STATUSES = new Set([
	"converted",
	"lost",
	"not_interested",
	"low_budget",
]);

const URGENCY_RANK = { overdue: 0, due_today: 1, unassigned: 2 };

export const DEFAULT_CONTACT_RATE_MIN = 50;
export const DEFAULT_WORK_QUEUE_LIMIT = 10;

export function parseDate(value) {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date;
}

export function isSameLocalDay(value, now = new Date()) {
	const date = parseDate(value);
	if (!date) return false;
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate()
	);
}

export function isOverdue(value, now = new Date()) {
	const date = parseDate(value);
	if (!date) return false;
	return date.getTime() < now.getTime();
}

export function hasAssignee(value) {
	return value != null && value !== "" && Number(value) !== 0;
}

export function sameAssignee(value, userId) {
	if (!hasAssignee(value) || userId == null || userId === "") return false;
	return String(value) === String(userId);
}

export function isOpenLead(lead) {
	if (!lead) return false;
	return !TERMINAL_LEAD_STATUSES.has(lead.status);
}

function scopeActions(actions, scopeUserId) {
	const list = actions ?? [];
	if (scopeUserId == null) return list;
	return list.filter((action) => sameAssignee(action.assigned_to, scopeUserId));
}

function scopeLeads(leads, scopeUserId) {
	const list = leads ?? [];
	if (scopeUserId == null) return list;
	return list.filter((lead) => sameAssignee(lead.assigned_to, scopeUserId));
}

function pendingActions(actions) {
	return (actions ?? []).filter((action) => action.status === "pending");
}

/**
 * @param {{
 *   leads?: Array,
 *   scheduledActions?: Array,
 *   pendingLeads?: Array,
 *   scopeUserId?: string|number|null,
 *   variant?: 'manager'|'sales',
 *   now?: Date,
 * }} input
 */
export function computeAttentionSummary({
	leads = [],
	scheduledActions = [],
	pendingLeads = [],
	scopeUserId = null,
	variant = "manager",
	now = new Date(),
} = {}) {
	const scopedActions = pendingActions(scopeActions(scheduledActions, scopeUserId));
	const scopedLeads = scopeLeads(leads, scopeUserId);
	const openLeads = scopedLeads.filter(isOpenLead);

	let overdue = 0;
	let dueToday = 0;

	for (const action of scopedActions) {
		const at = action.scheduled_at;
		if (!at) continue;
		if (isSameLocalDay(at, now)) {
			if (isOverdue(at, now)) overdue += 1;
			else dueToday += 1;
		} else if (isOverdue(at, now)) {
			overdue += 1;
		}
	}

	for (const lead of openLeads) {
		const at = lead.next_follow_up_at;
		if (!at) continue;
		if (isSameLocalDay(at, now)) {
			if (isOverdue(at, now)) overdue += 1;
			else dueToday += 1;
		} else if (isOverdue(at, now)) {
			overdue += 1;
		}
	}

	const unassigned =
		variant === "manager"
			? (leads ?? []).filter((lead) => isOpenLead(lead) && !hasAssignee(lead.assigned_to))
					.length
			: 0;

	const pendingDuplicates =
		variant === "manager"
			? (pendingLeads ?? []).filter((item) => item.duplicate_status === "pending")
					.length
			: 0;

	const myAssigned =
		variant === "sales" ? openLeads.filter((lead) => hasAssignee(lead.assigned_to)).length : 0;

	return {
		overdue,
		dueToday,
		unassigned,
		pendingDuplicates,
		myAssigned,
	};
}

function actionHref(action) {
	const id = action?.id;
	const base = "/scheduled-actions";
	if (id == null) return `${base}?status=pending`;
	return `${base}?status=pending&selected=${id}`;
}

function leadHref(lead) {
	const id = lead?.id;
	if (id == null) return "/leads";
	return `/leads?selected=${id}`;
}

function formatActionTitle(action) {
	const type = action?.type ? String(action.type).replaceAll("_", " ") : "Action";
	if (action?.lead_id != null) return `${type} · Lead #${action.lead_id}`;
	if (action?.client_id != null) return `${type} · Client #${action.client_id}`;
	return type;
}

function makeActionItem(action, urgency) {
	const dueAt = parseDate(action.scheduled_at);
	return {
		kind: "scheduled_action",
		id: `action-${action.id}`,
		entityId: action.id,
		leadId: action.lead_id ?? null,
		title: formatActionTitle(action),
		subtitle: action.type ?? "",
		href: actionHref(action),
		urgency,
		dueAt: dueAt ? dueAt.toISOString() : null,
		sortAt: dueAt ? dueAt.getTime() : Number.POSITIVE_INFINITY,
	};
}

function makeFollowUpItem(lead, urgency) {
	const dueAt = parseDate(lead.next_follow_up_at);
	return {
		kind: "lead_follow_up",
		id: `followup-${lead.id}`,
		entityId: lead.id,
		leadId: lead.id,
		title: lead.name ?? `Lead #${lead.id}`,
		subtitle: lead.status ?? "follow_up",
		href: leadHref(lead),
		urgency,
		dueAt: dueAt ? dueAt.toISOString() : null,
		sortAt: dueAt ? dueAt.getTime() : Number.POSITIVE_INFINITY,
	};
}

function makeUnassignedItem(lead) {
	return {
		kind: "unassigned_lead",
		id: `unassigned-${lead.id}`,
		entityId: lead.id,
		leadId: lead.id,
		title: lead.name ?? `Lead #${lead.id}`,
		subtitle: lead.status ?? "new",
		href: leadHref(lead),
		urgency: "unassigned",
		dueAt: lead.created_at ?? null,
		sortAt: parseDate(lead.created_at)?.getTime() ?? Number.POSITIVE_INFINITY,
	};
}

/**
 * Prefer scheduled action over lead follow-up for the same lead when both exist.
 */
function dedupeByLead(items) {
	const byLead = new Map();
	const withoutLead = [];

	for (const item of items) {
		if (item.leadId == null) {
			withoutLead.push(item);
			continue;
		}
		const key = String(item.leadId);
		const existing = byLead.get(key);
		if (!existing) {
			byLead.set(key, item);
			continue;
		}
		const existingRank = URGENCY_RANK[existing.urgency] ?? 99;
		const nextRank = URGENCY_RANK[item.urgency] ?? 99;
		if (nextRank < existingRank) {
			byLead.set(key, item);
			continue;
		}
		if (nextRank === existingRank) {
			// Prefer scheduled_action; else earlier due time
			if (
				item.kind === "scheduled_action" &&
				existing.kind !== "scheduled_action"
			) {
				byLead.set(key, item);
			} else if (item.sortAt < existing.sortAt) {
				byLead.set(key, item);
			}
		}
	}

	return [...byLead.values(), ...withoutLead];
}

/**
 * @param {{
 *   leads?: Array,
 *   scheduledActions?: Array,
 *   scopeUserId?: string|number|null,
 *   variant?: 'manager'|'sales',
 *   limit?: number,
 *   now?: Date,
 * }} input
 */
export function buildWorkQueue({
	leads = [],
	scheduledActions = [],
	scopeUserId = null,
	variant = "manager",
	limit = DEFAULT_WORK_QUEUE_LIMIT,
	now = new Date(),
} = {}) {
	const scopedActions = pendingActions(scopeActions(scheduledActions, scopeUserId));
	const scopedLeads = scopeLeads(leads, scopeUserId).filter(isOpenLead);

	const overdueActions = [];
	const dueTodayActions = [];
	const overdueFollowUps = [];
	const dueTodayFollowUps = [];

	for (const action of scopedActions) {
		const at = action.scheduled_at;
		if (!at) continue;
		if (isSameLocalDay(at, now)) {
			if (isOverdue(at, now)) overdueActions.push(makeActionItem(action, "overdue"));
			else dueTodayActions.push(makeActionItem(action, "due_today"));
		} else if (isOverdue(at, now)) {
			overdueActions.push(makeActionItem(action, "overdue"));
		}
	}

	for (const lead of scopedLeads) {
		const at = lead.next_follow_up_at;
		if (!at) continue;
		if (isSameLocalDay(at, now)) {
			if (isOverdue(at, now)) overdueFollowUps.push(makeFollowUpItem(lead, "overdue"));
			else dueTodayFollowUps.push(makeFollowUpItem(lead, "due_today"));
		} else if (isOverdue(at, now)) {
			overdueFollowUps.push(makeFollowUpItem(lead, "overdue"));
		}
	}

	const unassignedItems =
		variant === "manager"
			? (leads ?? [])
					.filter((lead) => isOpenLead(lead) && !hasAssignee(lead.assigned_to))
					.map(makeUnassignedItem)
			: [];

	const sortGroup = (items) =>
		[...items].sort((a, b) => a.sortAt - b.sortAt);

	const merged = dedupeByLead([
		...sortGroup(overdueActions),
		...sortGroup(overdueFollowUps),
		...sortGroup(dueTodayActions),
		...sortGroup(dueTodayFollowUps),
		...sortGroup(unassignedItems),
	]);

	merged.sort((a, b) => {
		const rankDiff =
			(URGENCY_RANK[a.urgency] ?? 99) - (URGENCY_RANK[b.urgency] ?? 99);
		if (rankDiff !== 0) return rankDiff;
		return a.sortAt - b.sortAt;
	});

	return merged.slice(0, limit);
}

export function getTeamExceptions(
	teams,
	{ contactRateMin = DEFAULT_CONTACT_RATE_MIN } = {},
) {
	const list = teams ?? [];
	return list
		.filter((team) => {
			const rate = Number(team.contact_rate);
			if (!Number.isFinite(rate)) return false;
			return rate < contactRateMin;
		})
		.sort((a, b) => (Number(a.contact_rate) || 0) - (Number(b.contact_rate) || 0));
}
