import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importProjectLeads } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useImportProjectLeads() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ projectId, file }) => {
			const response = await importProjectLeads(projectId, file);
			return extractData(response);
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			if (variables?.projectId != null) {
				queryClient.invalidateQueries({
					queryKey: ["projects", String(variables.projectId)],
				});
			}
		},
	});
}
