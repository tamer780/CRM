import api from "../../api/client";
import { extractToken, extractUser } from "../../utils/api/apiHelpers";

export async function login({ email, password }) {
	const response = await api.post("/auth/login", { email, password });
	const token = extractToken(response.data);

	if (!token) {
		throw new Error("No token received from server.");
	}

	return { token, user: extractUser(response.data) };
}

export async function register({
	name,
	email,
	password,
	password_confirmation,
}) {
	const response = await api.post("/auth/register", {
		name,
		email,
		password,
		password_confirmation,
	});

	const token = extractToken(response.data);

	return {
		token,
		user: extractUser(response.data),
	};
}

export async function fetchMe() {
	const response = await api.get("/auth/me");
	return extractUser(response.data);
}

export async function logout() {
	await api.post("/auth/logout");
}
