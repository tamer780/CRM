import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../services/auditLogs/auditLogsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.audit_logs)) return payload.audit_logs;
	return [];
}

export function useAuditLogs() {
	return useQuery({
		queryKey: ["audit-logs", "list"],
		queryFn: async () => {
			const response = await getAuditLogs();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken(),
		staleTime: 60 * 1000,
	});
}
