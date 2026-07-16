import api from "../../api/client";

export async function getTeams() {
	const response = await api.get("/teams");
	return response.data;
}

export async function createTeam(body) {
	const response = await api.post("/teams", body);
	return response.data;
}

export async function getTeam(teamId) {
	const response = await api.get(`/teams/${teamId}`);
	return response.data;
}

export async function updateTeam(teamId, body) {
	const response = await api.put(`/teams/${teamId}`, body);
	return response.data;
}

export async function deleteTeam(teamId) {
	const response = await api.delete(`/teams/${teamId}`);
	return response.data;
}
