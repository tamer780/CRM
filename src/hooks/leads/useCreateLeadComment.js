import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLeadComment } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { normalizeLeadComments } from "./useLeadComments";

export function useCreateLeadComment(leadId) {
	const queryClient = useQueryClient();
	const queryKey = ["leads", String(leadId), "comments"];

	return useMutation({
		mutationFn: async (body) => {
			const response = await createLeadComment(leadId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData(queryKey);

			const optimistic = {
				id: `temp-${Date.now()}`,
				comment: body.comment,
				body: body.comment,
				created_at: new Date().toISOString(),
				_optimistic: true,
			};

			queryClient.setQueryData(queryKey, (old) => {
				const list = normalizeLeadComments(old);
				return [optimistic, ...list];
			});

			return { previous };
		},
		onError: (_err, _body, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData(queryKey, context.previous);
			}
		},
		onSuccess: (created) => {
			if (created && typeof created === "object") {
				queryClient.setQueryData(queryKey, (old) => {
					const list = normalizeLeadComments(old).filter(
						(item) => !item._optimistic,
					);
					const exists = list.some(
						(item) => String(item.id) === String(created.id),
					);
					return exists ? list : [created, ...list];
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});
}
