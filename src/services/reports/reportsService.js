import api from "../../api/client";

export async function getProjectReports(params) {
	const response = await api.get("/reports/projects", { params });
	return response.data;
}

export async function getCampaignEvaluationReports(params) {
	const response = await api.get("/reports/campaigns/evaluation", { params });
	return response.data;
}

export async function getSourceReports(params) {
	const response = await api.get("/reports/sources", { params });
	return response.data;
}
