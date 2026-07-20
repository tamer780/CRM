import { useTranslation } from "react-i18next";
import Spinner from "../auth/Spinner";

const InfiniteScrollFooter = ({
	shown,
	total,
	hasNextPage,
	isFetchingNextPage,
	sentinelRef,
	showingKey,
	loadingMoreKey,
	endKey,
}) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-2">
			{showingKey ? (
				<p className="text-center text-sm text-muted">
					{t(showingKey, { shown, total })}
				</p>
			) : null}
			{isFetchingNextPage ? (
				<div
					className="flex items-center justify-center gap-2 py-3 text-sm text-muted"
					role="status"
					aria-live="polite"
				>
					<Spinner className="size-4" />
					<span>{t(loadingMoreKey)}</span>
				</div>
			) : null}
			{!hasNextPage && shown > 0 ? (
				<p className="text-center text-sm text-muted">{t(endKey)}</p>
			) : null}
			{hasNextPage ? (
				<div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
			) : null}
		</div>
	);
};

export default InfiniteScrollFooter;
