import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAvatarTone, getInitials } from "../../../leads/utils/leadAvatars";
import {
	dedupeTimeline,
	formatClientDateTime,
	resolveCommentAuthor,
	sortByOccurredAtDesc,
} from "../../utils/clientDetailUtils";
import ClientActivityItem from "./ClientActivityItem";

function EmptyState({ title, message }) {
	return (
		<div className="px-4 py-10 text-center">
			<p className="text-sm font-medium text-text">{title}</p>
			<p className="mt-1 text-sm text-muted">{message}</p>
		</div>
	);
}

function TimelineSourceBadge({ source, t }) {
	if (!source) return null;
	const sourceKey = String(source).toLowerCase();
	return (
		<span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted ring-1 ring-inset ring-border">
			{t(`clients.drawer.timelineSources.${sourceKey}`, {
				defaultValue: sourceKey,
			})}
		</span>
	);
}

function TimelineCommentItem({ comment, source }) {
	const { t } = useTranslation();
	const author = resolveCommentAuthor(comment);

	return (
		<li className="relative ps-6">
			<span
				className="absolute start-0 top-2 size-2.5 rounded-full bg-blue-400 ring-4 ring-surface"
				aria-hidden="true"
			/>
			<div className="rounded-xl border border-border bg-background/40 px-3 py-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-sm font-medium text-text">
							{t("clients.drawer.timelineComment")}
						</p>
						<TimelineSourceBadge source={source} t={t} />
					</div>
					<time className="shrink-0 text-xs text-muted">
						{formatClientDateTime(comment.created_at)}
					</time>
				</div>
				<div className="mt-2 flex items-center gap-2">
					<span
						className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${getAvatarTone(author ?? "?")}`}
					>
						{getInitials(author ?? "?")}
					</span>
					<span className="text-xs text-muted">
						{author ?? t("clients.drawer.unknownAuthor")}
					</span>
				</div>
				<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text">
					{comment.body}
				</p>
			</div>
		</li>
	);
}

const ClientTimelineTab = ({ timeline = [] }) => {
	const { t } = useTranslation();

	const items = useMemo(() => {
		const deduped = dedupeTimeline(timeline);
		return sortByOccurredAtDesc(deduped, "occurred_at");
	}, [timeline]);

	if (items.length === 0) {
		return (
			<EmptyState
				title={t("clients.drawer.timelineEmptyTitle")}
				message={t("clients.drawer.timelineEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="relative space-y-3 border-s border-border ms-1.5 py-1">
			{items.map((item) => {
				const key = `${item.type}-${item.data?.id ?? item.occurred_at}`;
				if (item.type === "comment") {
					return (
						<TimelineCommentItem
							key={key}
							comment={item.data}
							source={item.source}
						/>
					);
				}
				if (item.type === "activity") {
					return (
						<ClientActivityItem
							key={key}
							activity={item.data}
							source={item.source}
						/>
					);
				}
				return null;
			})}
		</ul>
	);
};

export default ClientTimelineTab;
