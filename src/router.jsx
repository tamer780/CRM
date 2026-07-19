import { createBrowserRouter } from "react-router-dom";
import {
	GuestRoute,
	ProtectedRoute,
	RoleRoute,
	RootRedirect,
} from "./components/auth/RouteGuards";
import AppLayout from "./components/layout/AppLayout";
import { comingSoonPaths } from "./components/layout/navConfig";
import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardPage from "./pages/DashboardPage";
import KpiPage from "./pages/KpiPage";
import LeadsPage from "./pages/LeadsPage";
import LoginPage from "./pages/LoginPage";
import PendingLeadsPage from "./pages/PendingLeadsPage";
import CampaignsPage from "./pages/CampaignsPage";
import ClientsPage from "./pages/ClientsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamsPage from "./pages/TeamsPage";
import UsersPage from "./pages/UsersPage";
import ScheduledActionsPage from "./pages/ScheduledActionsPage";
import MeetingsPage from "./pages/MeetingsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import ReportsPage from "./pages/ReportsPage";
import RegisterPage from "./pages/RegisterPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootRedirect />,
	},
	{
		element: <GuestRoute />,
		children: [
			{
				path: "/login",
				element: <LoginPage />,
			},
			{
				path: "/register",
				element: <RegisterPage />,
			},
		],
	},
	{
		element: <ProtectedRoute />,
		children: [
			{
				element: <AppLayout />,
				children: [
					{
						element: <RoleRoute />,
						children: [
							{
								path: "/dashboard",
								element: <DashboardPage />,
							},
							{
								path: "/kpi",
								element: <KpiPage />,
							},
							{
								path: "/reports",
								element: <ReportsPage />,
							},
							{
								path: "/leads",
								element: <LeadsPage />,
							},
							{
								path: "/pending-leads",
								element: <PendingLeadsPage />,
							},
							{
								path: "/campaigns",
								element: <CampaignsPage />,
							},
							{
								path: "/clients",
								element: <ClientsPage />,
							},
							{
								path: "/projects",
								element: <ProjectsPage />,
							},
							{
								path: "/teams",
								element: <TeamsPage />,
							},
							{
								path: "/users",
								element: <UsersPage />,
							},
							{
								path: "/scheduled-actions",
								element: <ScheduledActionsPage />,
							},
							{
								path: "/meetings",
								element: <MeetingsPage />,
							},
							{
								path: "/audit-logs",
								element: <AuditLogsPage />,
							},
							...comingSoonPaths.map((path) => ({
								path,
								element: <ComingSoonPage />,
							})),
						],
					},
				],
			},
		],
	},
]);

export default router;
