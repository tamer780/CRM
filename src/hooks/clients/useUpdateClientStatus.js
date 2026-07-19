import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "../../services/clients/clientsService";
import { extractData } from "../../utils/api/apiHelpers";

function buildStatusPayload(client, status) {
	return {
		name: client.name ?? "",
		phone: client.phone ?? "",
		email: client.email?.trim() ? client.email : null,
		project_id: client.project_id != null && client.project_id !== ""
			? Number(client.project_id)
			: null,
		campaign_id: client.campaign_id != null && client.campaign_id !== ""
			? Number(client.campaign_id)
			: null,
		assigned_to: client.assigned_to != null && client.assigned_to !== ""
			? Number(client.assigned_to)
			: null,
		status,
	};
}

export function useUpdateClientStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ client, status }) => {
			const clientId = client.id;
			const body = buildStatusPayload(client, status);
			const response = await updateClient(clientId, body);
			return extractData(response);
		},
		onMutate: async ({ client, status }) => {
			const clientId = client.id;
			await queryClient.cancelQueries({ queryKey: ["clients"] });
			const previousList = queryClient.getQueryData(["clients", "list"]);
			const previousDetail = queryClient.getQueryData([
				"clients",
				String(clientId),
			]);
			const patch = { status };

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
		onSuccess: (updated, variables) => {
			if (updated) {
				queryClient.setQueryData(
					["clients", String(variables.client.id)],
					updated,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
