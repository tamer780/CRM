import { useQuery } from "@tanstack/react-query";
import { getClient } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useClient(clientId) {
	return useQuery({
		queryKey: ["clients", String(clientId)],
		queryFn: async () => {
			const response = await getClient(clientId);
			return extractData(response);
		},
		enabled: !!getToken() && !!clientId,
		staleTime: 60 * 1000,
	});
}
