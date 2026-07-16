import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadStatus } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateLeadStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ leadId, status, lost_reason }) => {
			const body = { status };
			if (status === "lost" && lost_reason) {
				body.lost_reason = lost_reason;
			}
			const response = await updateLeadStatus(leadId, body);
			return extractData(response);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			if (variables?.leadId != null) {
				queryClient.invalidateQueries({
					queryKey: ["leads", String(variables.leadId)],
				});
			}
		},
	});
}
