import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateMeeting } from "../../../hooks/meetings/useCreateMeeting";
import { useDeleteMeeting } from "../../../hooks/meetings/useDeleteMeeting";
import { useLeads } from "../../../hooks/leads/useLeads";
import { useMeeting } from "../../../hooks/meetings/useMeeting";
import { useMeetings } from "../../../hooks/meetings/useMeetings";
import { useUpdateMeeting } from "../../../hooks/meetings/useUpdateMeeting";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	computeMeetingKpis,
	emptyMeetingFormValues,
	formValuesToCreatePayload,
	formValuesToUpdatePayload,
	meetingToFormValues,
	validateMeetingForm,
} from "../utils/meetingConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterMeetingsLocally,
	filtersFromSearchParams,
	filtersToApiParams,
	hasActiveMeetingFilters,
	parseTableState,
	sortingFromParams,
} from "../utils/meetingFilters";
import MeetingDeleteDialog from "./MeetingDeleteDialog";
import MeetingDetailModal from "./MeetingDetailModal";
import MeetingFormModal from "./MeetingFormModal";
import MeetingsHeader from "./MeetingsHeader";
import MeetingsTable from "./MeetingsTable";
import MeetingsToolbar from "./MeetingsToolbar";

const MeetingsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const usersQuery = useUsers();
	const leadsQuery = useLeads();
	const createMeeting = useCreateMeeting();
	const deleteMeeting = useDeleteMeeting();

	const filters = useMemo(
		() => filtersFromSearchParams(searchParams),
		[searchParams],
	);
	const { sort, order, selected } = useMemo(
		() => parseTableState(searchParams),
		[searchParams],
	);

	const apiFilters = useMemo(() => filtersToApiParams(filters), [filters]);
	const meetingsQuery = useMeetings(apiFilters);

	const [searchInput, setSearchInput] = useState(filters.search);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [editingId, setEditingId] = useState(null);
	const [formValues, setFormValues] = useState(emptyMeetingFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");

	const updateMeeting = useUpdateMeeting();
	const detailQuery = useMeeting(selected || null);

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
			setFormValues(emptyMeetingFormValues());
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

	const filteredMeetings = useMemo(
		() => filterMeetingsLocally(meetingsQuery.data, filters),
		[meetingsQuery.data, filters],
	);

	const kpis = useMemo(
		() => computeMeetingKpis(meetingsQuery.data),
		[meetingsQuery.data],
	);

	const isFilteredEmpty =
		!meetingsQuery.isLoading &&
		filteredMeetings.length === 0 &&
		hasActiveMeetingFilters(filters);

	const actionsPending =
		createMeeting.isPending ||
		updateMeeting.isPending ||
		deleteMeeting.isPending;

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
		(meeting) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(meeting.id));
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
		setFormValues(emptyMeetingFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	const openEdit = (meeting) => {
		closeDetail();
		setModalMode("edit");
		setEditingId(meeting.id);
		setFormValues(meetingToFormValues(meeting));
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
		const errors = validateMeetingForm(values, t, { mode: modalMode });
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});

		if (modalMode === "create") {
			createMeeting.mutate(formValuesToCreatePayload(values), {
				onSuccess: () => {
					toast.success(t("meetings.toasts.created"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("meetings.errors.createFailed")),
					});
				},
			});
			return;
		}

		updateMeeting.mutate(
			{ meetingId: editingId, body: formValuesToUpdatePayload(values) },
			{
				onSuccess: () => {
					toast.success(t("meetings.toasts.updated"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("meetings.errors.updateFailed")),
					});
				},
			},
		);
	};

	const handleStatusChange = (meeting, status) => {
		if (!meeting?.id || !status || meeting.status === status) return;
		updateMeeting.mutate(
			{
				meetingId: meeting.id,
				body: {
					assigned_to: meeting.assigned_to ?? null,
					status,
					meeting_date: meeting.meeting_date ?? null,
					notes: meeting.notes ?? null,
				},
			},
			{
				onSuccess: () => {
					toast.success(t("meetings.toasts.updated"));
				},
				onError: (error) => {
					toast.error(
						extractApiError(error, t("meetings.errors.updateFailed")),
					);
				},
			},
		);
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		deleteMeeting.mutate(id, {
			onSuccess: () => {
				toast.success(t("meetings.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(id)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("meetings.errors.deleteFailed")),
				);
			},
		});
	};

	const detailMeeting =
		detailQuery.data ??
		filteredMeetings.find((item) => String(item.id) === String(selected)) ??
		null;

	const isSubmitting =
		modalMode === "create" ? createMeeting.isPending : updateMeeting.isPending;

	return (
		<div className="space-y-5">
			<MeetingsHeader
				kpis={kpis}
				isLoading={meetingsQuery.isLoading}
				isRefreshing={meetingsQuery.isFetching}
				onRefresh={() => meetingsQuery.refetch()}
				onCreate={openCreate}
			/>

			{meetingsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<MeetingsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					users={usersQuery.data ?? []}
					leads={leadsQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<MeetingsTable
					meetings={filteredMeetings}
					isLoading={meetingsQuery.isLoading}
					isError={meetingsQuery.isError}
					onRetry={() => meetingsQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					updatingMeetingId={
						updateMeeting.isPending
							? updateMeeting.variables?.meetingId
							: null
					}
					onView={openDetail}
					onEdit={openEdit}
					onStatusChange={handleStatusChange}
					onDelete={(meeting) => {
						setDeleteError("");
						setDeleteTarget(meeting);
					}}
					onCreate={openCreate}
				/>
			</div>

			<MeetingDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				meeting={detailMeeting}
				isLoading={
					Boolean(selected) && detailQuery.isLoading && !detailMeeting
				}
				isError={Boolean(selected) && detailQuery.isError && !detailMeeting}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				actionsDisabled={actionsPending}
				onEdit={openEdit}
				onDelete={(meeting) => {
					setDeleteError("");
					setDeleteTarget(meeting);
				}}
			/>

			<MeetingFormModal
				open={modalOpen}
				mode={modalMode}
				title={
					modalMode === "edit"
						? t("meetings.editMeeting")
						: t("meetings.newMeeting")
				}
				subtitle={t("meetings.form.subtitle")}
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
				leads={leadsQuery.data ?? []}
				leadsLoading={leadsQuery.isLoading}
			/>

			<MeetingDeleteDialog
				open={Boolean(deleteTarget)}
				meeting={deleteTarget}
				isSubmitting={deleteMeeting.isPending}
				error={deleteError}
				onClose={() => !deleteMeeting.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default MeetingsPage;
