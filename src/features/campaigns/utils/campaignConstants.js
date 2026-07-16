export const CAMPAIGN_PLATFORMS = [
	"facebook",
	"instagram",
	"tiktok",
	"google",
	"website",
	"offline",
	"referral",
	"other",
];

export const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"];

export const PLATFORM_BADGE_STYLES = {
	facebook: "bg-blue-50 text-blue-700",
	instagram: "bg-pink-50 text-pink-700",
	tiktok: "bg-slate-900 text-white",
	google: "bg-red-50 text-red-700",
	website: "bg-teal-50 text-teal-700",
	offline: "bg-amber-50 text-amber-800",
	referral: "bg-violet-50 text-violet-700",
	other: "bg-background text-muted",
};

export const CAMPAIGN_STATUS_STYLES = {
	draft: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
	active: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
	paused: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
	completed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

export const CAMPAIGN_STATUS_DOT_COLORS = {
	draft: "bg-slate-400",
	active: "bg-green-500",
	paused: "bg-orange-500",
	completed: "bg-blue-500",
};

export function toNumber(value) {
	if (value == null || value === "") return 0;
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

export function computeRoi(revenue, spent) {
	return toNumber(revenue) - toNumber(spent);
}

export function computeCampaignKpis(list) {
	const items = list ?? [];
	let active = 0;
	let draft = 0;
	let completed = 0;
	let totalBudget = 0;

	for (const item of items) {
		if (item.status === "active") active += 1;
		if (item.status === "draft") draft += 1;
		if (item.status === "completed") completed += 1;
		totalBudget += toNumber(item.budget);
	}

	return {
		total: items.length,
		active,
		draft,
		completed,
		totalBudget,
	};
}

export function emptyCampaignFormValues() {
	return {
		name: "",
		platform: "",
		project_id: "",
		source: "",
		budget: "",
		spent_amount: "",
		revenue: "",
		started_at: "",
		ended_at: "",
		status: "draft",
		external_reference: "",
	};
}

function toDateInputValue(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function dateInputToIso(value) {
	if (!value) return null;
	const date = new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}

export function campaignToFormValues(campaign) {
	if (!campaign) return emptyCampaignFormValues();
	return {
		name: campaign.name ?? "",
		platform: campaign.platform ?? "",
		project_id:
			campaign.project_id == null || campaign.project_id === ""
				? ""
				: String(campaign.project_id),
		source: campaign.source ?? "",
		budget: campaign.budget ?? "",
		spent_amount: campaign.spent_amount ?? "",
		revenue: campaign.revenue ?? "",
		started_at: toDateInputValue(campaign.started_at),
		ended_at: toDateInputValue(campaign.ended_at),
		status: campaign.status ?? "draft",
		external_reference: campaign.external_reference ?? "",
	};
}

export function formValuesToPayload(values) {
	return {
		name: values.name.trim(),
		platform: values.platform,
		project_id: values.project_id ? Number(values.project_id) : null,
		source: values.source || null,
		budget: toNumber(values.budget),
		spent_amount: toNumber(values.spent_amount),
		revenue: toNumber(values.revenue),
		started_at: dateInputToIso(values.started_at),
		ended_at: dateInputToIso(values.ended_at),
		status: values.status || "draft",
		external_reference: values.external_reference?.trim() || null,
	};
}

export function validateCampaignForm(values, t) {
	const errors = {};

	if (!values.name?.trim()) {
		errors.name = t("campaigns.validation.nameRequired");
	}
	if (!values.platform) {
		errors.platform = t("campaigns.validation.platformRequired");
	}

	const moneyFields = ["budget", "spent_amount", "revenue"];
	for (const key of moneyFields) {
		const raw = values[key];
		if (raw === "" || raw == null) continue;
		const n = Number(raw);
		if (!Number.isFinite(n) || n < 0) {
			errors[key] = t("campaigns.validation.moneyNonNegative");
		}
	}

	if (values.started_at && values.ended_at) {
		const start = new Date(`${values.started_at}T00:00:00`).getTime();
		const end = new Date(`${values.ended_at}T00:00:00`).getTime();
		if (!Number.isNaN(start) && !Number.isNaN(end) && start > end) {
			errors.ended_at = t("campaigns.validation.dateRange");
		}
	}

	return errors;
}
