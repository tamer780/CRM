import { useQuery } from "@tanstack/react-query";
import { getClient } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";
import {
	clientDetailQueryKey,
	normalizeClientDetail,
} from "../../features/clients/utils/clientDetailUtils";

export function useClient(clientId) {
	return useQuery({
		queryKey: clientDetailQueryKey(clientId),
		queryFn: async () => {
			const response = await getClient(clientId);
			return normalizeClientDetail(extractData(response));
		},
		enabled: !!getToken() && !!clientId,
		staleTime: 60 * 1000,
	});
}
