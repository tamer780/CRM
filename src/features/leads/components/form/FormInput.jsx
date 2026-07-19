import { useId } from "react";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
	fieldClassName,
} from "./formFieldStyles";

const FormInput = ({
	id,
	label,
	required = false,
	error,
	helperText,
	disabled = false,
	loading = false,
	className,
	...props
}) => {
	const autoId = useId();
	const inputId = id ?? autoId;

	if (loading) {
		return (
			<div>
				<FieldLabel htmlFor={inputId} label={label} required={required} />
				<FieldLoading />
			</div>
		);
	}

	return (
		<div>
			<FieldLabel htmlFor={inputId} label={label} required={required} />
			<input
				id={inputId}
				required={required}
				disabled={disabled}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${inputId}-error` : undefined}
				className={fieldClassName({ error, className })}
				{...props}
			/>
			<div id={error ? `${inputId}-error` : undefined}>
				<FieldMessage error={error} helperText={helperText} />
			</div>
		</div>
	);
};

export default FormInput;
