import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "../../services/teams/teamsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateTeam(teamId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateTeam(teamId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["teams", "list"] });
			const previousList = queryClient.getQueryData(["teams", "list"]);
			const previousDetail = queryClient.getQueryData([
				"teams",
				String(teamId),
			]);

			queryClient.setQueryData(["teams", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(teamId) ? { ...item, ...body } : item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["teams", String(teamId)], {
					...previousDetail,
					...body,
				});
			}

			return { previousList, previousDetail };
		},
		onError: (_err, _body, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["teams", "list"], context.previousList);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["teams", String(teamId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (team) => {
			if (team) {
				queryClient.setQueryData(["teams", String(teamId)], team);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["teams"] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}
