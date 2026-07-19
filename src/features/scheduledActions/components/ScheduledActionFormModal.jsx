import LeadFormModal from "../../leads/components/form/LeadFormModal";
import ScheduledActionForm from "./ScheduledActionForm";

const ScheduledActionFormModal = ({
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
	clients,
	clientsLoading,
}) => {
	return (
		<LeadFormModal
			open={open}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			preventClose={preventClose}
		>
			<ScheduledActionForm
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
				clients={clients}
				clientsLoading={clientsLoading}
			/>
		</LeadFormModal>
	);
};

export default ScheduledActionFormModal;
