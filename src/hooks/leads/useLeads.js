import { useQuery } from "@tanstack/react-query";
import { scopeToLeadAssignedTo } from "../../features/users/utils/permissions";
import { getLeads } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { normalizeLeadsList } from "../../utils/leads/leadConstants";
import { getToken } from "../../utils/token/tokenStorage";
import { usePermissions } from "../auth/usePermissions";

function normalizeStatusParams(status) {
  // Undefined = no status filter (dashboard / other pages keep full list).
  if (status === undefined) return [];
  if (!Array.isArray(status) || status.length === 0) return ["default"];
  const cleaned = status.map(String).filter(Boolean);
  return cleaned.length > 0 ? cleaned : ["default"];
}

function normalizeAssignedToParams(assignedTo) {
  if (Array.isArray(assignedTo)) {
    return assignedTo.map(String).filter(Boolean);
  }
  if (assignedTo == null || assignedTo === "") return [];
  return [String(assignedTo)];
}

export function useLeads({
  status,
  assignedTo,
  assignedAtFrom,
  assignedAtTo,
  createdFrom,
  createdTo,
  lastActionFrom,
  lastActionTo,
} = {}) {
  const { scope, isLoading: scopeLoading, user } = usePermissions();
  const statusParams = normalizeStatusParams(status);
  const scopedAssigned = scopeToLeadAssignedTo(scope, assignedTo);
  const assignedParams = normalizeAssignedToParams(scopedAssigned);
  const scopeBlocked = assignedParams.includes("__none__");

  const serverFilters = {
    perPage: 50,
    statusParams,
    assignedParams,
    assignedAtFrom: assignedAtFrom || "",
    assignedAtTo: assignedAtTo || "",
    createdFrom: createdFrom || "",
    createdTo: createdTo || "",
    lastActionFrom: lastActionFrom || "",
    lastActionTo: lastActionTo || "",
    scopeType: scope?.type ?? "all",
  };

  return useQuery({
    queryKey: ["leads", "list", serverFilters],
    queryFn: async () => {
      if (scopeBlocked) return [];
      const response = await getLeads({
        per_page: 50,
        status: statusParams.length > 0 ? statusParams : undefined,
        assigned_to: assignedParams.length > 0 ? assignedParams : undefined,
        assigned_at_from: assignedAtFrom || undefined,
        assigned_at_to: assignedAtTo || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        last_action_from: lastActionFrom || undefined,
        last_action_to: lastActionTo || undefined,
      });
      return normalizeLeadsList(extractData(response));
    },
    enabled: !!getToken() && Boolean(user) && !scopeLoading,
    staleTime: 60 * 1000,
  });
}
