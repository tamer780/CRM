import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLead } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteLead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (leadId) => {
			const response = await deleteLead(leadId);
			return extractData(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}
