import api from "../../api/client";

export async function getLeads({
	per_page,
	status,
	assigned_to,
	assigned_at_from,
	assigned_at_to,
	created_from,
	created_to,
	last_action_from,
	last_action_to,
} = {}) {
	const params = {};
	if (per_page) params.per_page = per_page;
	if (Array.isArray(status) && status.length > 0) {
		params.status = status.map(String);
	}
	if (Array.isArray(assigned_to) && assigned_to.length > 0) {
		params.assigned_to = assigned_to.map(String);
	}
	if (assigned_at_from) params.assigned_at_from = assigned_at_from;
	if (assigned_at_to) params.assigned_at_to = assigned_at_to;
	if (created_from) params.created_from = created_from;
	if (created_to) params.created_to = created_to;
	if (last_action_from) params.last_action_from = last_action_from;
	if (last_action_to) params.last_action_to = last_action_to;

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

function filenameFromContentDisposition(header) {
	if (!header || typeof header !== "string") return null;
	const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
	if (utf8Match?.[1]) {
		try {
			return decodeURIComponent(utf8Match[1].trim());
		} catch {
			return utf8Match[1].trim();
		}
	}
	const plainMatch = /filename="?([^";]+)"?/i.exec(header);
	return plainMatch?.[1]?.trim() || null;
}

export async function downloadLeadsImportTemplate() {
	const response = await api.get("/leads/import/template", {
		responseType: "blob",
	});

	const filename =
		filenameFromContentDisposition(response.headers?.["content-disposition"]) ||
		"leads-import-template.csv";

	const blob = response.data;
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export async function importLeads(file, source) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("source", source);

	const response = await api.post("/leads/import", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return response.data;
}
