import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUpdateLeadStatus } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

/**
 * Update status for multiple leads in one request.
 * API body: { status, lead_ids }.
 */
export function useBulkUpdateLeadStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ status, lead_ids }) => {
			const response = await bulkUpdateLeadStatus({
				status: String(status ?? "").trim(),
				lead_ids: (lead_ids ?? []).map((id) => Number(id)),
			});
			return extractData(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}
