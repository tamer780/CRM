import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markClientLost } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useMarkClientLost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ clientId, reason }) => {
			const response = await markClientLost(clientId, { reason });
			return extractData(response);
		},
		onMutate: async ({ clientId, reason }) => {
			await queryClient.cancelQueries({ queryKey: ["clients"] });
			const previousList = queryClient.getQueryData(["clients", "list"]);
			const previousDetail = queryClient.getQueryData([
				"clients",
				String(clientId),
			]);
			const patch = {
				status: "lost",
				lost_reason: reason,
				lost_at: new Date().toISOString(),
			};

			queryClient.setQueryData(["clients", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(clientId)
						? { ...item, ...patch }
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["clients", String(clientId)], {
					...previousDetail,
					...patch,
				});
			}

			return { previousList, previousDetail, clientId };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["clients", "list"], context.previousList);
			}
			if (context?.previousDetail && context.clientId != null) {
				queryClient.setQueryData(
					["clients", String(context.clientId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (client, variables) => {
			if (client) {
				queryClient.setQueryData(
					["clients", String(variables.clientId)],
					client,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
