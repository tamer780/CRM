import { MessageSquareText, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import ErrorState from "../../../components/dashboard/ErrorState";
import { useCreateLeadComment } from "../../../hooks/leads/useCreateLeadComment";
import { useLeadComments } from "../../../hooks/leads/useLeadComments";
import { extractApiError } from "../../../utils/api/apiHelpers";
import { getAvatarTone, getInitials } from "../utils/leadAvatars";

const MAX_LENGTH = 2000;

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

const LeadCommentsSection = ({ leadId, users = [], variant = "card" }) => {
	const { t } = useTranslation();
	const commentsQuery = useLeadComments(leadId);
	const createComment = useCreateLeadComment(leadId);
	const embedded = variant === "embedded";

	const [draft, setDraft] = useState("");
	const [localError, setLocalError] = useState("");

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
	const canSubmit =
		trimmed.length > 0 &&
		trimmed.length <= MAX_LENGTH &&
		!createComment.isPending;

	const handleSubmit = () => {
		if (!trimmed) {
			setLocalError(t("leads.comments.required"));
			return;
		}
		if (trimmed.length > MAX_LENGTH) {
			setLocalError(t("leads.comments.tooLong"));
			return;
		}
		setLocalError("");

		createComment.mutate(
			{ comment: trimmed },
			{
				onSuccess: () => {
					setDraft("");
					toast.success(t("leads.comments.posted"));
				},
				onError: (error) => {
					setLocalError(
						extractApiError(error, t("leads.comments.postFailed")),
					);
				},
			},
		);
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
					className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
				/>
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
