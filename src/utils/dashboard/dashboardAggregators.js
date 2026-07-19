/**
 * Pure dashboard aggregators derived from existing list / KPI payloads.
 * No network calls — consumers pass already-fetched data.
 */

import {
	hasAssignee,
	isOpenLead,
	isOverdue,
	isSameLocalDay,
	parseDate,
} from "./attentionHelpers";

function normalizeScopeIds(scopeUserId) {
	if (scopeUserId == null || scopeUserId === "") return null;
	if (Array.isArray(scopeUserId)) {
		const ids = scopeUserId.map(String).filter(Boolean);
		return ids.length > 0 ? ids : null;
	}
	return [String(scopeUserId)];
}

function matchesScopeAssignee(value, scopeIds) {
	if (!scopeIds) return true;
	if (!hasAssignee(value)) return false;
	return scopeIds.includes(String(value));
}

function scopeLeads(leads, scopeUserId) {
	const list = leads ?? [];
	const scopeIds = normalizeScopeIds(scopeUserId);
	if (!scopeIds) return list;
	return list.filter((lead) => matchesScopeAssignee(lead.assigned_to, scopeIds));
}

function scopeActions(actions, scopeUserId) {
	const list = actions ?? [];
	const scopeIds = normalizeScopeIds(scopeUserId);
	if (!scopeIds) return list;
	return list.filter((action) =>
		matchesScopeAssignee(action.assigned_to, scopeIds),
	);
}

function pendingActions(actions) {
	return (actions ?? []).filter((action) => action.status === "pending");
}

/**
 * Build today's schedule timeline from scheduled actions + lead follow-ups.
 */
export function buildTodaySchedule({
	leads = [],
	scheduledActions = [],
	scopeUserId = null,
	now = new Date(),
} = {}) {
	const items = [];

	for (const action of pendingActions(scopeActions(scheduledActions, scopeUserId))) {
		const at = action.scheduled_at;
		if (!at || !isSameLocalDay(at, now)) continue;
		const dueAt = parseDate(at);
		items.push({
			kind: "scheduled_action",
			id: `action-${action.id}`,
			entityId: action.id,
			leadId: action.lead_id ?? null,
			title: action.type
				? String(action.type).replaceAll("_", " ")
				: "Action",
			subtitle:
				action.lead_id != null
					? `Lead #${action.lead_id}`
					: action.client_id != null
						? `Client #${action.client_id}`
						: "",
			href:
				action.id != null
					? `/scheduled-actions?status=pending&selected=${action.id}`
					: "/scheduled-actions?status=pending",
			status: isOverdue(at, now) ? "overdue" : "due_today",
			dueAt: dueAt ? dueAt.toISOString() : null,
			sortAt: dueAt ? dueAt.getTime() : Number.POSITIVE_INFINITY,
			type: action.type ?? "task",
			assignedTo: action.assigned_to ?? null,
		});
	}

	for (const lead of scopeLeads(leads, scopeUserId).filter(isOpenLead)) {
		const at = lead.next_follow_up_at;
		if (!at || !isSameLocalDay(at, now)) continue;
		const dueAt = parseDate(at);
		items.push({
			kind: "lead_follow_up",
			id: `followup-${lead.id}`,
			entityId: lead.id,
			leadId: lead.id,
			title: lead.name ?? `Lead #${lead.id}`,
			subtitle: lead.status ?? "follow_up",
			href: lead.id != null ? `/leads?selected=${lead.id}` : "/leads",
			status: isOverdue(at, now) ? "overdue" : "due_today",
			dueAt: dueAt ? dueAt.toISOString() : null,
			sortAt: dueAt ? dueAt.getTime() : Number.POSITIVE_INFINITY,
			type: "follow_up",
			assignedTo: lead.assigned_to ?? null,
		});
	}

	return items.sort((a, b) => a.sortAt - b.sortAt);
}

/** Funnel stages mapped from existing lead statuses */
export const FUNNEL_STAGES = [
	{ key: "new", statuses: ["new"] },
	{ key: "contacted", statuses: ["contacted", "no_answer"] },
	{ key: "meeting", statuses: ["meeting_scheduled"] },
	{ key: "qualified", statuses: ["qualified"] },
	{ key: "converted", statuses: ["converted"] },
];

/**
 * Aggregate lead statuses into funnel stages with conversion / drop-off %.
 */
export function buildSalesFunnel({
	leads = [],
	scopeUserId = null,
} = {}) {
	const scoped = scopeLeads(leads, scopeUserId);
	const stages = FUNNEL_STAGES.map((stage) => {
		const statusSet = new Set(stage.statuses);
		const count = scoped.filter((lead) => statusSet.has(lead.status)).length;
		return { key: stage.key, count };
	});

	return stages.map((stage, index) => {
		const prev = index === 0 ? null : stages[index - 1];
		const prevCount = prev?.count ?? 0;
		const conversionFromPrev =
			index === 0
				? 100
				: prevCount > 0
					? (stage.count / prevCount) * 100
					: stage.count > 0
						? 100
						: 0;
		const dropOff =
			index === 0
				? 0
				: prevCount > 0
					? Math.max(0, ((prevCount - stage.count) / prevCount) * 100)
					: 0;

		return {
			...stage,
			conversionFromPrev,
			dropOff,
		};
	});
}

/**
 * KPI strip metrics derived from leads + optional management/sales KPI payloads.
 */
export function buildKpiStrip({
	leads = [],
	scopeUserId = null,
	management = null,
	salesKpis = null,
	teams = [],
	variant = "manager",
	now = new Date(),
} = {}) {
	const scoped = scopeLeads(leads, scopeUserId);
	const newToday = scoped.filter((lead) =>
		isSameLocalDay(lead.created_at, now),
	).length;
	const qualified = scoped.filter((lead) => lead.status === "qualified").length;
	const converted = scoped.filter((lead) => lead.status === "converted").length;

	const totalLeads =
		variant === "manager" && management?.leads != null
			? Number(management.leads) || 0
			: scoped.length;

	const avg = (list, key) => {
		if (!Array.isArray(list) || list.length === 0) return null;
		const sum = list.reduce((acc, row) => acc + (Number(row?.[key]) || 0), 0);
		return sum / list.length;
	};

	let contactRate = null;
	let conversionRate = null;

	if (variant === "sales" && salesKpis) {
		contactRate =
			salesKpis.contact_rate != null ? Number(salesKpis.contact_rate) : null;
		conversionRate =
			salesKpis.conversion_rate != null
				? Number(salesKpis.conversion_rate)
				: null;
	} else if (teams.length > 0) {
		contactRate = avg(teams, "contact_rate");
		conversionRate = avg(teams, "conversion_rate");
	}

	const qualifiedCount =
		variant === "sales" && salesKpis?.qualified != null
			? Number(salesKpis.qualified)
			: qualified;
	const convertedCount =
		variant === "sales" && salesKpis?.converted != null
			? Number(salesKpis.converted)
			: converted;

	return {
		totalLeads,
		newToday,
		qualified: qualifiedCount,
		converted: convertedCount,
		contactRate,
		conversionRate,
	};
}

/**
 * Rank teams for leaderboard. Gold accent on rank 1.
 */
export function buildTeamLeaderboard(teams = [], teamNamesById = {}) {
	const list = [...(teams ?? [])].sort((a, b) => {
		const convDiff =
			(Number(b.conversion_rate) || 0) - (Number(a.conversion_rate) || 0);
		if (convDiff !== 0) return convDiff;
		return (Number(b.total_assigned) || 0) - (Number(a.total_assigned) || 0);
	});

	return list.map((team, index) => {
		const id = team.team_id ?? team.id;
		return {
			...team,
			rank: index + 1,
			displayName:
				teamNamesById[String(id)] ??
				team.name ??
				(id != null ? `Team #${id}` : "Team"),
			isTop: index === 0,
			isLowContact: (Number(team.contact_rate) || 0) < 50,
		};
	});
}

/**
 * Lead growth series from created_at (last N days).
 */
export function buildLeadGrowthSeries({
	leads = [],
	scopeUserId = null,
	days = 14,
	now = new Date(),
} = {}) {
	const scoped = scopeLeads(leads, scopeUserId);
	const buckets = [];

	for (let i = days - 1; i >= 0; i -= 1) {
		const day = new Date(now);
		day.setHours(0, 0, 0, 0);
		day.setDate(day.getDate() - i);
		const key = day.toISOString().slice(0, 10);
		buckets.push({ date: key, label: key.slice(5), count: 0 });
	}

	const indexByDate = Object.fromEntries(
		buckets.map((b, i) => [b.date, i]),
	);

	for (const lead of scoped) {
		const created = parseDate(lead.created_at);
		if (!created) continue;
		const key = created.toISOString().slice(0, 10);
		const idx = indexByDate[key];
		if (idx != null) buckets[idx].count += 1;
	}

	return buckets;
}

/**
 * Open leads for card grid (newest / most urgent first).
 */
export function buildLeadCards({
	leads = [],
	scopeUserId = null,
	limit = 8,
} = {}) {
	return scopeLeads(leads, scopeUserId)
		.filter(isOpenLead)
		.sort((a, b) => {
			const aTime = parseDate(a.next_follow_up_at)?.getTime()
				?? parseDate(a.created_at)?.getTime()
				?? 0;
			const bTime = parseDate(b.next_follow_up_at)?.getTime()
				?? parseDate(b.created_at)?.getTime()
				?? 0;
			return aTime - bTime;
		})
		.slice(0, limit);
}

export { hasAssignee, isOpenLead, scopeLeads };
