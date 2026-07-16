import { useQuery } from "@tanstack/react-query";
import { getProject } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useProject(projectId) {
	return useQuery({
		queryKey: ["projects", String(projectId)],
		queryFn: async () => {
			const response = await getProject(projectId);
			return extractData(response);
		},
		enabled: !!getToken() && !!projectId,
		staleTime: 60 * 1000,
	});
}
