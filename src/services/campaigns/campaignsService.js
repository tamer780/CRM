import api from "../../api/client";

export async function getCampaigns() {
	const response = await api.get("/campaigns");
	return response.data;
}

export async function createCampaign(body) {
	const response = await api.post("/campaigns", body);
	return response.data;
}

export async function getCampaign(campaignId) {
	const response = await api.get(`/campaigns/${campaignId}`);
	return response.data;
}

export async function updateCampaign(campaignId, body) {
	const response = await api.put(`/campaigns/${campaignId}`, body);
	return response.data;
}

export async function deleteCampaign(campaignId) {
	const response = await api.delete(`/campaigns/${campaignId}`);
	return response.data;
}
