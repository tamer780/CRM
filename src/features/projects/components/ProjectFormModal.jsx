import LeadFormModal from "../../leads/components/form/LeadFormModal";
import ProjectForm from "./ProjectForm";

const ProjectFormModal = ({
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
	teams,
	teamsLoading,
}) => {
	return (
		<LeadFormModal
			open={open}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			preventClose={preventClose}
		>
			<ProjectForm
				mode={mode}
				values={values}
				onChange={onChange}
				onSubmit={onSubmit}
				onCancel={onClose}
				isSubmitting={isSubmitting}
				errors={errors}
				teams={teams}
				teamsLoading={teamsLoading}
			/>
		</LeadFormModal>
	);
};

export default ProjectFormModal;
