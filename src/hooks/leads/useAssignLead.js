import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignLead, reassignLead } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

/**
 * Assign or reassign a lead depending on whether it already has assigned_to.
 * API body: { user_id, reason }.
 */
export function useAssignLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ leadId, user_id, reason, isReassign }) => {
			const body = {
				user_id: Number(user_id),
				reason: String(reason ?? "").trim(),
			};
			const response = isReassign
				? await reassignLead(leadId, body)
				: await assignLead(leadId, body);
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
