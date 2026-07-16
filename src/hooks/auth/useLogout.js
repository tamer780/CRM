import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth/authService";
import { clearToken } from "../../utils/token/tokenStorage";

export function useLogout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		onSettled: () => {
			clearToken();
			queryClient.clear();
			navigate("/login", { replace: true });
		},
	});
}
