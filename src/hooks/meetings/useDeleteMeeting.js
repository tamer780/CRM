import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMeeting } from "../../services/meetings/meetingsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteMeeting() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (meetingId) => {
			const response = await deleteMeeting(meetingId);
			return extractData(response);
		},
		onMutate: async (meetingId) => {
			await queryClient.cancelQueries({ queryKey: ["meetings"] });
			const previousQueries = queryClient.getQueriesData({
				queryKey: ["meetings", "list"],
			});

			previousQueries.forEach(([queryKey]) => {
				queryClient.setQueryData(queryKey, (old) => {
					if (!Array.isArray(old)) return old;
					return old.filter((item) => String(item.id) !== String(meetingId));
				});
			});

			return { previousQueries, meetingId };
		},
		onError: (_err, _id, context) => {
			context?.previousQueries?.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data);
			});
		},
		onSettled: (_data, _error, meetingId) => {
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
			if (meetingId != null) {
				queryClient.removeQueries({
					queryKey: ["meetings", String(meetingId)],
				});
			}
		},
	});
}
