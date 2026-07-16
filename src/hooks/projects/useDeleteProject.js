import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (projectId) => {
			const response = await deleteProject(projectId);
			return extractData(response);
		},
		onMutate: async (projectId) => {
			await queryClient.cancelQueries({ queryKey: ["projects", "list"] });
			const previous = queryClient.getQueryData(["projects", "list"]);
			queryClient.setQueryData(["projects", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.filter((item) => String(item.id) !== String(projectId));
			});
			return { previous, projectId };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["projects", "list"], context.previous);
			}
		},
		onSettled: (_data, _error, projectId) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			if (projectId != null) {
				queryClient.removeQueries({
					queryKey: ["projects", String(projectId)],
				});
			}
		},
	});
}
