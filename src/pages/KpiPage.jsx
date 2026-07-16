import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import KpiHeader from "../components/kpi/KpiHeader";
import SalesKpiStats from "../components/kpi/SalesKpiStats";
import TeamPerformanceTable from "../components/dashboard/TeamPerformanceTable";
import { useSalesKpis } from "../hooks/health/useSalesKpis";
import { useTeamKpis } from "../hooks/health/useTeamKpis";
import { getLast30DaysRange } from "../utils/date/dateRange";

const KpiPage = () => {
	const queryClient = useQueryClient();
	const [range, setRange] = useState(() => getLast30DaysRange());

	const { date_from, date_to } = range;
	const hasPeriod = Boolean(date_from && date_to);

	const salesKpis = useSalesKpis({ date_from, date_to });
	const teamKpis = useTeamKpis({ date_from, date_to });

	const isRefreshing = salesKpis.isFetching || teamKpis.isFetching;

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

			<SalesKpiStats
				data={salesKpis.data}
				isLoading={hasPeriod && salesKpis.isLoading}
				isError={salesKpis.isError}
				onRetry={() => salesKpis.refetch()}
				hasPeriod={hasPeriod}
			/>

			<TeamPerformanceTable
				teams={teamKpis.data ?? []}
				isLoading={hasPeriod && teamKpis.isLoading}
				isError={teamKpis.isError}
				onRetry={() => teamKpis.refetch()}
			/>
		</div>
	);
};

export default KpiPage;
