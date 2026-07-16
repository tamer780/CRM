import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createLead } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateLead() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createLead(body);
			return extractData(response);
		},
		onSuccess: (lead) => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			if (lead?.id) {
				navigate(`/leads?selected=${lead.id}`);
			}
		},
	});
}
