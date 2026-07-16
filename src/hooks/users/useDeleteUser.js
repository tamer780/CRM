import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../../services/users/usersService";
import { extractData } from "../../utils/api/apiHelpers";

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId) => {
			const response = await deleteUser(userId);
			return extractData(response);
		},
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: ["users", "list"] });
			const previous = queryClient.getQueryData(["users", "list"]);
			queryClient.setQueryData(["users", "list"], (old) => {
				if (!Array.isArray(old)) return old;
				return old.filter((item) => String(item.id) !== String(userId));
			});
			return { previous, userId };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["users", "list"], context.previous);
			}
		},
		onSettled: (_data, _error, userId) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			if (userId != null) {
				queryClient.removeQueries({
					queryKey: ["users", String(userId)],
				});
			}
		},
	});
}
