import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthMe } from "../../hooks/auth/useAuthMe";
import { canAccessPath } from "../../features/users/utils/permissions";
import { getUserRole } from "../../features/users/utils/userConstants";
import { getToken } from "../../utils/token/tokenStorage";

export function ProtectedRoute() {
	if (!getToken()) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}

export function GuestRoute() {
	if (getToken()) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}

export function RootRedirect() {
	return <Navigate to={getToken() ? "/dashboard" : "/login"} replace />;
}

export function RoleRoute() {
	const location = useLocation();
	const { data: user, isLoading, isError } = useAuthMe();

	if (isLoading) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
				Loading…
			</div>
		);
	}

	if (isError || !user) {
		return <Navigate to="/login" replace />;
	}

	if (!canAccessPath(user, location.pathname)) {
		// Avoid redirect loop when even /dashboard is denied (unknown role).
		if (location.pathname === "/dashboard") {
			const role = getUserRole(user) || "unknown";
			return (
				<div className="mx-auto max-w-lg space-y-2 rounded-2xl border border-border bg-surface p-6 text-sm text-text">
					<p className="font-semibold">Access not configured for this account.</p>
					<p className="text-muted">
						Signed-in role: <span className="font-medium text-text">{role}</span>
					</p>
					<p className="text-muted">
						Ask an administrator to assign a supported role (superadmin, admin,
						leader, supervisor, or sales).
					</p>
				</div>
			);
		}
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}
