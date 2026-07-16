import { useQuery } from "@tanstack/react-query";
import { getClients } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.clients)) return payload.clients;
	return [];
}

export function useClients() {
	return useQuery({
		queryKey: ["clients", "list"],
		queryFn: async () => {
			const response = await getClients();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken(),
		staleTime: 60 * 1000,
	});
}
