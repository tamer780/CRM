import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeeting } from "../../services/meetings/meetingsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ meetingId, body }) => {
			const response = await updateMeeting(meetingId, body);
			return extractData(response);
		},
		onSuccess: (meeting, variables) => {
			const id = variables?.meetingId ?? meeting?.id;
			if (meeting && id != null) {
				queryClient.setQueryData(["meetings", String(id)], meeting);
			}
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });

			const status = variables?.body?.status;
			if (status === "visit" || status === "bought") {
				queryClient.invalidateQueries({ queryKey: ["clients"] });
				queryClient.invalidateQueries({ queryKey: ["leads"] });
			}
		},
	});
}
