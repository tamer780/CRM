import { useMemo } from "react";
import {
	assignableRoles,
	can,
	canAccessPath,
	canManageUser,
	getDataScope,
} from "../../features/users/utils/permissions";
import { getUserRole } from "../../features/users/utils/userConstants";
import { useTeams } from "../teams/useTeams";
import { useUsers } from "../users/useUsers";
import { useAuthMe } from "./useAuthMe";

export function usePermissions() {
	const authQuery = useAuthMe();
	const user = authQuery.data;
	const role = getUserRole(user);
	const needsTeamScope = role === "leader" || role === "supervisor";

	const teamsQuery = useTeams({
		enabled: Boolean(user) && needsTeamScope,
	});
	const usersQuery = useUsers({
		enabled: Boolean(user) && needsTeamScope,
	});

	const scopeLoading =
		needsTeamScope &&
		(teamsQuery.isLoading || usersQuery.isLoading);

	const scope = useMemo(
		() =>
			getDataScope(
				user,
				teamsQuery.data ?? [],
				usersQuery.data ?? [],
			),
		[user, teamsQuery.data, usersQuery.data],
	);

	return {
		user,
		role,
		scope,
		isLoading: authQuery.isLoading || scopeLoading,
		isAuthLoading: authQuery.isLoading,
		isError: authQuery.isError,
		can: (permission) => can(user, permission),
		canAccessPath: (path) => canAccessPath(user, path),
		canManageUser: (target) => canManageUser(user, target),
		assignableRoles: () => assignableRoles(user),
	};
}
