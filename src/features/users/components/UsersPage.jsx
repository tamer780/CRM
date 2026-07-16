import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useActivateUser } from "../../../hooks/users/useActivateUser";
import { useCreateUser } from "../../../hooks/users/useCreateUser";
import { useDeactivateUser } from "../../../hooks/users/useDeactivateUser";
import { useDeleteUser } from "../../../hooks/users/useDeleteUser";
import { useUpdateUser } from "../../../hooks/users/useUpdateUser";
import { useUser } from "../../../hooks/users/useUser";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	computeUserKpis,
	emptyUserFormValues,
	formValuesToPayload,
	isUserActive,
	userToFormValues,
	validateUserForm,
} from "../utils/userConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterUsers,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/userFilters";
import UserDeleteDialog from "./UserDeleteDialog";
import UserDetailModal from "./UserDetailModal";
import UserFormModal from "./UserFormModal";
import UsersHeader from "./UsersHeader";
import UsersTable from "./UsersTable";
import UsersToolbar from "./UsersToolbar";

const UsersPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const usersQuery = useUsers();
	const createUser = useCreateUser();
	const deleteUser = useDeleteUser();
	const activateUser = useActivateUser();
	const deactivateUser = useDeactivateUser();

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
	const [formValues, setFormValues] = useState(emptyUserFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");

	const updateUser = useUpdateUser(editingId);
	const detailQuery = useUser(selected || null);

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
			setFormValues(emptyUserFormValues());
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

	const filteredUsers = useMemo(
		() => filterUsers(usersQuery.data, filters),
		[usersQuery.data, filters],
	);

	const kpis = useMemo(
		() => computeUserKpis(usersQuery.data),
		[usersQuery.data],
	);

	const isFilteredEmpty =
		!usersQuery.isLoading &&
		(usersQuery.data?.length ?? 0) > 0 &&
		filteredUsers.length === 0;

	const actionsPending =
		createUser.isPending ||
		updateUser.isPending ||
		deleteUser.isPending ||
		activateUser.isPending ||
		deactivateUser.isPending;

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
		(user) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(user.id));
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
		setFormValues(emptyUserFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	const openEdit = (user) => {
		setModalMode("edit");
		setEditingId(user.id);
		setFormValues(userToFormValues(user));
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
		const errors = validateUserForm(values, t, modalMode);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		const payload = formValuesToPayload(values, modalMode);

		if (modalMode === "create") {
			createUser.mutate(payload, {
				onSuccess: () => {
					toast.success(t("users.toasts.created"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("users.errors.createFailed")),
					});
				},
			});
			return;
		}

		updateUser.mutate(payload, {
			onSuccess: () => {
				toast.success(t("users.toasts.updated"));
				setModalOpen(false);
			},
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("users.errors.updateFailed")),
				});
			},
		});
	};

	const handleToggleActive = (user) => {
		const active = isUserActive(user);
		const mutation = active ? deactivateUser : activateUser;
		mutation.mutate(user.id, {
			onSuccess: () => {
				toast.success(
					active
						? t("users.toasts.deactivated")
						: t("users.toasts.activated"),
				);
			},
			onError: (error) => {
				toast.error(
					extractApiError(
						error,
						active
							? t("users.errors.deactivateFailed")
							: t("users.errors.activateFailed"),
					),
				);
			},
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		deleteUser.mutate(id, {
			onSuccess: () => {
				toast.success(t("users.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(id)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("users.errors.deleteFailed")),
				);
			},
		});
	};

	const detailUser =
		detailQuery.data ??
		filteredUsers.find((item) => String(item.id) === String(selected)) ??
		null;

	const isSubmitting =
		modalMode === "create" ? createUser.isPending : updateUser.isPending;

	return (
		<div className="space-y-5">
			<UsersHeader
				kpis={kpis}
				isLoading={usersQuery.isLoading}
				isRefreshing={usersQuery.isFetching}
				onRefresh={() => usersQuery.refetch()}
				onCreate={openCreate}
			/>

			{usersQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<UsersToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
				/>
			)}

			<div className="space-y-4">
				<UsersTable
					users={filteredUsers}
					isLoading={usersQuery.isLoading}
					isError={usersQuery.isError}
					onRetry={() => usersQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onToggleActive={handleToggleActive}
					onDelete={(user) => {
						setDeleteError("");
						setDeleteTarget(user);
					}}
					onCreate={openCreate}
				/>
			</div>

			<UserDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				user={detailUser}
				isLoading={Boolean(selected) && detailQuery.isLoading && !detailUser}
				isError={Boolean(selected) && detailQuery.isError && !detailUser}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				actionsDisabled={actionsPending}
				onEdit={openEdit}
				onToggleActive={handleToggleActive}
				onDelete={(user) => {
					setDeleteError("");
					setDeleteTarget(user);
				}}
			/>

			<UserFormModal
				open={modalOpen}
				mode={modalMode}
				title={
					modalMode === "edit" ? t("users.editUser") : t("users.newUser")
				}
				subtitle={t("users.form.subtitle")}
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
			/>

			<UserDeleteDialog
				open={Boolean(deleteTarget)}
				user={deleteTarget}
				isSubmitting={deleteUser.isPending}
				error={deleteError}
				onClose={() => !deleteUser.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default UsersPage;
