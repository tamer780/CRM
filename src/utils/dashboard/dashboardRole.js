import { getUserRole } from "../../features/users/utils/userConstants";

const MANAGER_ROLES = new Set(["admin", "leader", "supervisor"]);

/**
 * Resolve dashboard layout variant from the authenticated user.
 * Unknown / empty roles default to "manager" (safer for open-nav CRM).
 */
export function getDashboardVariant(user) {
	const role = getUserRole(user);
	if (role === "sales") return "sales";
	if (MANAGER_ROLES.has(role)) return "manager";
	return "manager";
}

export function getCurrentUserId(user) {
	if (!user) return null;
	const id = user.id ?? user.user_id;
	if (id == null || id === "") return null;
	return id;
}
