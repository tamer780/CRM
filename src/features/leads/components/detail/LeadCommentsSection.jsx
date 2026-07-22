import {
	CalendarClock,
	Check,
	ChevronDown,
	CircleHelp,
	ListTodo,
	Mail,
	MapPin,
	MessageCircle,
	MessageSquareText,
	Phone,
	RefreshCw,
	Send,
	Users,
} from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import ErrorState from "../../../../components/dashboard/ErrorState";
import { usePermissions } from "../../../../hooks/auth/usePermissions";
import { useCreateLeadComment } from "../../../../hooks/leads/useCreateLeadComment";
import { useLeadComments } from "../../../../hooks/leads/useLeadComments";
import { ROLES } from "../../../users/utils/permissions";
import { SCHEDULED_ACTION_TYPES } from "../../../scheduledActions/utils/scheduledActionConstants";
import { extractApiError } from "../../../../utils/api/apiHelpers";
import { fromDatetimeLocalValue } from "../../../../utils/leads/leadConstants";
import DateTimePickerField from "../form/DateTimePickerField";
import { getAvatarTone, getInitials } from "../../utils/leadAvatars";

const ACTION_TYPE_ICONS = {
	call: Phone,
	follow_up: RefreshCw,
	meeting: Users,
	site_visit: MapPin,
	whatsapp: MessageCircle,
	email: Mail,
	other: CircleHelp,
};

const MENU_MAX_HEIGHT = 260;
const MENU_GAP = 6;

const composerFieldClass = ({ error } = {}) =>
	[
		"w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-muted",
		"focus:border-gold focus:ring-2 focus:ring-gold/25",
		"disabled:cursor-not-allowed disabled:opacity-60",
		error
			? "border-red-400 ring-1 ring-red-100 focus:border-red-400 focus:ring-red-100"
			: "border-border/80 hover:border-gold/50",
	].join(" ");

function ActionTypeSelect({
	id,
	value,
	onChange,
	disabled = false,
	error = false,
	label,
}) {
	const { t } = useTranslation();
	const listId = useId();
	const triggerRef = useRef(null);
	const listRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState(null);

	const SelectedIcon = ACTION_TYPE_ICONS[value] ?? ListTodo;
	const selectedLabel = t(`scheduledActions.types.${value}`, {
		defaultValue: value,
	});

	const updateMenuPosition = () => {
		const trigger = triggerRef.current;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;
		const openUp = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
		const available = openUp ? spaceAbove : spaceBelow;
		const maxHeight = Math.min(MENU_MAX_HEIGHT, Math.max(available - MENU_GAP, 120));

		const style = {
			position: "fixed",
			left: rect.left,
			width: rect.width,
			minWidth: Math.max(rect.width, 200),
			maxHeight,
			zIndex: 220,
		};

		if (openUp) {
			style.bottom = window.innerHeight - rect.top + MENU_GAP;
			style.top = "auto";
		} else {
			style.top = rect.bottom + MENU_GAP;
			style.bottom = "auto";
		}

		setMenuStyle(style);
	};

	useLayoutEffect(() => {
		if (!open) {
			setMenuStyle(null);
			return undefined;
		}
		updateMenuPosition();
		const handleReposition = () => updateMenuPosition();
		window.addEventListener("resize", handleReposition);
		window.addEventListener("scroll", handleReposition, true);
		return () => {
			window.removeEventListener("resize", handleReposition);
			window.removeEventListener("scroll", handleReposition, true);
		};
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;

		const handlePointer = (event) => {
			const inTrigger = triggerRef.current?.contains(event.target);
			const inList = listRef.current?.contains(event.target);
			if (!inTrigger && !inList) setOpen(false);
		};
		const handleKey = (event) => {
			if (event.key === "Escape") setOpen(false);
		};

		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	const selectType = (type) => {
		onChange?.(type);
		setOpen(false);
	};

	const menu =
		open &&
		menuStyle &&
		createPortal(
			<ul
				ref={listRef}
				id={listId}
				role="listbox"
				aria-label={label}
				style={menuStyle}
				className="custom-scrollbar animate-dropdown-in overflow-y-auto rounded-xl border border-gold/30 bg-surface py-1.5 shadow-lg shadow-gold/10"
			>
				{SCHEDULED_ACTION_TYPES.map((type) => {
					const Icon = ACTION_TYPE_ICONS[type] ?? ListTodo;
					const selected = type === value;
					return (
						<li key={type} role="option" aria-selected={selected}>
							<button
								type="button"
								onClick={() => selectType(type)}
								className={[
									"flex w-full items-center justify-between gap-2 px-2.5 py-2 text-start text-sm transition-colors",
									selected
										? "bg-light-gold/70 font-semibold text-text"
										: "text-text hover:bg-light-gold/40",
								].join(" ")}
							>
								<span className="flex min-w-0 items-center gap-2.5">
									<span
										className={[
											"flex size-7 shrink-0 items-center justify-center rounded-lg",
											selected
												? "bg-gold/20 text-gold"
												: "bg-background text-muted",
										].join(" ")}
									>
										<Icon className="size-3.5" aria-hidden="true" />
									</span>
									<span className="truncate">
										{t(`scheduledActions.types.${type}`)}
									</span>
								</span>
								{selected && (
									<Check
										className="size-4 shrink-0 text-gold"
										aria-hidden="true"
									/>
								)}
							</button>
						</li>
					);
				})}
			</ul>,
			document.body,
		);

	return (
		<div className="relative">
			<button
				ref={triggerRef}
				id={id}
				type="button"
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-invalid={error}
				aria-label={label}
				onClick={() => {
					if (!disabled) setOpen((prev) => !prev);
				}}
				className={[
					composerFieldClass({ error }),
					"flex items-center justify-between gap-2 pe-3 text-start font-medium",
					open ? "border-gold ring-2 ring-gold/25" : "",
				].join(" ")}
			>
				<span className="flex min-w-0 items-center gap-2.5">
					<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-light-gold text-gold">
						<SelectedIcon className="size-3.5" aria-hidden="true" />
					</span>
					<span className="truncate">{selectedLabel}</span>
				</span>
				<ChevronDown
					className={[
						"size-4 shrink-0 text-gold transition-transform",
						open ? "rotate-180" : "",
					].join(" ")}
					aria-hidden="true"
				/>
			</button>
			{menu}
		</div>
	);
}

const MAX_LENGTH = 2000;


const INACTIVE_LEAD_STATUSES = new Set(["converted", "not_interested"]);

function isActiveLead(status) {
	if (!status) return true;
	return !INACTIVE_LEAD_STATUSES.has(String(status));
}

function getCommentText(comment) {
	return (
		comment?.comment ??
		comment?.body ??
		comment?.text ??
		comment?.note ??
		comment?.message ??
		""
	);
}

function getAuthorName(comment, usersMap) {
	if (comment?.user?.name) return comment.user.name;
	if (comment?.author?.name) return comment.author.name;
	if (typeof comment?.user_name === "string") return comment.user_name;
	if (typeof comment?.author_name === "string") return comment.author_name;

	const userId =
		comment?.user_id ?? comment?.created_by ?? comment?.author_id ?? null;
	if (userId != null && usersMap) {
		const user =
			usersMap.get(Number(userId)) ?? usersMap.get(String(userId));
		if (user?.name) return user.name;
		if (user?.email) return user.email;
	}

	return null;
}

function formatRelativeTime(value, t) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);

	const diffMs = Date.now() - date.getTime();
	const seconds = Math.round(diffMs / 1000);
	if (seconds < 45) return t("leads.comments.justNow");
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return t("leads.comments.minutesAgo", { count: minutes });
	const hours = Math.round(minutes / 60);
	if (hours < 24) return t("leads.comments.hoursAgo", { count: hours });
	const days = Math.round(hours / 24);
	if (days < 7) return t("leads.comments.daysAgo", { count: days });

	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatFullTime(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function CommentsSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="flex gap-3">
					<div className="size-9 shrink-0 animate-pulse rounded-full bg-border/60" />
					<div className="min-w-0 flex-1 space-y-2 rounded-2xl border border-border/60 bg-background/40 p-3">
						<div className="h-3 w-28 animate-pulse rounded bg-border/70" />
						<div className="h-3 w-full animate-pulse rounded bg-border/50" />
						<div className="h-3 w-2/3 animate-pulse rounded bg-border/40" />
					</div>
				</div>
			))}
		</div>
	);
}

function CommentsEmpty() {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center justify-center px-4 py-10 text-center">
			<div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-light-gold">
				<MessageSquareText className="size-6 text-gold" aria-hidden="true" />
			</div>
			<p className="text-sm font-medium text-text">
				{t("leads.comments.emptyTitle")}
			</p>
			<p className="mt-1 max-w-xs text-sm text-muted">
				{t("leads.comments.emptyMessage")}
			</p>
		</div>
	);
}

const LeadCommentsSection = ({
	leadId,
	leadStatus,
	users = [],
	variant = "card",
}) => {
	const { t } = useTranslation();
	const { role } = usePermissions();
	const commentsQuery = useLeadComments(leadId);
	const createComment = useCreateLeadComment(leadId);
	const embedded = variant === "embedded";
	const isSuperAdmin = role === ROLES.SUPER_ADMIN;
	const showScheduledAction = isActiveLead(leadStatus);
	const requiresScheduledAction = showScheduledAction && !isSuperAdmin;

	const [draft, setDraft] = useState("");
	const [actionType, setActionType] = useState("call");
	const [scheduledAt, setScheduledAt] = useState("");
	const [actionNote, setActionNote] = useState("");
	const [localError, setLocalError] = useState("");
	const [fieldErrors, setFieldErrors] = useState({});

	const usersMap = useMemo(() => {
		const map = new Map();
		for (const user of users ?? []) {
			if (user?.id == null) continue;
			map.set(Number(user.id), user);
			map.set(String(user.id), user);
		}
		return map;
	}, [users]);

	const comments = commentsQuery.data ?? [];
	const trimmed = draft.trim();
	const wantsScheduledAction = Boolean(scheduledAt);
	const canSubmit =
		trimmed.length > 0 &&
		trimmed.length <= MAX_LENGTH &&
		(!requiresScheduledAction ||
			(Boolean(actionType) && Boolean(scheduledAt))) &&
		(!wantsScheduledAction || Boolean(actionType)) &&
		!createComment.isPending;

	const resetComposer = () => {
		setDraft("");
		setActionType("call");
		setScheduledAt("");
		setActionNote("");
		setFieldErrors({});
	};

	const handleSubmit = () => {
		if (!trimmed) {
			setLocalError(t("leads.comments.required"));
			return;
		}
		if (trimmed.length > MAX_LENGTH) {
			setLocalError(t("leads.comments.tooLong"));
			return;
		}

		const includeScheduledAction =
			requiresScheduledAction ||
			(showScheduledAction && wantsScheduledAction);

		const nextFieldErrors = {};
		if (includeScheduledAction) {
			if (!actionType) {
				nextFieldErrors.type = t("leads.comments.actionTypeRequired");
			}
			if (!scheduledAt) {
				nextFieldErrors.scheduled_at = t(
					"leads.comments.scheduledAtRequired",
				);
			} else {
				const iso = fromDatetimeLocalValue(scheduledAt);
				if (!iso) {
					nextFieldErrors.scheduled_at = t(
						"leads.comments.scheduledAtInvalid",
					);
				}
			}
		}

		if (Object.keys(nextFieldErrors).length > 0) {
			setFieldErrors(nextFieldErrors);
			setLocalError(t("leads.comments.scheduledActionRequired"));
			return;
		}

		setLocalError("");
		setFieldErrors({});

		const payload = { body: trimmed };
		if (includeScheduledAction) {
			const note =
				typeof actionNote === "string" && actionNote.trim()
					? actionNote.trim()
					: undefined;
			payload.scheduled_action = {
				type: actionType,
				scheduled_at: fromDatetimeLocalValue(scheduledAt),
				...(note ? { note } : {}),
			};
		}

		createComment.mutate(payload, {
			onSuccess: () => {
				resetComposer();
				toast.success(t("leads.comments.posted"));
			},
			onError: (error) => {
				setLocalError(
					extractApiError(error, t("leads.comments.postFailed")),
				);
			},
		});
	};

	const handleKeyDown = (event) => {
		if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
			event.preventDefault();
			if (canSubmit) handleSubmit();
		}
	};

	const body = (
		<>
			{!embedded && (
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 sm:px-6">
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-xl bg-light-gold">
							<MessageSquareText
								className="size-4 text-gold"
								aria-hidden="true"
							/>
						</div>
						<div>
							<h2 className="text-lg font-semibold text-text">
								{t("leads.comments.title")}
							</h2>
							<p className="text-xs text-muted">
								{commentsQuery.isLoading
									? t("common.loading")
									: t("leads.comments.count", { count: comments.length })}
							</p>
						</div>
					</div>
				</div>
			)}

			{embedded && (
				<div className="border-b border-border px-5 py-2 sm:px-6">
					<p className="text-xs text-muted">
						{commentsQuery.isLoading
							? t("common.loading")
							: t("leads.comments.count", { count: comments.length })}
					</p>
				</div>
			)}

			{/* Composer */}
			<div className="border-b border-border bg-background/40 px-5 py-4 sm:px-6">
				<label className="sr-only" htmlFor="lead-comment-draft">
					{t("leads.comments.placeholder")}
				</label>
				<textarea
					id="lead-comment-draft"
					value={draft}
					onChange={(e) => {
						setDraft(e.target.value);
						if (localError) setLocalError("");
					}}
					onKeyDown={handleKeyDown}
					placeholder={t("leads.comments.placeholder")}
					rows={3}
					maxLength={MAX_LENGTH}
					disabled={createComment.isPending}
					className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-muted focus:border-gold focus:ring-2 focus:ring-gold/25 disabled:opacity-60"
				/>

				{showScheduledAction && (
					<div className="mt-3 overflow-visible rounded-2xl border border-gold/25 bg-linear-to-br from-light-gold/80 via-surface to-surface shadow-sm">
						<div className="flex items-start gap-2.5 rounded-t-2xl border-b border-gold/20 bg-light-gold/50 px-3.5 py-2.5">
							<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
								<ListTodo className="size-3.5" aria-hidden="true" />
							</span>
							<div className="min-w-0">
								<p className="text-xs font-semibold text-text">
									{t("leads.comments.nextActionTitle")}
									{!requiresScheduledAction && (
										<span className="ms-1.5 font-medium text-muted">
											({t("leads.comments.optional")})
										</span>
									)}
								</p>
								<p className="mt-0.5 text-[11px] leading-snug text-muted">
									{requiresScheduledAction
										? t("leads.comments.nextActionHint")
										: t("leads.comments.nextActionHintOptional")}
								</p>
							</div>
						</div>

						<div className="space-y-3 p-3.5">
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label
										htmlFor="lead-comment-action-type"
										className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted"
									>
										<span className="flex size-5 items-center justify-center rounded-md bg-light-gold text-gold">
											<ListTodo className="size-3" aria-hidden="true" />
										</span>
										{t("leads.comments.actionType")}
										{requiresScheduledAction && (
											<span className="text-gold" aria-hidden="true">
												*
											</span>
										)}
									</label>
									<ActionTypeSelect
										id="lead-comment-action-type"
										label={t("leads.comments.actionType")}
										value={actionType}
										disabled={createComment.isPending}
										error={Boolean(fieldErrors.type)}
										onChange={(next) => {
											setActionType(next);
											if (fieldErrors.type) {
												setFieldErrors((prev) => {
													const nextErrors = { ...prev };
													delete nextErrors.type;
													return nextErrors;
												});
											}
										}}
									/>
									{fieldErrors.type && (
										<p className="mt-1.5 text-xs text-red-600">
											{fieldErrors.type}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="lead-comment-scheduled-at"
										className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted"
									>
										<span className="flex size-5 items-center justify-center rounded-md bg-light-gold text-gold">
											<CalendarClock className="size-3" aria-hidden="true" />
										</span>
										{t("leads.comments.scheduledAt")}
										{requiresScheduledAction && (
											<span className="text-gold" aria-hidden="true">
												*
											</span>
										)}
									</label>
									<DateTimePickerField
										id="lead-comment-scheduled-at"
										value={scheduledAt}
										disabled={createComment.isPending}
										error={Boolean(fieldErrors.scheduled_at)}
										placeholder={t("leads.dateTime.placeholder")}
										onChange={(next) => {
											setScheduledAt(next);
											if (fieldErrors.scheduled_at) {
												setFieldErrors((prev) => {
													const nextErrors = { ...prev };
													delete nextErrors.scheduled_at;
													return nextErrors;
												});
											}
										}}
									/>
									{fieldErrors.scheduled_at && (
										<p className="mt-1.5 text-xs text-red-600">
											{fieldErrors.scheduled_at}
										</p>
									)}
								</div>
							</div>

							<div>
								<label
									htmlFor="lead-comment-action-note"
									className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
								>
									{t("leads.comments.actionNote")}
								</label>
								<textarea
									id="lead-comment-action-note"
									value={actionNote}
									rows={2}
									maxLength={500}
									disabled={createComment.isPending}
									placeholder={t("leads.comments.actionNotePlaceholder")}
									className={`${composerFieldClass()} resize-none`}
									onChange={(e) => setActionNote(e.target.value)}
								/>
							</div>
						</div>
					</div>
				)}

				<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
					<p className="text-xs text-muted">
						{t("leads.comments.shortcutHint")}
						<span className="ms-2 tabular-nums">
							{draft.length}/{MAX_LENGTH}
						</span>
					</p>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!canSubmit}
						className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
					>
						<Send className="size-3.5" aria-hidden="true" />
						{createComment.isPending
							? t("common.loading")
							: t("leads.comments.post")}
					</button>
				</div>
				{localError && (
					<p
						role="alert"
						className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
					>
						{localError}
					</p>
				)}
			</div>

			{/* List */}
			<div className="px-5 py-5 sm:px-6">
				{commentsQuery.isLoading && <CommentsSkeleton />}

				{commentsQuery.isError && !commentsQuery.isLoading && (
					<ErrorState
						message={t("leads.comments.loadFailed")}
						onRetry={() => commentsQuery.refetch()}
					/>
				)}

				{!commentsQuery.isLoading &&
					!commentsQuery.isError &&
					comments.length === 0 && <CommentsEmpty />}

				{!commentsQuery.isLoading &&
					!commentsQuery.isError &&
					comments.length > 0 && (
						<ul className="relative space-y-0">
							<span
								className="absolute start-[1.05rem] top-3 bottom-3 w-px bg-border"
								aria-hidden="true"
							/>
							{comments.map((comment, index) => {
								const text = getCommentText(comment);
								const author =
									getAuthorName(comment, usersMap) ??
									t("leads.comments.unknownAuthor");
								const createdAt =
									comment.created_at ?? comment.createdAt ?? null;

								return (
									<li
										key={comment.id ?? `${index}-${createdAt}`}
										className={[
											"relative flex gap-3 pb-5 last:pb-0",
											comment._optimistic ? "opacity-70" : "",
										].join(" ")}
									>
										<span
											className={`relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ring-4 ring-surface ${getAvatarTone(author)}`}
										>
											{getInitials(author)}
										</span>
										<div className="min-w-0 flex-1 rounded-2xl border border-border bg-background/50 px-4 py-3 transition hover:border-accent/30">
											<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
												<p className="text-sm font-semibold text-text">
													{author}
												</p>
												{createdAt && (
													<time
														dateTime={createdAt}
														title={formatFullTime(createdAt)}
														className="text-xs text-muted"
													>
														{formatRelativeTime(createdAt, t)}
													</time>
												)}
											</div>
											<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text">
												{text || "—"}
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					)}
			</div>
		</>
	);

	if (embedded) {
		return <div>{body}</div>;
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
			{body}
		</section>
	);
};

export default LeadCommentsSection;
