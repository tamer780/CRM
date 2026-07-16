import api from "../../api/client";

export async function getManagementDashboard() {
	const response = await api.get("/dashboards/management");
	return response.data;
}

export async function getSalesDashboard() {
	const response = await api.get("/dashboards/sales");
	return response.data;
}
