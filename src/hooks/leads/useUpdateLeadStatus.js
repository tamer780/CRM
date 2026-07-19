import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadStatus } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateLeadStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ leadId, status, meeting_date, meeting_note }) => {
			const body = { status };
			if (status === "meeting_scheduled") {
				body.meeting_date = meeting_date ?? null;
				body.meeting_note = meeting_note ?? null;
			}
			const response = await updateLeadStatus(leadId, body);
			return extractData(response);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			if (variables?.leadId != null) {
				queryClient.invalidateQueries({
					queryKey: ["leads", String(variables.leadId)],
				});
			}
			if (variables?.status === "meeting_scheduled") {
				queryClient.invalidateQueries({ queryKey: ["meetings"] });
			}
		},
	});
}
