import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "../../services/meetings/meetingsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.meetings)) return payload.meetings;
	return [];
}

export function useMeetings(filters = {}, { enabled = true } = {}) {
	const {
		assigned_to,
		status,
		date_from,
		date_to,
		lead_id,
		per_page = 100,
	} = filters;

	return useQuery({
		queryKey: [
			"meetings",
			"list",
			{
				assigned_to: assigned_to ?? [],
				status: status ?? [],
				date_from: date_from ?? "",
				date_to: date_to ?? "",
				lead_id: lead_id ?? "",
				per_page,
			},
		],
		queryFn: async () => {
			const response = await getMeetings({
				assigned_to,
				status,
				date_from,
				date_to,
				lead_id,
				per_page,
			});
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});
}
