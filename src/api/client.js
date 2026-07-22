import axios from "axios";
import { clearToken, getToken } from "../utils/token/tokenStorage";

const baseURL =
	import.meta.env.VITE_API_BASE_URL?.trim() ||
	"https://new-crm.amaireg.com/api/v1";

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"];

const api = axios.create({
	baseURL,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) =>
		config.url?.includes(path),
	);

	if (!isPublicAuth) {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const isLogin = error.config?.url?.includes("/auth/login");
		const isRegister = error.config?.url?.includes("/auth/register");

		if (error?.response?.status === 401 && !isLogin && !isRegister) {
			clearToken();
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	},
);

export default api;
