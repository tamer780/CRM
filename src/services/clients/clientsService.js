import api from "../../api/client";

export async function getClients({ page, per_page } = {}) {
	const params = {};
	if (page) params.page = page;
	if (per_page) params.per_page = per_page;

	const response = await api.get("/clients", { params });
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

export async function deleteClient(clientId) {
	const response = await api.delete(`/clients/${clientId}`);
	return response.data;
}
