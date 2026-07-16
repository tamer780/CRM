import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../services/users/usersService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useUser(userId) {
	return useQuery({
		queryKey: ["users", String(userId)],
		queryFn: async () => {
			const response = await getUser(userId);
			return extractData(response);
		},
		enabled: !!getToken() && !!userId,
		staleTime: 60 * 1000,
	});
}
