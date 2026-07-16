import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteLeads } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

/**
 * Delete multiple leads in one request.
 * API body: { lead_ids }.
 */
export function useBulkDeleteLeads() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ lead_ids }) => {
			const response = await bulkDeleteLeads({
				lead_ids: (lead_ids ?? []).map((id) => Number(id)),
			});
			return extractData(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}
