import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import i18n from "../../i18n";
import { login } from "../../services/auth/authService";
import { extractApiError } from "../../utils/api/apiHelpers";
import { setToken } from "../../utils/token/tokenStorage";

export function useLogin() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: login,
		onSuccess: ({ token, user }) => {
			setToken(token);
			queryClient.setQueryData(["auth", "me"], user);
			navigate("/dashboard", { replace: true });
		},
	});
}

export function getLoginErrorMessage(error) {
	const status = error?.response?.status;
	if (status === 401 || status === 422) {
		return extractApiError(error, i18n.t("errors.loginInvalid"));
	}
	return extractApiError(error, i18n.t("errors.loginFailed"));
}
