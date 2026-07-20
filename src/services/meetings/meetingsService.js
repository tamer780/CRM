import api from "../../api/client";

function serializeParams(raw) {
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
}

export async function getMeetings({
	page,
	assigned_to,
	status,
	date_from,
	date_to,
	lead_id,
	per_page,
} = {}) {
	const params = {};
	if (page) params.page = page;
	if (Array.isArray(assigned_to) && assigned_to.length > 0) {
		params.assigned_to = assigned_to.map(String);
	}
	if (Array.isArray(status) && status.length > 0) {
		params.status = status.map(String);
	}
	if (date_from) params.date_from = date_from;
	if (date_to) params.date_to = date_to;
	if (lead_id) params.lead_id = lead_id;
	if (per_page) params.per_page = per_page;

	const response = await api.get("/meetings", {
		params,
		paramsSerializer: { serialize: serializeParams },
	});
	return response.data;
}

export async function createMeeting(body) {
	const response = await api.post("/meetings", body);
	return response.data;
}

export async function getMeeting(meetingId) {
	const response = await api.get(`/meetings/${meetingId}`);
	return response.data;
}

export async function updateMeeting(meetingId, body) {
	const response = await api.put(`/meetings/${meetingId}`, body);
	return response.data;
}

export async function deleteMeeting(meetingId) {
	const response = await api.delete(`/meetings/${meetingId}`);
	return response.data;
}
