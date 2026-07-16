import api from "../../api/client";

export async function getLeads({ per_page, status } = {}) {
	const params = {};
	if (per_page) params.per_page = per_page;
	if (Array.isArray(status) && status.length > 0) {
		params.status = status.map(String);
	}

	const response = await api.get("/leads", {
		params,
		paramsSerializer: {
			serialize: (raw) => {
				const search = new URLSearchParams();
				for (const [key, value] of Object.entries(raw ?? {})) {
					if (Array.isArray(value)) {
						for (const item of value) {
							if (item == null || item === "") continue;
							search.append(`${key}[]`, String(item));
						}
					} else if (value != null && value !== "") {
						search.append(key, String(value));
					}
				}
				return search.toString();
			},
		},
	});
	return response.data;
}

export async function createLead(body) {
	const response = await api.post("/leads", body);
	return response.data;
}

export async function getLead(leadId) {
	const response = await api.get(`/leads/${leadId}`);
	return response.data;
}

export async function updateLead(leadId, body) {
	const response = await api.put(`/leads/${leadId}`, body);
	return response.data;
}

export async function deleteLead(leadId) {
	const response = await api.delete(`/leads/${leadId}`);
	return response.data;
}

export async function assignLead(leadId, body) {
	const response = await api.post(`/leads/${leadId}/assign`, body);
	return response.data;
}

export async function reassignLead(leadId, body) {
	const response = await api.post(`/leads/${leadId}/reassign`, body);
	return response.data;
}

export async function bulkAssignLeads(body) {
	const response = await api.post("/leads/bulk/assign", body);
	return response.data;
}

export async function bulkDeleteLeads(body) {
	const response = await api.post("/leads/bulk/delete", body);
	return response.data;
}

export async function bulkUpdateLeadStatus(body) {
	const response = await api.post("/leads/bulk/status", body);
	return response.data;
}

export async function updateLeadStatus(leadId, body) {
	const response = await api.post(`/leads/${leadId}/status`, body);
	return response.data;
}

export async function convertLead(leadId, data) {
	const response = await api.post(`/leads/${leadId}/convert`, data);
	return response.data;
}

export async function getLeadActivities(leadId) {
	const response = await api.get(`/leads/${leadId}/activities`);
	return response.data;
}

export async function getLeadAssignments(leadId) {
	const response = await api.get(`/leads/${leadId}/assignments`);
	return response.data;
}

export async function getLeadComments(leadId) {
	const response = await api.get(`/leads/${leadId}/comments`);
	return response.data;
}

export async function createLeadComment(leadId, body) {
	const response = await api.post(`/leads/${leadId}/comments`, body);
	return response.data;
}
