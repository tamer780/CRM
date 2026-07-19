import LeadFormModal from "../../leads/components/LeadFormModal";
import UserForm from "./UserForm";

const UserFormModal = ({
	open,
	mode = "create",
	title,
	subtitle,
	onClose,
	preventClose = false,
	values,
	onChange,
	onSubmit,
	isSubmitting,
	errors,
	teams = [],
	teamsLoading = false,
	roles,
}) => {
	return (
		<LeadFormModal
			open={open}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			preventClose={preventClose}
		>
			<UserForm
				mode={mode}
				values={values}
				onChange={onChange}
				onSubmit={onSubmit}
				onCancel={onClose}
				isSubmitting={isSubmitting}
				errors={errors}
				teams={teams}
				teamsLoading={teamsLoading}
				roles={roles}
			/>
		</LeadFormModal>
	);
};

export default UserFormModal;
