import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../services/users/usersService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.users)) return payload.users;
	return [];
}

export function useUsers({ enabled = true } = {}) {
	return useQuery({
		queryKey: ["users", "list"],
		queryFn: async () => {
			const response = await getUsers();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 5 * 60 * 1000,
	});
}
