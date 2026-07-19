import { useQuery } from "@tanstack/react-query";
import { getMeeting } from "../../services/meetings/meetingsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useMeeting(meetingId) {
	return useQuery({
		queryKey: ["meetings", String(meetingId)],
		queryFn: async () => {
			const response = await getMeeting(meetingId);
			return extractData(response);
		},
		enabled: !!getToken() && !!meetingId,
		staleTime: 60 * 1000,
	});
}
