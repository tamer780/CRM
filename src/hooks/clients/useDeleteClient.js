import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClient } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (clientId) => {
			const response = await deleteClient(clientId);
			return extractData(response);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
