import { useQuery } from "@tanstack/react-query";
import { getProjectTeams } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.teams)) return payload.teams;
	return [];
}

export function useProjectTeams(projectId) {
	return useQuery({
		queryKey: ["projects", String(projectId), "teams"],
		queryFn: async () => {
			const response = await getProjectTeams(projectId);
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && !!projectId,
		staleTime: 60 * 1000,
	});
}
