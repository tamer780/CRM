import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createProject(body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["projects", "list"] });
			const previous = queryClient.getQueryData(["projects", "list"]);
			const optimistic = {
				id: `temp-${Date.now()}`,
				...body,
				teams: [],
				_optimistic: true,
			};
			queryClient.setQueryData(["projects", "list"], (old) => {
				if (!Array.isArray(old)) return [optimistic];
				return [optimistic, ...old];
			});
			return { previous };
		},
		onError: (_err, _body, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["projects", "list"], context.previous);
			}
		},
		onSuccess: (created) => {
			if (created?.id) {
				queryClient.setQueryData(["projects", String(created.id)], created);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
