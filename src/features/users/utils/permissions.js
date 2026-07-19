import {
	getUserRole,
	getUserTeamId,
	USER_ROLES,
} from "./userConstants";
import { getCurrentUserId } from "../../../utils/dashboard/dashboardRole";

export const ROLES = {
	SUPER_ADMIN: "superadmin",
	ADMIN: "admin",
	LEADER: "leader",
	SUPERVISOR: "supervisor",
	SALES: "sales",
};

export const PERMISSIONS = {
	DASHBOARD_VIEW: "dashboard.view",
	LEADS_VIEW: "leads.view",
	LEADS_EDIT: "leads.edit",
	LEADS_DELETE: "leads.delete",
	LEADS_IMPORT: "leads.import",
	CLIENTS_VIEW: "clients.view",
	KPI_VIEW: "kpi.view",
	REPORTS_VIEW: "reports.view",
	PENDING_VIEW: "pending.view",
	SCHEDULED_VIEW: "scheduled.view",
	MEETINGS_VIEW: "meetings.view",
	CAMPAIGNS_VIEW: "campaigns.view",
	PROJECTS_VIEW: "projects.view",
	USERS_MANAGE: "users.manage",
	TEAMS_MANAGE: "teams.manage",
	AUDIT_VIEW: "audit.view",
	USERS_MANAGE_SUPERADMINS: "users.manageSuperAdmins",
};

const SALES_OPS = [
	PERMISSIONS.DASHBOARD_VIEW,
	PERMISSIONS.LEADS_VIEW,
	PERMISSIONS.LEADS_EDIT,
	PERMISSIONS.LEADS_DELETE,
	PERMISSIONS.LEADS_IMPORT,
	PERMISSIONS.CLIENTS_VIEW,
	PERMISSIONS.KPI_VIEW,
	PERMISSIONS.REPORTS_VIEW,
	PERMISSIONS.PENDING_VIEW,
	PERMISSIONS.SCHEDULED_VIEW,
	PERMISSIONS.MEETINGS_VIEW,
];

const ADMIN_PERMS = [
	...SALES_OPS,
	PERMISSIONS.CAMPAIGNS_VIEW,
	PERMISSIONS.PROJECTS_VIEW,
	PERMISSIONS.USERS_MANAGE,
	PERMISSIONS.TEAMS_MANAGE,
];

export const ROLE_PERMISSIONS = {
	[ROLES.SUPER_ADMIN]: [
		...ADMIN_PERMS,
		PERMISSIONS.AUDIT_VIEW,
		PERMISSIONS.USERS_MANAGE_SUPERADMINS,
	],
	[ROLES.ADMIN]: ADMIN_PERMS,
	[ROLES.LEADER]: SALES_OPS,
	[ROLES.SUPERVISOR]: SALES_OPS,
	[ROLES.SALES]: [
		PERMISSIONS.DASHBOARD_VIEW,
		PERMISSIONS.LEADS_VIEW,
		PERMISSIONS.CLIENTS_VIEW,
		PERMISSIONS.KPI_VIEW,
		PERMISSIONS.MEETINGS_VIEW,
	],
};

export const PATH_PERMISSIONS = {
	"/dashboard": PERMISSIONS.DASHBOARD_VIEW,
	"/leads": PERMISSIONS.LEADS_VIEW,
	"/clients": PERMISSIONS.CLIENTS_VIEW,
	"/kpi": PERMISSIONS.KPI_VIEW,
	"/reports": PERMISSIONS.REPORTS_VIEW,
	"/pending-leads": PERMISSIONS.PENDING_VIEW,
	"/scheduled-actions": PERMISSIONS.SCHEDULED_VIEW,
	"/meetings": PERMISSIONS.MEETINGS_VIEW,
	"/campaigns": PERMISSIONS.CAMPAIGNS_VIEW,
	"/projects": PERMISSIONS.PROJECTS_VIEW,
	"/users": PERMISSIONS.USERS_MANAGE,
	"/teams": PERMISSIONS.TEAMS_MANAGE,
	"/audit-logs": PERMISSIONS.AUDIT_VIEW,
};

function permissionSet(user) {
	const role = getUserRole(user);
	return new Set(ROLE_PERMISSIONS[role] ?? []);
}

export function can(user, permission) {
	if (!user || !permission) return false;
	return permissionSet(user).has(permission);
}

export function canAccessPath(user, path) {
	if (!user || !path) return false;
	const permission = PATH_PERMISSIONS[path];
	if (!permission) return false;
	return can(user, permission);
}

export function canManageUser(actor, target) {
	if (!actor || !target) return false;
	if (!can(actor, PERMISSIONS.USERS_MANAGE)) return false;
	const targetRole = getUserRole(target);
	if (targetRole === ROLES.SUPER_ADMIN) {
		return can(actor, PERMISSIONS.USERS_MANAGE_SUPERADMINS);
	}
	return true;
}

export function assignableRoles(actor) {
	if (!actor) return [];
	if (!can(actor, PERMISSIONS.USERS_MANAGE)) return [];
	if (can(actor, PERMISSIONS.USERS_MANAGE_SUPERADMINS)) {
		return [...USER_ROLES];
	}
	return USER_ROLES.filter((role) => role !== ROLES.SUPER_ADMIN);
}

function collectTeamIds(user, teams, matchKey) {
	const userId = getCurrentUserId(user);
	if (userId == null) return [];

	const matched = (teams ?? [])
		.filter((team) => String(team?.[matchKey]) === String(userId))
		.map((team) => Number(team.id))
		.filter((id) => Number.isFinite(id) && id !== 0);

	if (matched.length > 0) return [...new Set(matched)];

	const fallback = getUserTeamId(user);
	return fallback != null ? [fallback] : [];
}

function assigneeIdsForTeams(teamIds, users) {
	if (!teamIds?.length) return [];
	const teamSet = new Set(teamIds.map(String));
	const ids = [];
	for (const member of users ?? []) {
		const teamId = getUserTeamId(member);
		if (teamId == null) continue;
		if (!teamSet.has(String(teamId))) continue;
		const id = getCurrentUserId(member);
		if (id == null) continue;
		ids.push(id);
	}
	return [...new Set(ids.map(String))];
}

/**
 * @returns {{
 *   type: "all" | "team" | "own",
 *   teamIds: number[],
 *   userId: string | number | null,
 *   assigneeIds: string[],
 * }}
 */
export function getDataScope(user, teams = [], users = []) {
	const role = getUserRole(user);
	const userId = getCurrentUserId(user);

	if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) {
		return { type: "all", teamIds: [], userId: null, assigneeIds: [] };
	}

	if (role === ROLES.SALES) {
		return {
			type: "own",
			teamIds: [],
			userId,
			assigneeIds: userId != null ? [String(userId)] : [],
		};
	}

	if (role === ROLES.LEADER || role === ROLES.SUPERVISOR) {
		const matchKey =
			role === ROLES.LEADER ? "team_leader_id" : "supervisor_id";
		const teamIds = collectTeamIds(user, teams, matchKey);
		const assignees = assigneeIdsForTeams(teamIds, users);
		return {
			type: "team",
			teamIds,
			userId,
			assigneeIds:
				assignees.length > 0
					? assignees
					: userId != null
						? [String(userId)]
						: [],
		};
	}

	return { type: "all", teamIds: [], userId: null, assigneeIds: [] };
}

/** Merge UI assigned_to filter with role scope for leads API. */
export function scopeToLeadAssignedTo(scope, filterAssignedTo = []) {
	const filter = Array.isArray(filterAssignedTo)
		? filterAssignedTo.map(String).filter(Boolean)
		: filterAssignedTo
			? [String(filterAssignedTo)]
			: [];

	if (!scope || scope.type === "all") return filter;

	const allowed = scope.assigneeIds ?? [];
	if (allowed.length === 0) return ["__none__"];

	if (filter.length === 0) return allowed;

	const allowedSet = new Set(allowed.map(String));
	const intersected = filter.filter((id) => allowedSet.has(String(id)));
	return intersected.length > 0 ? intersected : ["__none__"];
}

export function scopeToReportParams(scope) {
	if (!scope || scope.type === "all") return {};
	if (scope.type === "own" && scope.userId != null) {
		return { userId: String(scope.userId) };
	}
	if (scope.type === "team" && scope.teamIds?.length > 0) {
		return { teamId: String(scope.teamIds[0]) };
	}
	return {};
}

export function clientMatchesScope(client, scope) {
	if (!scope || scope.type === "all") return true;
	const assigned = client?.assigned_to;
	if (assigned == null || assigned === "") return false;
	if (scope.type === "own") {
		return String(assigned) === String(scope.userId);
	}
	if (scope.type === "team") {
		return (scope.assigneeIds ?? []).some(
			(id) => String(id) === String(assigned),
		);
	}
	return true;
}
