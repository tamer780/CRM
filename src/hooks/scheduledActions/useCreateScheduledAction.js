import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScheduledAction } from "../../services/scheduledActions/scheduledActionsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateScheduledAction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createScheduledAction(body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({
				queryKey: ["scheduled-actions", "list"],
			});
			const previous = queryClient.getQueryData([
				"scheduled-actions",
				"list",
			]);
			const optimistic = {
				id: `temp-${Date.now()}`,
				...body,
				status: "pending",
				completed_at: null,
				outcome: null,
				_optimistic: true,
			};
			queryClient.setQueryData(["scheduled-actions", "list"], (old) => {
				if (!Array.isArray(old)) return [optimistic];
				return [optimistic, ...old];
			});
			return { previous };
		},
		onError: (_err, _body, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					["scheduled-actions", "list"],
					context.previous,
				);
			}
		},
		onSuccess: (created) => {
			if (created?.id) {
				queryClient.setQueryData(
					["scheduled-actions", String(created.id)],
					created,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["scheduled-actions"] });
		},
	});
}
