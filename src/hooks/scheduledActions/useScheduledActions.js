import { useQuery } from "@tanstack/react-query";
import { getScheduledActions } from "../../services/scheduledActions/scheduledActionsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.scheduled_actions)) return payload.scheduled_actions;
	return [];
}

export function useScheduledActions() {
	return useQuery({
		queryKey: ["scheduled-actions", "list"],
		queryFn: async () => {
			const response = await getScheduledActions();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken(),
		staleTime: 60 * 1000,
	});
}
