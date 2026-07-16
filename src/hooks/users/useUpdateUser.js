import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../../services/users/usersService";
import { extractData } from "../../utils/api/apiHelpers";

export function useUpdateUser(userId) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await updateUser(userId, body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["users", "list"] });
			const previousList = queryClient.getQueryData(["users", "list"]);
			const previousDetail = queryClient.getQueryData([
				"users",
				String(userId),
			]);

			const { password: _password, password_confirmation: _confirm, ...rest } =
				body ?? {};

			queryClient.setQueryData(["users", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.map((item) =>
					String(item.id) === String(userId)
						? {
								...item,
								...rest,
								roles: rest.role ? [rest.role] : item.roles,
							}
						: item,
				);
			});

			if (previousDetail) {
				queryClient.setQueryData(["users", String(userId)], {
					...previousDetail,
					...rest,
					roles: rest.role ? [rest.role] : previousDetail.roles,
				});
			}

			return { previousList, previousDetail };
		},
		onError: (_err, _body, context) => {
			if (context?.previousList) {
				queryClient.setQueryData(["users", "list"], context.previousList);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					["users", String(userId)],
					context.previousDetail,
				);
			}
		},
		onSuccess: (user) => {
			if (user) {
				queryClient.setQueryData(["users", String(userId)], user);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}
