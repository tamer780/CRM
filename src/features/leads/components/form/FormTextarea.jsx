import { useEffect, useId, useRef } from "react";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
	fieldClassName,
} from "./formFieldStyles";

const FormTextarea = ({
	id,
	label,
	required = false,
	error,
	helperText,
	disabled = false,
	loading = false,
	maxLength,
	value = "",
	onChange,
	className,
	minRows = 3,
	...props
}) => {
	const autoId = useId();
	const textareaId = id ?? autoId;
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`;
	}, [value, minRows]);

	if (loading) {
		return (
			<div>
				<FieldLabel htmlFor={textareaId} label={label} required={required} />
				<FieldLoading />
			</div>
		);
	}

	const length = String(value ?? "").length;

	return (
		<div>
			<FieldLabel htmlFor={textareaId} label={label} required={required} />
			<textarea
				ref={ref}
				id={textareaId}
				required={required}
				disabled={disabled}
				maxLength={maxLength}
				value={value}
				onChange={onChange}
				rows={minRows}
				aria-invalid={Boolean(error)}
				className={fieldClassName({
					error,
					className: `resize-none overflow-hidden ${className ?? ""}`,
				})}
				{...props}
			/>
			<div className="mt-1.5 flex items-start justify-between gap-2">
				<FieldMessage error={error} helperText={helperText} />
				{typeof maxLength === "number" && (
					<span className="shrink-0 text-xs text-muted">
						{length}/{maxLength}
					</span>
				)}
			</div>
		</div>
	);
};

export default FormTextarea;
