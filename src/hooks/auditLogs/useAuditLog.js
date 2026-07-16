import { useQuery } from "@tanstack/react-query";
import { getAuditLog } from "../../services/auditLogs/auditLogsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useAuditLog(auditLogId) {
	return useQuery({
		queryKey: ["audit-logs", String(auditLogId)],
		queryFn: async () => {
			const response = await getAuditLog(auditLogId);
			return extractData(response);
		},
		enabled: !!getToken() && !!auditLogId,
		staleTime: 60 * 1000,
	});
}
