import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLead } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateLead(leadId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateLead(leadId, body);
			return extractData(response);
		},
		onSuccess: (lead) => {
			queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
			queryClient.invalidateQueries({ queryKey: ["leads", "recent"] });
			queryClient.setQueryData(["leads", String(leadId)], lead);
			queryClient.invalidateQueries({ queryKey: ["leads", String(leadId)] });
		},
	});
}
