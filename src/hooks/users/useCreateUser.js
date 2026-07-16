import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../../services/users/usersService";
import { extractData } from "../../utils/api/apiHelpers";

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body) => {
			const response = await createUser(body);
			return extractData(response);
		},
		onMutate: async (body) => {
			await queryClient.cancelQueries({ queryKey: ["users", "list"] });
			const previous = queryClient.getQueryData(["users", "list"]);
			const optimistic = {
				id: `temp-${Date.now()}`,
				name: body.name,
				email: body.email,
				role: body.role,
				job_title: body.job_title ?? null,
				roles: body.role ? [body.role] : [],
				is_active: true,
				_optimistic: true,
			};
			queryClient.setQueryData(["users", "list"], (old) => {
				if (!Array.isArray(old)) return [optimistic];
				return [optimistic, ...old];
			});
			return { previous };
		},
		onError: (_err, _body, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["users", "list"], context.previous);
			}
		},
		onSuccess: (created) => {
			if (created?.id) {
				queryClient.setQueryData(["users", String(created.id)], created);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}
