import api from "../../api/client";

export async function getScheduledActions() {
	const response = await api.get("/scheduled-actions");
	return response.data;
}

export async function createScheduledAction(body) {
	const response = await api.post("/scheduled-actions", body);
	return response.data;
}

export async function getScheduledAction(scheduledActionId) {
	const response = await api.get(`/scheduled-actions/${scheduledActionId}`);
	return response.data;
}

export async function updateScheduledAction(scheduledActionId, body) {
	const response = await api.put(
		`/scheduled-actions/${scheduledActionId}`,
		body,
	);
	return response.data;
}

export async function deleteScheduledAction(scheduledActionId) {
	const response = await api.delete(
		`/scheduled-actions/${scheduledActionId}`,
	);
	return response.data;
}

export async function completeScheduledAction(scheduledActionId, body) {
	const response = await api.post(
		`/scheduled-actions/${scheduledActionId}/complete`,
		body,
	);
	return response.data;
}
