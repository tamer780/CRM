import api from "../../api/client";

export async function getUsers() {
	const response = await api.get("/users");
	return response.data;
}

export async function createUser(body) {
	const response = await api.post("/users", body);
	return response.data;
}

export async function getUser(userId) {
	const response = await api.get(`/users/${userId}`);
	return response.data;
}

export async function updateUser(userId, body) {
	const response = await api.put(`/users/${userId}`, body);
	return response.data;
}

export async function deleteUser(userId) {
	const response = await api.delete(`/users/${userId}`);
	return response.data;
}

export async function deactivateUser(userId) {
	const response = await api.post(`/users/${userId}/deactivate`);
	return response.data;
}

export async function activateUser(userId) {
	const response = await api.post(`/users/${userId}/activate`);
	return response.data;
}
