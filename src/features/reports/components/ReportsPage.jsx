import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "../../../hooks/auth/usePermissions";
import { useCampaignEvaluationReports } from "../../../hooks/reports/useCampaignEvaluationReports";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { useProjectReports } from "../../../hooks/reports/useProjectReports";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useSourceReports } from "../../../hooks/reports/useSourceReports";
import { useTeams } from "../../../hooks/teams/useTeams";
import { useUsers } from "../../../hooks/users/useUsers";
import { scopeToReportParams } from "../../users/utils/permissions";
import {
	applyFiltersToSearchParams,
	clearFilterParams,
	filtersFromSearchParams,
	hasActiveReportFilters,
	tabFromSearchParams,
	toApiParams,
} from "../utils/reportFilters";
import CampaignEvaluationTable from "./CampaignEvaluationTable";
import ProjectReportsTable from "./ProjectReportsTable";
import ReportsHeader from "./ReportsHeader";
import ReportsTabs from "./ReportsTabs";
import ReportsToolbar from "./ReportsToolbar";
import SourceReportsTable from "./SourceReportsTable";

const ReportsPage = () => {
	const queryClient = useQueryClient();
	const [searchParams, setSearchParams] = useSearchParams();
	const { scope } = usePermissions();

	const tab = useMemo(
		() => tabFromSearchParams(searchParams),
		[searchParams],
	);
	const filters = useMemo(() => {
		const fromUrl = filtersFromSearchParams(searchParams);
		const scoped = scopeToReportParams(scope);
		return {
			...fromUrl,
			...(scoped.teamId ? { teamId: scoped.teamId } : {}),
			...(scoped.userId ? { userId: scoped.userId } : {}),
		};
	}, [searchParams, scope]);
	const apiParams = useMemo(() => toApiParams(filters), [filters]);
	const hasFilters = hasActiveReportFilters(filters);

	const projectsQuery = useProjects();
	const campaignsQuery = useCampaigns();
	const teamsQuery = useTeams();
	const usersQuery = useUsers();

	const projectReports = useProjectReports(apiParams, {
		enabled: tab === "projects",
	});
	const campaignReports = useCampaignEvaluationReports(apiParams, {
		enabled: tab === "campaigns",
	});
	const sourceReports = useSourceReports(apiParams, {
		enabled: tab === "sources",
	});

	const activeQuery =
		tab === "campaigns"
			? campaignReports
			: tab === "sources"
				? sourceReports
				: projectReports;

	const updateFilters = useCallback(
		(nextFilters) => {
			setSearchParams(
				applyFiltersToSearchParams(searchParams, nextFilters, tab),
				{ replace: true },
			);
		},
		[searchParams, setSearchParams, tab],
	);

	const resetFilters = useCallback(() => {
		setSearchParams(clearFilterParams(searchParams, tab), { replace: true });
	}, [searchParams, setSearchParams, tab]);

	const handleTabChange = useCallback(
		(nextTab) => {
			setSearchParams(
				applyFiltersToSearchParams(searchParams, filters, nextTab),
				{ replace: true },
			);
		},
		[searchParams, setSearchParams, filters],
	);

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["reports"] });
	};

	return (
		<div className="space-y-5">
			<ReportsHeader
				dateFrom={filters.dateFrom}
				dateTo={filters.dateTo}
				isRefreshing={activeQuery.isFetching}
				onRefresh={handleRefresh}
			/>

			<ReportsToolbar
				filters={filters}
				onFiltersChange={updateFilters}
				onReset={resetFilters}
				projects={projectsQuery.data ?? []}
				campaigns={campaignsQuery.data ?? []}
				teams={teamsQuery.data ?? []}
				users={usersQuery.data ?? []}
			/>

			<ReportsTabs tab={tab} onTabChange={handleTabChange} />

			<div className="space-y-4">
				{tab === "projects" && (
					<ProjectReportsTable
						rows={projectReports.data}
						isLoading={projectReports.isLoading}
						isError={projectReports.isError}
						onRetry={() => projectReports.refetch()}
						hasFilters={hasFilters}
					/>
				)}
				{tab === "campaigns" && (
					<CampaignEvaluationTable
						rows={campaignReports.data}
						isLoading={campaignReports.isLoading}
						isError={campaignReports.isError}
						onRetry={() => campaignReports.refetch()}
						hasFilters={hasFilters}
					/>
				)}
				{tab === "sources" && (
					<SourceReportsTable
						rows={sourceReports.data}
						isLoading={sourceReports.isLoading}
						isError={sourceReports.isError}
						onRetry={() => sourceReports.refetch()}
						hasFilters={hasFilters}
					/>
				)}
			</div>
		</div>
	);
};

export default ReportsPage;
