import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreClient } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useRestoreClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (clientId) => {
			const response = await restoreClient(clientId);
			return extractData(response);
		},
		onMutate: async (clientId) => {
			await queryClient.cancelQueries({ queryKey: ["clients"] });
			const previousList = queryClient.getQueryData(["clients", "list"]);
			const previousDetail = queryClient.getQueryData([
				"clients",
				String(clientId),
			]);
			const patch = {
				status: "active",
				lost_reason: null,
				lost_at: null,
				lost_by: null,
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
		onError: (_err, _clientId, context) => {
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
		onSuccess: (client, clientId) => {
			if (client) {
				queryClient.setQueryData(["clients", String(clientId)], client);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
