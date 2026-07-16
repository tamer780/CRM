import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.projects)) return payload.projects;
	return [];
}

export function useProjects() {
	return useQuery({
		queryKey: ["projects", "list"],
		queryFn: async () => {
			const response = await getProjects();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken(),
		staleTime: 5 * 60 * 1000,
	});
}
