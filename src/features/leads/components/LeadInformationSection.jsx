import {
	CircleHelp,
	Download,
	FolderKanban,
	Globe,
	MapPin,
	Megaphone,
	MessageCircle,
	PenLine,
	Phone,
	Share2,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LEAD_SOURCES } from "../../../utils/leads/leadConstants";
import { getAvatarTone, getInitials } from "../utils/leadAvatars";
import FormInput from "./FormInput";
import LeadFormSection from "./LeadFormSection";
import SearchableSelect from "./SearchableSelect";

const SOURCE_ICONS = {
	facebook: Share2,
	instagram: Share2,
	tiktok: Share2,
	google: Globe,
	website: Globe,
	whatsapp: MessageCircle,
	referral: Users,
	walk_in: MapPin,
	phone_call: Phone,
	campaign: Megaphone,
	manual: PenLine,
	import: Download,
	other: CircleHelp,
};

function optionLabel(item) {
	return item?.name ?? item?.title ?? `#${item?.id}`;
}

const LeadInformationSection = ({
	mode,
	values,
	onFieldChange,
	errors = {},
	disabled,
	projects = [],
	campaigns = [],
	users = [],
	projectsLoading,
	campaignsLoading,
	usersLoading,
}) => {
	const { t } = useTranslation();

	const sourceOptions = useMemo(
		() =>
			LEAD_SOURCES.map((source) => ({
				value: source,
				label: t(`leads.sources.${source}`),
				Icon: SOURCE_ICONS[source] ?? CircleHelp,
			})),
		[t],
	);

	const projectOptions = useMemo(
		() =>
			projects.map((project) => {
				const name = optionLabel(project);
				const location =
					project.location ?? project.city ?? project.area ?? null;
				return {
					value: project.id,
					label: name,
					searchText: [name, location].filter(Boolean).join(" "),
					location,
				};
			}),
		[projects],
	);

	const campaignOptions = useMemo(
		() =>
			campaigns.map((campaign) => ({
				value: campaign.id,
				label: optionLabel(campaign),
			})),
		[campaigns],
	);

	const userOptions = useMemo(
		() =>
			users.map((user) => {
				const name = user.name ?? user.email ?? `#${user.id}`;
				const role = user.role ?? user.job_title ?? "";
				return {
					value: user.id,
					label: name,
					searchText: [name, role, user.email].filter(Boolean).join(" "),
					role,
					name,
				};
			}),
		[users],
	);

	return (
		<LeadFormSection
			icon={FolderKanban}
			title={t("leads.detail.source")}
			description={t("leads.subtitle")}
		>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<SearchableSelect
					id="lead-source"
					label={t("leads.form.source")}
					required
					value={values.source}
					onChange={(v) => onFieldChange("source", v)}
					options={sourceOptions}
					clearable={false}
					error={errors.source}
					disabled={disabled}
					placeholder={t("leads.form.source")}
					searchPlaceholder={t("leads.searchPlaceholder")}
					renderOption={(option) => {
						const Icon = option.Icon;
						return (
							<span className="flex items-center gap-2">
								{Icon && (
									<Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />
								)}
								{option.label}
							</span>
						);
					}}
					renderValue={(option) => {
						const Icon = option.Icon;
						return (
							<span className="flex items-center gap-2">
								{Icon && (
									<Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />
								)}
								{option.label}
							</span>
						);
					}}
				/>

				<FormInput
					id="lead-source-details"
					label={t("leads.form.sourceDetails")}
					maxLength={255}
					value={values.source_details}
					onChange={(e) => onFieldChange("source_details", e.target.value)}
					error={errors.source_details}
					disabled={disabled}
				/>

				<SearchableSelect
					id="lead-project"
					label={t("leads.form.project")}
					value={values.project_id}
					onChange={(v) => onFieldChange("project_id", v)}
					options={projectOptions}
					clearLabel={t("leads.form.none")}
					loading={projectsLoading}
					error={errors.project_id}
					disabled={disabled}
					placeholder={t("leads.form.project")}
					searchPlaceholder={t("leads.searchPlaceholder")}
					renderOption={(option) => (
						<span className="flex min-w-0 flex-col">
							<span className="truncate font-medium">{option.label}</span>
							{option.location && (
								<span className="truncate text-xs text-muted">{option.location}</span>
							)}
						</span>
					)}
				/>

				<SearchableSelect
					id="lead-campaign"
					label={t("leads.form.campaign")}
					value={values.campaign_id}
					onChange={(v) => onFieldChange("campaign_id", v)}
					options={campaignOptions}
					clearLabel={t("leads.form.none")}
					loading={campaignsLoading}
					error={errors.campaign_id}
					disabled={disabled}
					placeholder={t("leads.form.campaign")}
					searchPlaceholder={t("leads.searchPlaceholder")}
				/>

				{mode === "create" && (
					<div className="md:col-span-2">
						<SearchableSelect
							id="lead-assigned-to"
							label={t("leads.columns.assignedTo")}
							value={values.assigned_to}
							onChange={(v) => onFieldChange("assigned_to", v)}
							options={userOptions}
							clearLabel={t("leads.form.none")}
							loading={usersLoading}
							error={errors.assigned_to}
							disabled={disabled}
							placeholder={t("leads.searchPlaceholder")}
							searchPlaceholder={t("leads.searchPlaceholder")}
							renderOption={(option) => (
								<span className="flex items-center gap-2.5">
									<span
										className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(option.name)}`}
									>
										{getInitials(option.name)}
									</span>
									<span className="min-w-0 flex flex-col">
										<span className="truncate font-medium">{option.name}</span>
										{option.role && (
											<span className="truncate text-xs text-muted">{option.role}</span>
										)}
									</span>
								</span>
							)}
							renderValue={(option) => (
								<span className="flex items-center gap-2">
									<span
										className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(option.name)}`}
									>
										{getInitials(option.name)}
									</span>
									<span className="truncate">{option.name}</span>
								</span>
							)}
						/>
					</div>
				)}
			</div>
		</LeadFormSection>
	);
};

export default LeadInformationSection;
