import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateTeam } from "../../../hooks/teams/useCreateTeam";
import { useDeleteTeam } from "../../../hooks/teams/useDeleteTeam";
import { useTeam } from "../../../hooks/teams/useTeam";
import { useInfiniteTeams } from "../../../hooks/teams/useInfiniteTeams";
import { useUpdateTeam } from "../../../hooks/teams/useUpdateTeam";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	computeTeamKpis,
	emptyTeamFormValues,
	formValuesToPayload,
	teamToFormValues,
	validateTeamForm,
} from "../utils/teamConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterTeams,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/teamFilters";
import TeamDeleteDialog from "./TeamDeleteDialog";
import TeamDetailModal from "./TeamDetailModal";
import TeamFormModal from "./TeamFormModal";
import TeamsHeader from "./TeamsHeader";
import TeamsTable from "./TeamsTable";
import TeamsToolbar from "./TeamsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const TeamsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const teamsQuery = useInfiniteTeams();
	const usersQuery = useUsers();
	const createTeam = useCreateTeam();
	const deleteTeam = useDeleteTeam();

	const filters = useMemo(
		() => filtersFromSearchParams(searchParams),
		[searchParams],
	);
	const { sort, order, selected } = useMemo(
		() => parseTableState(searchParams),
		[searchParams],
	);

	const [searchInput, setSearchInput] = useState(filters.search);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [editingId, setEditingId] = useState(null);
	const [formValues, setFormValues] = useState(emptyTeamFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");

	const updateTeam = useUpdateTeam(editingId);
	const detailQuery = useTeam(selected || null);

	useEffect(() => {
		setSearchInput(filters.search);
	}, [filters.search]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput === filters.search) return;
			const next = applyFiltersToSearchParams(searchParams, {
				...filters,
				search: searchInput,
			});
			next.delete("page");
			setSearchParams(next, { replace: true });
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput, filters, searchParams, setSearchParams]);

	useEffect(() => {
		if (searchParams.get("create") === "1") {
			setModalMode("create");
			setEditingId(null);
			setFormValues(emptyTeamFormValues());
			setFieldErrors({});
			setModalOpen(true);
			const next = new URLSearchParams(searchParams);
			next.delete("create");
			setSearchParams(next, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	const sorting = useMemo(
		() => sortingFromParams(sort, order),
		[sort, order],
	);

	const usersMap = useMemo(
		() => buildLookupMap(usersQuery.data),
		[usersQuery.data],
	);

	const filteredTeams = useMemo(
		() => filterTeams(teamsQuery.data, filters),
		[teamsQuery.data, filters],
	);

	const kpis = useMemo(
		() => computeTeamKpis(teamsQuery.data),
		[teamsQuery.data],
	);

	const isFilteredEmpty =
		!teamsQuery.isLoading &&
		(teamsQuery.data?.length ?? 0) > 0 &&
		filteredTeams.length === 0;

	const actionsPending =
		createTeam.isPending || updateTeam.isPending || deleteTeam.isPending;

	const updateFilters = useCallback(
		(nextFilters) => {
			const next = applyFiltersToSearchParams(searchParams, nextFilters);
			next.delete("page");
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const resetFilters = useCallback(() => {
		setSearchInput("");
		setSearchParams(clearFilterParams(searchParams), { replace: true });
	}, [searchParams, setSearchParams]);

	const handleSortingChange = useCallback(
		(updater) => {
			const nextSorting =
				typeof updater === "function" ? updater(sorting) : updater;
			const next = applySortingToParams(searchParams, nextSorting);
			next.delete("page");
			setSearchParams(next, { replace: true });
		},
		[sorting, searchParams, setSearchParams],
	);

	const openDetail = useCallback(
		(team) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(team.id));
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const closeDetail = useCallback(() => {
		const next = new URLSearchParams(searchParams);
		next.delete("selected");
		setSearchParams(next, { replace: true });
	}, [searchParams, setSearchParams]);

	const openCreate = () => {
		setModalMode("create");
		setEditingId(null);
		setFormValues(emptyTeamFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	const openEdit = (team) => {
		if (selected) closeDetail();
		setModalMode("edit");
		setEditingId(team.id);
		setFormValues(teamToFormValues(team));
		setFieldErrors({});
		setModalOpen(true);
	};

	const closeModal = () => {
		if (actionsPending) return;
		setModalOpen(false);
		setFieldErrors({});
		setEditingId(null);
	};

	const handleSubmit = (values) => {
		const errors = validateTeamForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		const payload = formValuesToPayload(values);

		if (modalMode === "create") {
			createTeam.mutate(payload, {
				onSuccess: () => {
					toast.success(t("teams.toasts.created"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("teams.errors.createFailed")),
					});
				},
			});
			return;
		}

		updateTeam.mutate(payload, {
			onSuccess: () => {
				toast.success(t("teams.toasts.updated"));
				setModalOpen(false);
			},
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("teams.errors.updateFailed")),
				});
			},
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		deleteTeam.mutate(id, {
			onSuccess: () => {
				toast.success(t("teams.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(id)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("teams.errors.deleteFailed")),
				);
			},
		});
	};

	const detailTeam =
		detailQuery.data ??
		filteredTeams.find((item) => String(item.id) === String(selected)) ??
		null;

	const isSubmitting =
		modalMode === "create" ? createTeam.isPending : updateTeam.isPending;

	return (
		<div className="space-y-5">
			<TeamsHeader
				kpis={kpis}
				isLoading={teamsQuery.isLoading}
				isRefreshing={teamsQuery.isFetching}
				onRefresh={() => teamsQuery.refetch()}
				onCreate={openCreate}
			/>

			{teamsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<TeamsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					users={usersQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<TeamsTable
					teams={filteredTeams}
					isLoading={teamsQuery.isLoading}
					isError={teamsQuery.isError}
					onRetry={() => teamsQuery.refetch()}
					hasNextPage={teamsQuery.hasNextPage}
					isFetchingNextPage={teamsQuery.isFetchingNextPage}
					fetchNextPage={teamsQuery.fetchNextPage}
					serverTotal={teamsQuery.total}
					isFilteredEmpty={isFilteredEmpty}
					usersMap={usersMap}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onDelete={(team) => {
						setDeleteError("");
						setDeleteTarget(team);
					}}
					onCreate={openCreate}
				/>
			</div>

			<TeamDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				team={detailTeam}
				isLoading={Boolean(selected) && detailQuery.isLoading && !detailTeam}
				isError={Boolean(selected) && detailQuery.isError && !detailTeam}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				usersMap={usersMap}
			/>

			<TeamFormModal
				open={modalOpen}
				mode={modalMode}
				title={
					modalMode === "edit" ? t("teams.editTeam") : t("teams.newTeam")
				}
				subtitle={t("teams.form.subtitle")}
				onClose={closeModal}
				preventClose={isSubmitting}
				values={formValues}
				onChange={(next) => {
					setFormValues(next);
					if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
				}}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				errors={fieldErrors}
				users={usersQuery.data ?? []}
				usersLoading={usersQuery.isLoading}
			/>

			<TeamDeleteDialog
				open={Boolean(deleteTarget)}
				team={deleteTarget}
				isSubmitting={deleteTeam.isPending}
				error={deleteError}
				onClose={() => !deleteTeam.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default TeamsPage;
