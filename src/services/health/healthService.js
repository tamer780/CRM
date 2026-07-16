import api from "../../api/client";

export async function getHealth() {
	const response = await api.get("/health");
	return response.data;
}

export async function getSalesKpis({ date_from, date_to }) {
	const response = await api.get("/kpis/sales", {
		params: { date_from, date_to },
	});
	return response.data;
}

export async function getTeamsKpis({ date_from, date_to }) {
	const response = await api.get("/kpis/teams", {
		params: { date_from, date_to },
	});
	return response.data;
}
