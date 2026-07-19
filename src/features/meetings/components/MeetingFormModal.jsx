import LeadFormModal from "../../leads/components/form/LeadFormModal";
import MeetingForm from "./MeetingForm";

const MeetingFormModal = ({
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
	leads,
	leadsLoading,
}) => {
	return (
		<LeadFormModal
			open={open}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			preventClose={preventClose}
		>
			<MeetingForm
				mode={mode}
				values={values}
				onChange={onChange}
				onSubmit={onSubmit}
				onCancel={onClose}
				isSubmitting={isSubmitting}
				errors={errors}
				users={users}
				usersLoading={usersLoading}
				leads={leads}
				leadsLoading={leadsLoading}
			/>
		</LeadFormModal>
	);
};

export default MeetingFormModal;
