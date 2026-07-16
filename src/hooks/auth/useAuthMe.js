import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../../services/auth/authService";
import { getToken } from "../../utils/token/tokenStorage";

export function useAuthMe() {
	return useQuery({
		queryKey: ["auth", "me"],
		queryFn: fetchMe,
		enabled: !!getToken(),
		staleTime: 5 * 60 * 1000,
		retry: false,
	});
}
