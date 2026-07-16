import { Navigate, Outlet } from "react-router-dom";
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
