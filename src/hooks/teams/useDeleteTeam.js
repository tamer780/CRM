import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "../../services/teams/teamsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteTeam() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (teamId) => {
			const response = await deleteTeam(teamId);
			return extractData(response);
		},
		onMutate: async (teamId) => {
			await queryClient.cancelQueries({ queryKey: ["teams", "list"] });
			const previous = queryClient.getQueryData(["teams", "list"]);
			queryClient.setQueryData(["teams", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.filter((item) => String(item.id) !== String(teamId));
			});
			return { previous, teamId };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["teams", "list"], context.previous);
			}
		},
		onSettled: (_data, _error, teamId) => {
			queryClient.invalidateQueries({ queryKey: ["teams"] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			if (teamId != null) {
				queryClient.removeQueries({
					queryKey: ["teams", String(teamId)],
				});
			}
		},
	});
}
