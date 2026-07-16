import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkAssignLeads } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

/**
 * Assign multiple leads in one request.
 * API body: { user_id, lead_ids }.
 */
export function useBulkAssignLeads() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ user_id, lead_ids }) => {
			const response = await bulkAssignLeads({
				user_id: Number(user_id),
				lead_ids: (lead_ids ?? []).map((id) => Number(id)),
			});
			return extractData(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}
