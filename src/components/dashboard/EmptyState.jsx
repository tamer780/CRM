const EmptyState = ({ icon: Icon, title, message }) => {
	return (
		<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
			{Icon && (
				<div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-light-gold">
					<Icon className="size-7 text-gold" aria-hidden="true" />
				</div>
			)}
			<h3 className="text-base font-semibold text-text">{title}</h3>
			{message && <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>}
		</div>
	);
};

export default EmptyState;
