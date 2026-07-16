import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCampaign } from "../../services/campaigns/campaignsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (campaignId) => {
			const response = await deleteCampaign(campaignId);
			return extractData(response);
		},
		onMutate: async (campaignId) => {
			await queryClient.cancelQueries({ queryKey: ["campaigns", "list"] });
			const previous = queryClient.getQueryData(["campaigns", "list"]);
			queryClient.setQueryData(["campaigns", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.filter((item) => String(item.id) !== String(campaignId));
			});
			return { previous, campaignId };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["campaigns", "list"], context.previous);
			}
		},
		onSettled: (_data, _error, campaignId) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			if (campaignId != null) {
				queryClient.removeQueries({
					queryKey: ["campaigns", String(campaignId)],
				});
			}
		},
	});
}
