import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateUser } from "../../services/users/usersService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeactivateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId) => {
			const response = await deactivateUser(userId);
			return extractData(response);
		},
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: ["users", "list"] });
			const previousList = queryClient.getQueryData(["users", "list"]);
			const previousDetail = queryClient.getQueryData([
				"users",
				String(userId),
			]);

			queryClient.setQueryData(["users", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(userId)
						? { ...item, is_active: false }
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["users", String(userId)], {
					...previousDetail,
					is_active: false,
				});
			}

			return { previousList, previousDetail, userId };
		},
		onError: (_err, _id, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["users", "list"], context.previousList);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["users", String(context.userId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (user, userId) => {
			if (user) {
				queryClient.setQueryData(["users", String(userId)], user);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}
