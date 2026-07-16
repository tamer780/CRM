import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "../../services/projects/projectsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateProject(projectId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateProject(projectId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["projects", "list"] });
			const previousList = queryClient.getQueryData(["projects", "list"]);
			const previousDetail = queryClient.getQueryData([
				"projects",
				String(projectId),
			]);

			queryClient.setQueryData(["projects", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(projectId)
						? { ...item, ...body }
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["projects", String(projectId)], {
					...previousDetail,
					...body,
				});
			}

			return { previousList, previousDetail };
		},
		onError: (_err, _body, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["projects", "list"], context.previousList);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["projects", String(projectId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (project) => {
			if (project) {
				queryClient.setQueryData(["projects", String(projectId)], project);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
