import LeadFormModal from "../../leads/components/form/LeadFormModal";
import ClientForm from "./ClientForm";

const ClientFormModal = ({
	open,
	title,
	subtitle,
	onClose,
	preventClose = false,
	values,
	onChange,
	onSubmit,
	isSubmitting,
	errors,
	projects,
	campaigns,
	users,
	projectsLoading,
	campaignsLoading,
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
			<ClientForm
				values={values}
				onChange={onChange}
				onSubmit={onSubmit}
				onCancel={onClose}
				isSubmitting={isSubmitting}
				errors={errors}
				projects={projects}
				campaigns={campaigns}
				users={users}
				projectsLoading={projectsLoading}
				campaignsLoading={campaignsLoading}
				usersLoading={usersLoading}
			/>
		</LeadFormModal>
	);
};

export default ClientFormModal;
