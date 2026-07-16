import { lazy, Suspense, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthMe } from "../hooks/auth/useAuthMe";
import { useCampaigns } from "../hooks/campaigns/useCampaigns";
import { useManagementDashboard } from "../hooks/dashboards/useManagementDashboard";
import { useSalesKpis } from "../hooks/health/useSalesKpis";
import { useTeamKpis } from "../hooks/health/useTeamKpis";
import { useLeads } from "../hooks/leads/useLeads";
import { usePendingLeads } from "../hooks/pendingLeads/usePendingLeads";
import { useProjects } from "../hooks/projects/useProjects";
import { useScheduledActions } from "../hooks/scheduledActions/useScheduledActions";
import { useTeams } from "../hooks/teams/useTeams";
import { useUsers } from "../hooks/users/useUsers";
import AttentionQueue from "../components/dashboard/AttentionQueue";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import KpiStrip from "../components/dashboard/KpiStrip";
import LeadCardsGrid from "../components/dashboard/LeadCardsGrid";
import LoadingSkeleton from "../components/dashboard/LoadingSkeleton";
import NeedsAttentionHero from "../components/dashboard/NeedsAttentionHero";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import {
	buildWorkQueue,
	computeAttentionSummary,
} from "../utils/dashboard/attentionHelpers";
import {
	buildKpiStrip,
	buildLeadCards,
	buildTeamLeaderboard,
	buildTodaySchedule,
} from "../utils/dashboard/dashboardAggregators";
import {
	getCurrentUserId,
	getDashboardVariant,
} from "../utils/dashboard/dashboardRole";
import { getLast30DaysRange } from "../utils/date/dateRange";

const TeamLeaderboard = lazy(
	() => import("../components/dashboard/TeamLeaderboard"),
);
const ProjectsOverview = lazy(
	() => import("../components/dashboard/ProjectsOverview"),
);
const CampaignsOverview = lazy(
	() => import("../components/dashboard/CampaignsOverview"),
);

const DashboardPage = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { data: user, isLoading: userLoading } = useAuthMe();

	const roleReady = !userLoading;
	const variant = getDashboardVariant(user);
	const userId = getCurrentUserId(user);
	const isManager = variant === "manager";
	const scopeUserId = variant === "sales" ? userId : null;
	const fallbackRange = useMemo(() => getLast30DaysRange(), []);

	const management = useManagementDashboard({
		enabled: roleReady && isManager,
	});
	const period = management.data?.period;
	const kpiRange = {
		date_from: period?.from ?? fallbackRange.date_from,
		date_to: period?.to ?? fallbackRange.date_to,
	};

	const teamKpis = useTeamKpis({
		date_from: period?.from,
		date_to: period?.to,
		enabled: roleReady && isManager && Boolean(period?.from && period?.to),
	});

	const salesKpis = useSalesKpis({
		...kpiRange,
		enabled: roleReady && !isManager,
	});

	const leadsQuery = useLeads();
	const scheduledActionsQuery = useScheduledActions();
	const pendingLeadsQuery = usePendingLeads({
		enabled: roleReady && isManager,
	});

	const teamsQuery = useTeams({ enabled: roleReady && isManager });
	const projectsQuery = useProjects();
	const campaignsQuery = useCampaigns({ enabled: roleReady && isManager });
	const usersQuery = useUsers();

	const displayName =
		user?.name ??
		user?.email ??
		(userLoading ? t("common.loading") : t("common.user"));

	const leads = leadsQuery.data ?? [];
	const scheduledActions = scheduledActionsQuery.data ?? [];
	const pendingLeads = pendingLeadsQuery.data ?? [];

	const teams =
		teamKpis.data?.length > 0
			? teamKpis.data
			: (management.data?.teams ?? []);

	const teamNamesById = useMemo(() => {
		const map = {};
		for (const team of teamsQuery.data ?? []) {
			if (team?.id != null) map[String(team.id)] = team.name;
		}
		return map;
	}, [teamsQuery.data]);

	const usersById = useMemo(() => {
		const map = {};
		for (const u of usersQuery.data ?? []) {
			if (u?.id != null) map[String(u.id)] = u;
		}
		return map;
	}, [usersQuery.data]);

	const projectsById = useMemo(() => {
		const map = {};
		for (const p of projectsQuery.data ?? []) {
			if (p?.id != null) map[String(p.id)] = p;
		}
		return map;
	}, [projectsQuery.data]);

	const attentionLoading =
		leadsQuery.isLoading ||
		scheduledActionsQuery.isLoading ||
		(isManager && pendingLeadsQuery.isLoading);

	const attentionError =
		leadsQuery.isError ||
		scheduledActionsQuery.isError ||
		(isManager && pendingLeadsQuery.isError);

	const summary = useMemo(
		() =>
			computeAttentionSummary({
				leads,
				scheduledActions,
				pendingLeads,
				scopeUserId,
				variant,
			}),
		[leads, scheduledActions, pendingLeads, scopeUserId, variant],
	);

	const workQueue = useMemo(
		() =>
			buildWorkQueue({
				leads,
				scheduledActions,
				scopeUserId,
				variant,
				limit: 15,
			}),
		[leads, scheduledActions, scopeUserId, variant],
	);

	const schedule = useMemo(
		() =>
			buildTodaySchedule({
				leads,
				scheduledActions,
				scopeUserId,
			}),
		[leads, scheduledActions, scopeUserId],
	);

	const kpiMetrics = useMemo(
		() =>
			buildKpiStrip({
				leads,
				scopeUserId,
				management: management.data,
				salesKpis: salesKpis.data,
				teams,
				variant,
			}),
		[leads, scopeUserId, management.data, salesKpis.data, teams, variant],
	);

	const leaderboard = useMemo(
		() => buildTeamLeaderboard(teams, teamNamesById),
		[teams, teamNamesById],
	);

	const leadCards = useMemo(
		() => buildLeadCards({ leads, scopeUserId, limit: 8 }),
		[leads, scopeUserId],
	);

	const kpiLoading =
		leadsQuery.isLoading ||
		(isManager
			? management.isLoading || teamKpis.isLoading
			: salesKpis.isLoading);

	const teamsLoading =
		isManager &&
		(management.isLoading ||
			(Boolean(period?.from && period?.to) && teamKpis.isLoading));

	const teamsError =
		isManager && teamKpis.isError && !management.data?.teams?.length;

	const isRefreshing =
		management.isFetching ||
		teamKpis.isFetching ||
		salesKpis.isFetching ||
		leadsQuery.isFetching ||
		scheduledActionsQuery.isFetching ||
		pendingLeadsQuery.isFetching ||
		(isManager && campaignsQuery.isFetching);

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["dashboards"] });
		queryClient.invalidateQueries({ queryKey: ["kpis"] });
		queryClient.invalidateQueries({ queryKey: ["leads"] });
		queryClient.invalidateQueries({ queryKey: ["pendingLeads"] });
		queryClient.invalidateQueries({ queryKey: ["scheduled-actions"] });
		if (isManager) {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["teams"] });
		}
	};

	const retryAttention = () => {
		leadsQuery.refetch();
		scheduledActionsQuery.refetch();
		if (isManager) pendingLeadsQuery.refetch();
	};

	return (
		<div className="space-y-8">
			{userLoading && !user ? (
				<LoadingSkeleton variant="header" />
			) : (
				<DashboardHeader
					name={displayName}
					variant={variant}
					period={period}
					showPeriod={isManager}
					onRefresh={handleRefresh}
					isRefreshing={isRefreshing}
				/>
			)}

			<NeedsAttentionHero
				variant={variant}
				summary={summary}
				userId={userId}
				isLoading={attentionLoading}
			/>

			<KpiStrip metrics={kpiMetrics} isLoading={kpiLoading} />

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
				<div className="xl:col-span-5">
					<TodaySchedule
						items={schedule}
						isLoading={attentionLoading}
						isError={attentionError}
						onRetry={retryAttention}
					/>
				</div>
				<div className="xl:col-span-7">
					<AttentionQueue
						items={workQueue}
						isLoading={attentionLoading}
						isError={attentionError}
						onRetry={retryAttention}
					/>
				</div>
			</div>

			{isManager && (
				<Suspense fallback={<LoadingSkeleton variant="table" />}>
					<TeamLeaderboard
						teams={leaderboard}
						isLoading={teamsLoading}
						isError={teamsError}
						onRetry={() => {
							management.refetch();
							teamKpis.refetch();
						}}
					/>
				</Suspense>
			)}

			{isManager && (
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
					<Suspense fallback={<LoadingSkeleton variant="table" />}>
						<ProjectsOverview
							projects={projectsQuery.data}
							isLoading={projectsQuery.isLoading}
							isError={projectsQuery.isError}
							onRetry={() => projectsQuery.refetch()}
						/>
					</Suspense>
					<Suspense fallback={<LoadingSkeleton variant="table" />}>
						<CampaignsOverview
							campaigns={campaignsQuery.data}
							isLoading={campaignsQuery.isLoading}
							isError={campaignsQuery.isError}
							onRetry={() => campaignsQuery.refetch()}
						/>
					</Suspense>
				</div>
			)}

			<LeadCardsGrid
				leads={leadCards}
				usersById={usersById}
				projectsById={projectsById}
				isLoading={leadsQuery.isLoading}
				isError={leadsQuery.isError}
				onRetry={() => leadsQuery.refetch()}
			/>
		</div>
	);
};

export default DashboardPage;
