import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign } from "../../services/campaigns/campaignsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createCampaign(body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["campaigns", "list"] });
			const previous = queryClient.getQueryData(["campaigns", "list"]);
			const optimistic = {
				id: `temp-${Date.now()}`,
				...body,
				_optimistic: true,
			};
			queryClient.setQueryData(["campaigns", "list"], (old) => {
				if (!Array.isArray(old)) return [optimistic];
				return [optimistic, ...old];
			});
			return { previous };
		},
		onError: (_err, _body, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["campaigns", "list"], context.previous);
			}
		},
		onSuccess: (created) => {
			if (created?.id) {
				queryClient.setQueryData(["campaigns", String(created.id)], created);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
}
