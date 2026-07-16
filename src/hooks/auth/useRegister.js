import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import i18n from "../../i18n";
import { register } from "../../services/auth/authService";
import { extractApiError } from "../../utils/api/apiHelpers";

export function useRegister() {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: register,
		onSuccess: () => {
			navigate("/login", {
				replace: true,
				state: { registered: true },
			});
		},
	});
}

export function getRegisterErrorMessage(error) {
	return extractApiError(error, i18n.t("errors.registerFailed"));
}
