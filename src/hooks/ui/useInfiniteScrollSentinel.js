import { useEffect, useRef } from "react";

export function useInfiniteScrollSentinel({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	rootMargin = "20%",
}) {
	const sentinelRef = useRef(null);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasNextPage || isFetchingNextPage) return undefined;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					fetchNextPage();
				}
			},
			{ root: null, rootMargin, threshold: 0 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin]);

	return sentinelRef;
}
