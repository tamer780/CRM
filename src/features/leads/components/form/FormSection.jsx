const FormSection = ({ icon: Icon, title, description, children, className = "" }) => {
	return (
		<section
			className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}
		>
			<div className="mb-5 flex gap-3">
				{Icon && (
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-light-gold/70">
						<Icon className="size-5 text-gold" aria-hidden="true" />
					</div>
				)}
				<div className="min-w-0">
					<h3 className="text-base font-semibold text-text">{title}</h3>
					{description && (
						<p className="mt-0.5 text-sm text-muted">{description}</p>
					)}
				</div>
			</div>
			{children}
		</section>
	);
};

export default FormSection;
