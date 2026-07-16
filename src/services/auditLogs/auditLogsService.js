import api from "../../api/client";

export async function getAuditLogs() {
	const response = await api.get("/audit-logs");
	return response.data;
}

export async function getAuditLog(auditLogId) {
	const response = await api.get(`/audit-logs/${auditLogId}`);
	return response.data;
}
