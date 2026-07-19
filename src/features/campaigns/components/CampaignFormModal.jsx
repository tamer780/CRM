import LeadFormModal from "../../leads/components/form/LeadFormModal";
import CampaignForm from "./CampaignForm";

const CampaignFormModal = ({
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
	projects,
	projectsLoading,
}) => {
	return (
		<LeadFormModal
			open={open}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			preventClose={preventClose}
		>
			<CampaignForm
				mode={mode}
				values={values}
				onChange={onChange}
				onSubmit={onSubmit}
				onCancel={onClose}
				isSubmitting={isSubmitting}
				errors={errors}
				projects={projects}
				projectsLoading={projectsLoading}
			/>
		</LeadFormModal>
	);
};

export default CampaignFormModal;
