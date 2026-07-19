import LeadFollowUpSection from "./LeadFollowUpSection";
import LeadFormFooter from "./LeadFormFooter";
import LeadInformationSection from "./LeadInformationSection";
import LeadNotesSection from "./LeadNotesSection";
import LeadPersonalSection from "./LeadPersonalSection";

const LeadForm = ({
	mode = "create",
	values,
	onChange,
	onSubmit,
	onCancel,
	onDelete,
	canDelete = false,
	isSubmitting = false,
	errors = {},
	projects = [],
	campaigns = [],
	users = [],
	projectsLoading = false,
	campaignsLoading = false,
	usersLoading = false,
}) => {
	const setField = (key, value) => {
		onChange({ ...values, [key]: value });
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		onSubmit(values);
	};

	return (
		<form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
			<div className="flex-1 space-y-8 overflow-y-auto px-5 py-5 sm:px-6">
				{errors.api && (
					<p
						role="alert"
						className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
					>
						{errors.api}
					</p>
				)}

				<LeadPersonalSection
					values={values}
					onFieldChange={setField}
					errors={errors}
					disabled={isSubmitting}
				/>

				<LeadInformationSection
					mode={mode}
					values={values}
					onFieldChange={setField}
					errors={errors}
					disabled={isSubmitting}
					projects={projects}
					campaigns={campaigns}
					users={users}
					projectsLoading={projectsLoading}
					campaignsLoading={campaignsLoading}
					usersLoading={usersLoading}
				/>

				<LeadFollowUpSection
					values={values}
					onFieldChange={setField}
					errors={errors}
					disabled={isSubmitting}
				/>

				<LeadNotesSection
					values={values}
					onFieldChange={setField}
					errors={errors}
					disabled={isSubmitting}
				/>
			</div>

			<div className="shrink-0">
				<LeadFormFooter
					mode={mode}
					isSubmitting={isSubmitting}
					onCancel={onCancel}
					onDelete={onDelete}
					canDelete={canDelete}
				/>
			</div>
		</form>
	);
};

export default LeadForm;
