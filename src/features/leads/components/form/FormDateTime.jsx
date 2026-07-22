import { useId } from "react";
import DateTimePickerField from "./DateTimePickerField";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
} from "./formFieldStyles";

const FormDateTime = ({
	id,
	label,
	required = false,
	error,
	helperText,
	disabled = false,
	loading = false,
	value,
	onChange,
	placeholder,
	className,
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
			<DateTimePickerField
				id={inputId}
				value={value ?? ""}
				onChange={(next) => {
					onChange?.({ target: { value: next } });
				}}
				disabled={disabled}
				error={Boolean(error)}
				placeholder={placeholder}
				className={className}
			/>
			<FieldMessage error={error} helperText={helperText} />
		</div>
	);
};

export default FormDateTime;
