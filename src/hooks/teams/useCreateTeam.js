import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam } from "../../services/teams/teamsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateTeam() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createTeam(body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["teams", "list"] });
			const previous = queryClient.getQueryData(["teams", "list"]);
			const optimistic = {
				id: `temp-${Date.now()}`,
				...body,
				_optimistic: true,
			};
			queryClient.setQueryData(["teams", "list"], (old) => {
				if (!Array.isArray(old)) return [optimistic];
				return [optimistic, ...old];
			});
			return { previous };
		},
		onError: (_err, _body, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["teams", "list"], context.previous);
			}
		},
		onSuccess: (created) => {
			if (created?.id) {
				queryClient.setQueryData(["teams", String(created.id)], created);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["teams"] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
