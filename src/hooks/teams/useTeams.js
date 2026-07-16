import { useQuery } from "@tanstack/react-query";
import { getTeams } from "../../services/teams/teamsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.teams)) return payload.teams;
	return [];
}

export function useTeams({ enabled = true } = {}) {
	return useQuery({
		queryKey: ["teams", "list"],
		queryFn: async () => {
			const response = await getTeams();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 5 * 60 * 1000,
	});
}
