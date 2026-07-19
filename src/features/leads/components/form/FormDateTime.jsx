import { useId } from "react";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
	fieldClassName,
} from "./formFieldStyles";

const FormDateTime = ({
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
				type="datetime-local"
				required={required}
				disabled={disabled}
				aria-invalid={Boolean(error)}
				className={fieldClassName({ error, className })}
				{...props}
			/>
			<FieldMessage error={error} helperText={helperText} />
		</div>
	);
};

export default FormDateTime;
