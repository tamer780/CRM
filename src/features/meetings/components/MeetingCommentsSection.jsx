import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { sortCommentsDesc } from "../../pendingLeads/utils/activityDiff";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";

function formatDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function resolveCommentBody(comment) {
	return comment?.body ?? comment?.comment ?? comment?.text ?? "";
}

function resolveCommentAuthor(comment, fallbackName) {
	return (
		comment?.user?.name ??
		comment?.creator?.name ??
		(comment?.user_id != null ? `#${comment.user_id}` : null) ??
		(comment?.created_by != null ? `#${comment.created_by}` : null) ??
		fallbackName ??
		null
	);
}

function commentBodiesMatch(a, b) {
	const left = String(a ?? "")
		.trim()
		.toLowerCase();
	const right = String(b ?? "")
		.trim()
		.toLowerCase();
	return left.length > 0 && left === right;
}

function isSameComment(a, b) {
	if (!a || !b) return false;
	if (a.id != null && b.id != null) return String(a.id) === String(b.id);
	return commentBodiesMatch(resolveCommentBody(a), resolveCommentBody(b));
}

function CommentCard({
	author,
	body,
	createdAt,
	isLatest = false,
	isOpening = false,
	t,
}) {
	const displayAuthor = author ?? t("meetings.drawer.unknownAuthor");

	return (
		<li className="flex gap-3 rounded-xl border border-border bg-background/40 px-3 py-3">
			<span
				className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(displayAuthor)}`}
			>
				{getInitials(displayAuthor)}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<div className="flex min-w-0 flex-wrap items-center gap-2">
						<p className="text-sm font-medium text-text">{displayAuthor}</p>
						{isOpening && (
							<span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
								{t("meetings.drawer.openingComment")}
							</span>
						)}
						{isLatest && (
							<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
								{t("meetings.drawer.latest")}
							</span>
						)}
					</div>
					{createdAt ? (
						<time className="text-xs text-muted">{formatDateTime(createdAt)}</time>
					) : null}
				</div>
				<p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
					{body}
				</p>
			</div>
		</li>
	);
}

const MeetingCommentsSection = ({ meeting }) => {
	const { t } = useTranslation();

	const openingComment =
		typeof meeting?.comment === "string" && meeting.comment.trim()
			? meeting.comment.trim()
			: null;

	const sortedComments = useMemo(
		() => sortCommentsDesc(meeting?.comments ?? []),
		[meeting?.comments],
	);

	const openingAlreadyInList = useMemo(() => {
		if (!openingComment) return false;
		return sortedComments.some((item) =>
			commentBodiesMatch(resolveCommentBody(item), openingComment),
		);
	}, [openingComment, sortedComments]);

	const showOpeningPin = Boolean(openingComment) && !openingAlreadyInList;
	const totalCount = sortedComments.length + (showOpeningPin ? 1 : 0);
	const lastComment = meeting?.last_comment ?? null;
	const creatorName =
		meeting?.creator?.name ??
		(meeting?.created_by != null ? `#${meeting.created_by}` : null);

	if (totalCount === 0) {
		return (
			<section>
				<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
					{t("meetings.drawer.comments")}
				</h3>
				<div className="rounded-2xl border border-border bg-background/40 px-4 py-10 text-center">
					<p className="text-sm font-medium text-text">
						{t("meetings.drawer.commentsEmptyTitle")}
					</p>
					<p className="mt-1 text-sm text-muted">
						{t("meetings.drawer.commentsEmptyMessage")}
					</p>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="mb-3 flex items-center gap-2">
				<h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
					{t("meetings.drawer.comments")}
				</h3>
				<span className="rounded-full bg-border/60 px-2 py-0.5 text-[11px] font-medium text-muted">
					{totalCount}
				</span>
			</div>
			<ul className="space-y-3">
				{showOpeningPin && (
					<CommentCard
						author={creatorName}
						body={openingComment}
						createdAt={meeting?.created_at}
						isOpening
						isLatest={!lastComment && sortedComments.length === 0}
						t={t}
					/>
				)}
				{sortedComments.map((comment) => {
					const body = resolveCommentBody(comment);
					const isLatest = lastComment
						? isSameComment(comment, lastComment)
						: sortedComments[0]?.id != null
							? String(sortedComments[0].id) === String(comment.id)
							: sortedComments[0] === comment;

					return (
						<CommentCard
							key={comment.id ?? `${body}-${comment.created_at}`}
							author={resolveCommentAuthor(comment)}
							body={body}
							createdAt={comment.created_at}
							isLatest={isLatest}
							t={t}
						/>
					);
				})}
			</ul>
		</section>
	);
};

export default MeetingCommentsSection;
