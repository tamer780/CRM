import { useQuery } from "@tanstack/react-query";
import { getScheduledAction } from "../../services/scheduledActions/scheduledActionsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useScheduledAction(scheduledActionId) {
	return useQuery({
		queryKey: ["scheduled-actions", String(scheduledActionId)],
		queryFn: async () => {
			const response = await getScheduledAction(scheduledActionId);
			return extractData(response);
		},
		enabled: !!getToken() && !!scheduledActionId,
		staleTime: 60 * 1000,
	});
}
