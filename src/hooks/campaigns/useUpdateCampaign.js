import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaign } from "../../services/campaigns/campaignsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateCampaign(campaignId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateCampaign(campaignId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["campaigns", "list"] });
			const previousList = queryClient.getQueryData(["campaigns", "list"]);
			const previousDetail = queryClient.getQueryData([
				"campaigns",
				String(campaignId),
			]);

			queryClient.setQueryData(["campaigns", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(campaignId)
						? { ...item, ...body }
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["campaigns", String(campaignId)], {
					...previousDetail,
					...body,
				});
			}

			return { previousList, previousDetail };
		},
		onError: (_err, _body, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["campaigns", "list"], context.previousList);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["campaigns", String(campaignId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (campaign) => {
			if (campaign) {
				queryClient.setQueryData(["campaigns", String(campaignId)], campaign);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
}
