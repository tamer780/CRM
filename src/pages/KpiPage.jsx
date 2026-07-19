import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import KpiHeader from "../components/kpi/KpiHeader";
import SalesKpiStats from "../components/kpi/SalesKpiStats";
import TeamPerformanceTable from "../components/dashboard/TeamPerformanceTable";
import { usePermissions } from "../hooks/auth/usePermissions";
import { useSalesKpis } from "../hooks/health/useSalesKpis";
import { useTeamKpis } from "../hooks/health/useTeamKpis";
import { getLast30DaysRange } from "../utils/date/dateRange";

const KpiPage = () => {
	const queryClient = useQueryClient();
	const [range, setRange] = useState(() => getLast30DaysRange());
	const { role, scope } = usePermissions();

	const { date_from, date_to } = range;
	const hasPeriod = Boolean(date_from && date_to);

	const showSalesKpis = role === "sales" || role === "admin" || role === "superadmin";
	const showTeamKpis =
		role === "leader" ||
		role === "supervisor" ||
		role === "admin" ||
		role === "superadmin";

	const salesKpis = useSalesKpis({
		date_from,
		date_to,
		enabled: showSalesKpis,
	});
	const teamKpis = useTeamKpis({
		date_from,
		date_to,
		enabled: showTeamKpis,
	});

	const scopedTeams = useMemo(() => {
		const teams = teamKpis.data ?? [];
		if (scope.type !== "team" || !scope.teamIds?.length) return teams;
		const allowed = new Set(scope.teamIds.map(String));
		return teams.filter((team) => allowed.has(String(team.id ?? team.team_id)));
	}, [teamKpis.data, scope]);

	const isRefreshing =
		(showSalesKpis && salesKpis.isFetching) ||
		(showTeamKpis && teamKpis.isFetching);

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["kpis"] });
	};

	return (
		<div className="space-y-6">
			<KpiHeader
				dateFrom={date_from}
				dateTo={date_to}
				onDateFromChange={(value) =>
					setRange((prev) => ({ ...prev, date_from: value }))
				}
				onDateToChange={(value) =>
					setRange((prev) => ({ ...prev, date_to: value }))
				}
				onRefresh={handleRefresh}
				isRefreshing={isRefreshing}
			/>

			{showSalesKpis && (
				<SalesKpiStats
					data={salesKpis.data}
					isLoading={hasPeriod && salesKpis.isLoading}
					isError={salesKpis.isError}
					onRetry={() => salesKpis.refetch()}
					hasPeriod={hasPeriod}
				/>
			)}

			{showTeamKpis && (
				<TeamPerformanceTable
					teams={scopedTeams}
					isLoading={hasPeriod && teamKpis.isLoading}
					isError={teamKpis.isError}
					onRetry={() => teamKpis.refetch()}
				/>
			)}
		</div>
	);
};

export default KpiPage;
