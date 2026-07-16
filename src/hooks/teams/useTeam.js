import { useQuery } from "@tanstack/react-query";
import { getTeam } from "../../services/teams/teamsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useTeam(teamId) {
	return useQuery({
		queryKey: ["teams", String(teamId)],
		queryFn: async () => {
			const response = await getTeam(teamId);
			return extractData(response);
		},
		enabled: !!getToken() && !!teamId,
		staleTime: 60 * 1000,
	});
}
