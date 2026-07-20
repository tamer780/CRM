import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	removePendingLead,
	replacePendingLead,
} from "../../services/pendingLeads/pendingLeadsService";
import { extractData } from "../../utils/api/apiHelpers";

function useOptimisticPendingLeadMutation(mutationFn) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onMutate: async (variables) => {
			const pendingLeadId =
				typeof variables === "object" && variables !== null
					? variables.id
					: variables;

			await queryClient.cancelQueries({ queryKey: ["pendingLeads", "list"] });
			const previous = queryClient.getQueryData(["pendingLeads", "list"]);

			queryClient.setQueryData(["pendingLeads", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.filter(
					(item) => String(item.id) !== String(pendingLeadId),
				);
			});

			return { previous, pendingLeadId };
		},
		onError: (_err, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["pendingLeads", "list"], context.previous);
			}
		},
		onSettled: (_data, _error, variables, context) => {
			const pendingLeadId =
				context?.pendingLeadId ??
				(typeof variables === "object" && variables !== null
					? variables.id
					: variables);

			queryClient.invalidateQueries({ queryKey: ["pendingLeads"] });
			queryClient.invalidateQueries({ queryKey: ["leads"] });

			if (pendingLeadId != null) {
				queryClient.removeQueries({
					queryKey: ["pendingLeads", String(pendingLeadId)],
				});
			}
		},
	});
}

export function useReplacePendingLead() {
	return useOptimisticPendingLeadMutation(async ({ id, note }) => {
		const response = await replacePendingLead(id, { note });
		return extractData(response);
	});
}

export function useRemovePendingLead() {
	return useOptimisticPendingLeadMutation(async (id) => {
		const response = await removePendingLead(id, {});
		return extractData(response);
	});
}
