import api from "../../api/client";

export async function getProjects() {
	const response = await api.get("/projects");
	return response.data;
}

export async function createProject(body) {
	const response = await api.post("/projects", body);
	return response.data;
}

export async function getProject(projectId) {
	const response = await api.get(`/projects/${projectId}`);
	return response.data;
}

export async function updateProject(projectId, body) {
	const response = await api.put(`/projects/${projectId}`, body);
	return response.data;
}

export async function deleteProject(projectId) {
	const response = await api.delete(`/projects/${projectId}`);
	return response.data;
}

export async function getProjectTeams(projectId) {
	const response = await api.get(`/projects/${projectId}/teams`);
	return response.data;
}

export async function addProjectTeam(projectId, body) {
	const response = await api.post(`/projects/${projectId}/teams`, body);
	return response.data;
}

export async function removeProjectTeam(projectId, teamId) {
	const response = await api.delete(
		`/projects/${projectId}/teams/${teamId}`,
	);
	return response.data;
}

export async function importProjectLeads(projectId, file) {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post(
		`/projects/${projectId}/leads/import`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } },
	);
	return response.data;
}
