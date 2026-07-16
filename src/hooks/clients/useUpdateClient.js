import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateClient(clientId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateClient(clientId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["clients", "list"] });
			const previousList = queryClient.getQueryData(["clients", "list"]);
			const previousDetail = queryClient.getQueryData([
				"clients",
				String(clientId),
			]);

			queryClient.setQueryData(["clients", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(clientId)
						? { ...item, ...body }
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["clients", String(clientId)], {
					...previousDetail,
					...body,
				});
			}

			return { previousList, previousDetail };
		},
		onError: (_err, _body, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["clients", "list"], context.previousList);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["clients", String(clientId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (client) => {
			if (client) {
				queryClient.setQueryData(["clients", String(clientId)], client);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
