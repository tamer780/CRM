import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScheduledAction } from "../../services/scheduledActions/scheduledActionsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateScheduledAction(scheduledActionId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateScheduledAction(scheduledActionId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({
				queryKey: ["scheduled-actions", "list"],
			});
			const previousList = queryClient.getQueryData([
				"scheduled-actions",
				"list",
			]);
			const previousDetail = queryClient.getQueryData([
				"scheduled-actions",
				String(scheduledActionId),
			]);

			queryClient.setQueryData(["scheduled-actions", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(scheduledActionId)
						? { ...item, ...body }
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(
					["scheduled-actions", String(scheduledActionId)],
					{ ...previousDetail, ...body },
				);
			}

			return { previousList, previousDetail };
		},
		onError: (_err, _body, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(
					["scheduled-actions", "list"],
					context.previousList,
				);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["scheduled-actions", String(scheduledActionId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (action) => {
			if (action) {
				queryClient.setQueryData(
					["scheduled-actions", String(scheduledActionId)],
					action,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["scheduled-actions"] });
		},
	});
}
