import api from "../../api/client";

export async function getClients() {
	const response = await api.get("/clients");
	return response.data;
}

export async function getClient(clientId) {
	const response = await api.get(`/clients/${clientId}`);
	return response.data;
}

export async function updateClient(clientId, body) {
	const response = await api.put(`/clients/${clientId}`, body);
	return response.data;
}

export async function markClientLost(clientId, body) {
	const response = await api.post(`/clients/${clientId}/mark-lost`, body);
	return response.data;
}

export async function restoreClient(clientId) {
	const response = await api.post(`/clients/${clientId}/restore`);
	return response.data;
}
