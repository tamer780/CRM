import api from "../../api/client";

export async function getPendingLeads() {
	const response = await api.get("/pending-leads");
	return response.data;
}

export async function getPendingLead(pendingLeadId) {
	const response = await api.get(`/pending-leads/${pendingLeadId}`);
	return response.data;
}

export async function replacePendingLead(pendingLeadId, body) {
	const response = await api.post(
		`/pending-leads/${pendingLeadId}/replace`,
		body,
	);
	return response.data;
}

export async function removePendingLead(pendingLeadId, body) {
	const response = await api.post(
		`/pending-leads/${pendingLeadId}/remove`,
		body,
	);
	return response.data;
}

export async function mergePendingLead(pendingLeadId, body) {
	const response = await api.post(
		`/pending-leads/${pendingLeadId}/merge`,
		body,
	);
	return response.data;
}
