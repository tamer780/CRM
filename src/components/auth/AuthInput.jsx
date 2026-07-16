const AuthInput = ({
	id,
	label,
	type = "text",
	icon: Icon,
	placeholder,
	autoComplete,
	value,
	onChange,
	disabled = false,
	error,
	suffix,
}) => {
	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="block text-sm font-medium text-white/60">
				{label}
			</label>
			<div className="relative">
				{Icon && (
					<Icon
						className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-gold/50"
						aria-hidden="true"
					/>
				)}
				<input
					id={id}
					type={type}
					placeholder={placeholder}
					autoComplete={autoComplete}
					value={value}
					onChange={onChange}
					disabled={disabled}
					className={`auth-input w-full rounded-lg border py-2.5 text-white caret-white placeholder:text-white/40 focus:ring-2 focus:ring-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${Icon ? "pl-10" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}`}
				/>
				{suffix && (
					<div className="absolute top-1/2 right-1 -translate-y-1/2">
						{suffix}
					</div>
				)}
			</div>
			{error && (
				<p className="text-sm text-red-300" role="alert">
					{error}
				</p>
			)}
		</div>
	);
};

export default AuthInput;
