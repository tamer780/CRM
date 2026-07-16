const RateBar = ({ value }) => {
	const rate = Math.min(100, Math.max(0, Number(value) || 0));
	const display = Number.isInteger(rate) ? String(rate) : rate.toFixed(1);

	return (
		<div className="flex min-w-[120px] items-center gap-2">
			<div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
				<div
					className="h-full rounded-full bg-gold transition-all duration-500"
					style={{ width: `${rate}%` }}
				/>
			</div>
			<span className="w-12 shrink-0 text-end text-xs font-medium text-muted">
				{display}%
			</span>
		</div>
	);
};

export default RateBar;
