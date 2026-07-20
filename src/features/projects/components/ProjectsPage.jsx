import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateProject } from "../../../hooks/projects/useCreateProject";
import { useDeleteProject } from "../../../hooks/projects/useDeleteProject";
import { useImportProjectLeads } from "../../../hooks/projects/useImportProjectLeads";
import { useProject } from "../../../hooks/projects/useProject";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useProjectTeams } from "../../../hooks/projects/useProjectTeams";
import { useTeams } from "../../../hooks/teams/useTeams";
import { useUpdateProject } from "../../../hooks/projects/useUpdateProject";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	computeProjectKpis,
	emptyProjectFormValues,
	formValuesToPayload,
	projectToFormValues,
	validateProjectForm,
} from "../utils/projectConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterProjects,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/projectFilters";
import ProjectDeleteDialog from "./ProjectDeleteDialog";
import ProjectDetailModal from "./ProjectDetailModal";
import ProjectFormModal from "./ProjectFormModal";
import ProjectImportModal from "./ProjectImportModal";
import ProjectsHeader from "./ProjectsHeader";
import ProjectsTable from "./ProjectsTable";
import ProjectsToolbar from "./ProjectsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const ProjectsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const projectsQuery = useProjects();
	const teamsQuery = useTeams();
	const usersQuery = useUsers();
	const createProject = useCreateProject();
	const deleteProject = useDeleteProject();
	const importLeads = useImportProjectLeads();

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
	const [formValues, setFormValues] = useState(emptyProjectFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");
	const [importTarget, setImportTarget] = useState(null);
	const [importError, setImportError] = useState("");

	const updateProject = useUpdateProject(editingId);
	const detailQuery = useProject(selected || null);
	const projectTeamsQuery = useProjectTeams(selected || null);

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
			setFormValues(emptyProjectFormValues());
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

	const filteredProjects = useMemo(
		() => filterProjects(projectsQuery.data, filters),
		[projectsQuery.data, filters],
	);

	const kpis = useMemo(
		() => computeProjectKpis(projectsQuery.data),
		[projectsQuery.data],
	);

	const isFilteredEmpty =
		!projectsQuery.isLoading &&
		(projectsQuery.data?.length ?? 0) > 0 &&
		filteredProjects.length === 0;

	const actionsPending =
		createProject.isPending ||
		updateProject.isPending ||
		deleteProject.isPending ||
		importLeads.isPending;

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
		(project) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(project.id));
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
		setFormValues(emptyProjectFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	const openEdit = (project) => {
		if (selected) closeDetail();
		setModalMode("edit");
		setEditingId(project.id);
		setFormValues(projectToFormValues(project));
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
		const errors = validateProjectForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		const payload = formValuesToPayload(values);

		if (modalMode === "create") {
			createProject.mutate(payload, {
				onSuccess: () => {
					toast.success(t("projects.toasts.created"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("projects.errors.createFailed")),
					});
				},
			});
			return;
		}

		updateProject.mutate(payload, {
			onSuccess: () => {
				toast.success(t("projects.toasts.updated"));
				setModalOpen(false);
			},
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("projects.errors.updateFailed")),
				});
			},
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		deleteProject.mutate(id, {
			onSuccess: () => {
				toast.success(t("projects.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(id)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("projects.errors.deleteFailed")),
				);
			},
		});
	};

	const handleImport = (file) => {
		if (!importTarget) return;
		importLeads.mutate(
			{ projectId: importTarget.id, file },
			{
				onSuccess: () => {
					toast.success(t("projects.toasts.imported"));
					setImportTarget(null);
					setImportError("");
				},
				onError: (error) => {
					setImportError(
						extractApiError(error, t("projects.errors.importFailed")),
					);
				},
			},
		);
	};

	const detailProject =
		detailQuery.data ??
		filteredProjects.find((item) => String(item.id) === String(selected)) ??
		null;

	const isSubmitting =
		modalMode === "create"
			? createProject.isPending
			: updateProject.isPending;

	return (
		<div className="space-y-5">
			<ProjectsHeader
				kpis={kpis}
				isLoading={projectsQuery.isLoading}
				isRefreshing={projectsQuery.isFetching}
				onRefresh={() => projectsQuery.refetch()}
				onCreate={openCreate}
			/>

			{projectsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<ProjectsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					teams={teamsQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<ProjectsTable
					projects={filteredProjects}
					isLoading={projectsQuery.isLoading}
					isError={projectsQuery.isError}
					onRetry={() => projectsQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					usersMap={usersMap}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onImport={(project) => {
						setImportError("");
						setImportTarget(project);
					}}
					onDelete={(project) => {
						setDeleteError("");
						setDeleteTarget(project);
					}}
					onCreate={openCreate}
				/>
			</div>

			<ProjectDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				project={detailProject}
				isLoading={
					Boolean(selected) && detailQuery.isLoading && !detailProject
				}
				isError={
					Boolean(selected) && detailQuery.isError && !detailProject
				}
				onRetry={() => {
					detailQuery.refetch();
					projectTeamsQuery.refetch();
				}}
				preventClose={actionsPending}
				usersMap={usersMap}
				projectTeams={projectTeamsQuery.data ?? []}
				teamsLoading={
					Boolean(selected) &&
					projectTeamsQuery.isLoading &&
					!(projectTeamsQuery.data?.length > 0)
				}
			/>

			<ProjectFormModal
				open={modalOpen}
				mode={modalMode}
				title={
					modalMode === "edit"
						? t("projects.editProject")
						: t("projects.newProject")
				}
				subtitle={t("projects.form.subtitle")}
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
				teams={teamsQuery.data ?? []}
				teamsLoading={teamsQuery.isLoading}
			/>

			<ProjectDeleteDialog
				open={Boolean(deleteTarget)}
				project={deleteTarget}
				isSubmitting={deleteProject.isPending}
				error={deleteError}
				onClose={() => !deleteProject.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>

			<ProjectImportModal
				open={Boolean(importTarget)}
				project={importTarget}
				isSubmitting={importLeads.isPending}
				error={importError}
				onClose={() => !importLeads.isPending && setImportTarget(null)}
				onConfirm={handleImport}
			/>
		</div>
	);
};

export default ProjectsPage;
