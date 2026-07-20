import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAvatarTone, getInitials } from "../../../leads/utils/leadAvatars";
import { sortCommentsDesc } from "../../../pendingLeads/utils/activityDiff";
import {
	formatClientDateTime,
	resolveCommentAuthor,
} from "../../utils/clientDetailUtils";

function EmptyState({ title, message }) {
	return (
		<div className="px-4 py-10 text-center">
			<p className="text-sm font-medium text-text">{title}</p>
			<p className="mt-1 text-sm text-muted">{message}</p>
		</div>
	);
}

const ClientCommentsTab = ({ comments = [] }) => {
	const { t } = useTranslation();
	const sorted = useMemo(() => sortCommentsDesc(comments), [comments]);

	if (sorted.length === 0) {
		return (
			<EmptyState
				title={t("clients.drawer.commentsEmptyTitle")}
				message={t("clients.drawer.commentsEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="space-y-3">
			{sorted.map((comment) => {
				const author = resolveCommentAuthor(comment);
				return (
					<li
						key={comment.id}
						className="flex gap-3 rounded-xl border border-border bg-background/40 px-3 py-3"
					>
						<span
							className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(author ?? "?")}`}
						>
							{getInitials(author ?? "?")}
						</span>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-baseline justify-between gap-2">
								<p className="text-sm font-medium text-text">
									{author ?? t("clients.drawer.unknownAuthor")}
								</p>
								<time className="text-xs text-muted">
									{formatClientDateTime(comment.created_at)}
								</time>
							</div>
							<p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
								{comment.body}
							</p>
						</div>
					</li>
				);
			})}
		</ul>
	);
};

export default ClientCommentsTab;
