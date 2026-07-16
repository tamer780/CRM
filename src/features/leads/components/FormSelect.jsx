import { useId } from "react";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
	fieldClassName,
} from "./formFieldStyles";

const FormSelect = ({
	id,
	label,
	required = false,
	error,
	helperText,
	disabled = false,
	loading = false,
	children,
	className,
	...props
}) => {
	const autoId = useId();
	const selectId = id ?? autoId;

	if (loading) {
		return (
			<div>
				<FieldLabel htmlFor={selectId} label={label} required={required} />
				<FieldLoading />
			</div>
		);
	}

	return (
		<div>
			<FieldLabel htmlFor={selectId} label={label} required={required} />
			<select
				id={selectId}
				required={required}
				disabled={disabled}
				aria-invalid={Boolean(error)}
				className={fieldClassName({ error, className })}
				{...props}
			>
				{children}
			</select>
			<FieldMessage error={error} helperText={helperText} />
		</div>
	);
};

export default FormSelect;
