import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMeeting } from "../../services/meetings/meetingsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createMeeting(body);
			return extractData(response);
		},
		onSuccess: (created) => {
			if (created?.id) {
				queryClient.setQueryData(["meetings", String(created.id)], created);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
		},
	});
}
