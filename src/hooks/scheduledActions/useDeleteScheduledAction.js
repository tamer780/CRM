import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteScheduledAction } from "../../services/scheduledActions/scheduledActionsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteScheduledAction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (scheduledActionId) => {
			const response = await deleteScheduledAction(scheduledActionId);
			return extractData(response);
		},
		onMutate: async (scheduledActionId) => {
			await queryClient.cancelQueries({
				queryKey: ["scheduled-actions", "list"],
			});
			const previous = queryClient.getQueryData([
				"scheduled-actions",
				"list",
			]);
			queryClient.setQueryData(["scheduled-actions", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.filter(
					(item) => String(item.id) !== String(scheduledActionId),
				);
			});
			return { previous, scheduledActionId };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					["scheduled-actions", "list"],
					context.previous,
				);
			}
		},
		onSettled: (_data, _error, scheduledActionId) => {
			queryClient.invalidateQueries({ queryKey: ["scheduled-actions"] });
			if (scheduledActionId != null) {
				queryClient.removeQueries({
					queryKey: ["scheduled-actions", String(scheduledActionId)],
				});
			}
		},
	});
}
