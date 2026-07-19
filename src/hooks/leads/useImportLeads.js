import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importLeads } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useImportLeads() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ file, source }) => {
			const response = await importLeads(file, source);
			return extractData(response);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});
}
