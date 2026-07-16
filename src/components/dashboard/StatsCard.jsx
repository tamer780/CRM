const StatsCard = ({ icon: Icon, title, value, description }) => {
	return (
		<div className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-sm font-medium text-muted">{title}</p>
					<p className="mt-2 text-3xl font-semibold tracking-tight text-text">
						{value}
					</p>
					{description && (
						<p className="mt-1.5 text-xs text-muted">{description}</p>
					)}
				</div>
				{Icon && (
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-light-gold transition-transform duration-300 group-hover:scale-105">
						<Icon className="size-5 text-gold" aria-hidden="true" />
					</div>
				)}
			</div>
		</div>
	);
};

export default StatsCard;
