import LeadFormModal from "../../leads/components/form/LeadFormModal";
import TeamForm from "./TeamForm";

const TeamFormModal = ({
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
	users,
	usersLoading,
}) => {
	return (
		<LeadFormModal
			open={open}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			preventClose={preventClose}
		>
			<TeamForm
				mode={mode}
				values={values}
				onChange={onChange}
				onSubmit={onSubmit}
				onCancel={onClose}
				isSubmitting={isSubmitting}
				errors={errors}
				users={users}
				usersLoading={usersLoading}
			/>
		</LeadFormModal>
	);
};

export default TeamFormModal;
