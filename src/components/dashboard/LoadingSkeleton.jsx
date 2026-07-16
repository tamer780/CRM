const LoadingSkeleton = ({ variant = "card" }) => {
	if (variant === "card") {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-3">
						<div className="h-4 w-24 animate-pulse rounded bg-border/80" />
						<div className="h-8 w-16 animate-pulse rounded bg-border/80" />
						<div className="h-3 w-32 animate-pulse rounded bg-border/60" />
					</div>
					<div className="size-11 animate-pulse rounded-xl bg-light-gold/70" />
				</div>
			</div>
		);
	}

	if (variant === "table") {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
				<div className="mb-5 h-6 w-48 animate-pulse rounded bg-border/80" />
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="h-11 animate-pulse rounded-lg bg-border/50"
						/>
					))}
				</div>
			</div>
		);
	}

	if (variant === "header") {
		return (
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-3">
					<div className="h-8 w-40 animate-pulse rounded bg-border/80" />
					<div className="h-4 w-64 animate-pulse rounded bg-border/60" />
					<div className="h-3 w-44 animate-pulse rounded bg-border/50" />
				</div>
				<div className="h-10 w-28 animate-pulse rounded-lg bg-border/70" />
			</div>
		);
	}

	if (variant === "hero") {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
				<div className="flex flex-col gap-6 lg:flex-row">
					<div className="max-w-xl flex-1 space-y-3">
						<div className="h-3 w-28 animate-pulse rounded bg-border/70" />
						<div className="h-7 w-56 animate-pulse rounded bg-border/80" />
						<div className="h-4 w-72 animate-pulse rounded bg-border/60" />
						<div className="flex gap-3 pt-2">
							<div className="h-10 w-32 animate-pulse rounded-xl bg-border/70" />
							<div className="h-10 w-28 animate-pulse rounded-xl bg-border/50" />
						</div>
					</div>
					<div className="grid flex-1 grid-cols-2 gap-3 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-24 animate-pulse rounded-xl bg-border/40"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
	);
};

export default LoadingSkeleton;
