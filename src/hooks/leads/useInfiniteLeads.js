import { useInfiniteQuery } from "@tanstack/react-query";
import { scopeToLeadAssignedTo } from "../../features/users/utils/permissions";
import { getLeads } from "../../services/leads/leadsService";
import {
	DEFAULT_PAGE_SIZE,
	extractPaginatedList,
	flattenInfinitePages,
	getNextPageParam,
} from "../../utils/api/pagination";
import { normalizeLeadsList } from "../../utils/leads/leadConstants";
import { getToken } from "../../utils/token/tokenStorage";
import { usePermissions } from "../auth/usePermissions";

function normalizeStatusParams(status) {
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

export function useInfiniteLeads({
	status,
	assignedTo,
	assignedAtFrom,
	assignedAtTo,
	createdFrom,
	createdTo,
	lastActionFrom,
	lastActionTo,
	perPage = DEFAULT_PAGE_SIZE,
} = {}) {
	const { scope, isLoading: scopeLoading, user } = usePermissions();
	const statusParams = normalizeStatusParams(status);
	const scopedAssigned = scopeToLeadAssignedTo(scope, assignedTo);
	const assignedParams = normalizeAssignedToParams(scopedAssigned);
	const scopeBlocked = assignedParams.includes("__none__");

	const serverFilters = {
		perPage,
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

	const query = useInfiniteQuery({
		queryKey: ["leads", "infinite", serverFilters],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			if (scopeBlocked) {
				return {
					items: [],
					currentPage: 1,
					lastPage: 1,
					total: 0,
					perPage,
					nextPageUrl: null,
				};
			}

			const response = await getLeads({
				page: pageParam,
				per_page: perPage,
				status: statusParams.length > 0 ? statusParams : undefined,
				assigned_to: assignedParams.length > 0 ? assignedParams : undefined,
				assigned_at_from: assignedAtFrom || undefined,
				assigned_at_to: assignedAtTo || undefined,
				created_from: createdFrom || undefined,
				created_to: createdTo || undefined,
				last_action_from: lastActionFrom || undefined,
				last_action_to: lastActionTo || undefined,
			});

			const page = extractPaginatedList(response, { listKeys: ["leads"] });
			return {
				...page,
				items: normalizeLeadsList(page.items),
			};
		},
		getNextPageParam,
		enabled: !!getToken() && Boolean(user) && !scopeLoading,
		staleTime: 60 * 1000,
	});

	const pages = query.data?.pages ?? [];
	const items = flattenInfinitePages(pages);
	const total = pages[0]?.total ?? items.length;

	return {
		...query,
		data: items,
		total,
	};
}
