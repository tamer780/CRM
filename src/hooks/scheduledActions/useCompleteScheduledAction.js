import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeScheduledAction } from "../../services/scheduledActions/scheduledActionsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCompleteScheduledAction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ scheduledActionId, body }) => {
			const response = await completeScheduledAction(scheduledActionId, body);
			return extractData(response);
		},
		onMutate: async ({ scheduledActionId, body }) => {
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

			const patch = {
				status: "completed",
				completed_at: new Date().toISOString(),
				outcome: body?.outcome ?? null,
				note: body?.note ?? undefined,
			};

			queryClient.setQueryData(["scheduled-actions", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(scheduledActionId)
						? {
								...item,
								...patch,
								note: body?.note != null ? body.note : item.note,
							}
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(
					["scheduled-actions", String(scheduledActionId)],
					{
						...previousDetail,
						...patch,
						note:
							body?.note != null ? body.note : previousDetail.note,
					},
				);
			}

			return { previousList, previousDetail, scheduledActionId };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(
					["scheduled-actions", "list"],
					context.previousList,
				);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["scheduled-actions", String(context.scheduledActionId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (action, { scheduledActionId }) => {
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
