export const LEAD_SOURCES = [
	"facebook",
	"instagram",
	"tiktok",
	"google",
	"website",
	"whatsapp",
	"referral",
	"walk_in",
	"phone_call",
	"campaign",
	"manual",
	"import",
	"other",
];

export const LEAD_STATUSES = [
	"new",
	"assigned",
	"contacted",
	"no_answer",
	"follow_up",
	"meeting_scheduled",
	"meeting_completed",
	"interested",
	"qualified",
	"not_qualified",
	"low_budget",
	"not_interested",
	"already_bought_elsewhere",
	"postponed",
	"lost",
	"converted",
	"all_status",
	"default",
];

/** Statuses shown in row / bulk status pickers (excludes filter meta values). */
export const LEAD_STATUS_ACTIONABLE = LEAD_STATUSES.filter(
	(s) => s !== "all_status" && s !== "default",
);

/** Statuses shown in the filter multi-select (default is the clear/default row). */
export const LEAD_STATUS_FILTERABLE = LEAD_STATUSES.filter(
	(s) => s !== "default",
);

export const LEAD_STATUS_STYLES = {
	new: "bg-blue-50 text-blue-700",
	assigned: "bg-light-gold text-gold",
	contacted: "bg-sky-50 text-sky-700",
	no_answer: "bg-stone-100 text-stone-600",
	follow_up: "bg-amber-50 text-amber-700",
	meeting_scheduled: "bg-violet-50 text-violet-700",
	meeting_completed: "bg-purple-50 text-purple-700",
	interested: "bg-teal-50 text-teal-700",
	qualified: "bg-emerald-50 text-emerald-700",
	not_qualified: "bg-rose-50 text-rose-700",
	low_budget: "bg-orange-50 text-orange-700",
	not_interested: "bg-slate-100 text-slate-600",
	already_bought_elsewhere: "bg-fuchsia-50 text-fuchsia-700",
	postponed: "bg-indigo-50 text-indigo-700",
	lost: "bg-red-50 text-red-600",
	converted: "bg-green-100 text-green-900",
	all_status: "bg-background text-muted",
	default: "bg-background text-muted",
};

export const LEAD_STATUS_DOT_COLORS = {
	new: "bg-blue-500",
	assigned: "bg-gold",
	contacted: "bg-sky-500",
	no_answer: "bg-stone-400",
	follow_up: "bg-amber-500",
	meeting_scheduled: "bg-violet-500",
	meeting_completed: "bg-purple-500",
	interested: "bg-teal-500",
	qualified: "bg-emerald-500",
	not_qualified: "bg-rose-500",
	low_budget: "bg-orange-500",
	not_interested: "bg-slate-400",
	already_bought_elsewhere: "bg-fuchsia-500",
	postponed: "bg-indigo-500",
	lost: "bg-red-500",
	converted: "bg-green-700",
	all_status: "bg-muted",
	default: "bg-muted",
};

/** Soft row/card backgrounds + start border accent for lead list rows. */
export const LEAD_STATUS_ROW_STYLES = {
	new: "bg-blue-50/70 border-s-4 border-s-blue-500 hover:bg-blue-50",
	assigned: "bg-light-gold/50 border-s-4 border-s-gold hover:bg-light-gold/80",
	contacted: "bg-sky-50/70 border-s-4 border-s-sky-500 hover:bg-sky-50",
	no_answer: "bg-stone-100/70 border-s-4 border-s-stone-400 hover:bg-stone-100",
	follow_up: "bg-amber-50/70 border-s-4 border-s-amber-500 hover:bg-amber-50",
	meeting_scheduled:
		"bg-violet-50/70 border-s-4 border-s-violet-500 hover:bg-violet-50",
	meeting_completed:
		"bg-purple-50/70 border-s-4 border-s-purple-500 hover:bg-purple-50",
	interested: "bg-teal-50/70 border-s-4 border-s-teal-500 hover:bg-teal-50",
	qualified: "bg-emerald-50/70 border-s-4 border-s-emerald-500 hover:bg-emerald-50",
	not_qualified: "bg-rose-50/70 border-s-4 border-s-rose-500 hover:bg-rose-50",
	low_budget: "bg-orange-50/70 border-s-4 border-s-orange-500 hover:bg-orange-50",
	not_interested:
		"bg-slate-100/70 border-s-4 border-s-slate-400 hover:bg-slate-100",
	already_bought_elsewhere:
		"bg-fuchsia-50/70 border-s-4 border-s-fuchsia-500 hover:bg-fuchsia-50",
	postponed: "bg-indigo-50/70 border-s-4 border-s-indigo-500 hover:bg-indigo-50",
	lost: "bg-red-50/70 border-s-4 border-s-red-500 hover:bg-red-50",
	converted: "bg-green-100/70 border-s-4 border-s-green-700 hover:bg-green-100",
	all_status: "bg-background/40 border-s-4 border-s-border hover:bg-background/70",
	default: "bg-background/40 border-s-4 border-s-border hover:bg-background/70",
};

/** Lucide icon names keyed by lead source — resolved in UI components. */
export const LEAD_SOURCE_ICON_KEYS = {
	facebook: "facebook",
	instagram: "instagram",
	tiktok: "tiktok",
	google: "google",
	website: "globe",
	whatsapp: "message-circle",
	referral: "users",
	walk_in: "map-pin",
	phone_call: "phone",
	campaign: "megaphone",
	manual: "pen-line",
	import: "download",
	other: "circle-help",
};

/**
 * Same validation rules as the previous parent-page handlers.
 * Returns a map of field → error message (empty object when valid).
 */
export function validateLeadForm(values, t) {
	const errors = {};
	const name = values?.name?.trim();
	const phone = values?.phone?.trim();
	const email = values?.email?.trim();

	if (!name) {
		errors.name = t("validation.nameRequired");
	}
	if (!phone) {
		errors.phone = t("leads.validation.phoneRequired");
	}
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = t("validation.emailInvalid");
	}

	return errors;
}

export function normalizeLeadsList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.leads)) return payload.leads;
	return [];
}

export function toDatetimeLocalValue(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value) {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}

export function emptyLeadFormValues() {
	return {
		name: "",
		phone: "",
		email: "",
		project_id: "",
		campaign_id: "",
		source: "manual",
		source_details: "",
		assigned_to: "",
		scheduled_call_at: "",
		next_follow_up_at: "",
		note: "",
		last_communication_note: "",
	};
}

export function leadToFormValues(lead) {
	return {
		name: lead?.name ?? "",
		phone: lead?.phone ?? "",
		email: lead?.email ?? "",
		project_id: lead?.project_id ?? "",
		campaign_id: lead?.campaign_id ?? "",
		source: lead?.source ?? "manual",
		source_details: lead?.source_details ?? "",
		assigned_to: lead?.assigned_to ?? "",
		scheduled_call_at: toDatetimeLocalValue(lead?.scheduled_call_at),
		next_follow_up_at: toDatetimeLocalValue(lead?.next_follow_up_at),
		note: lead?.note ?? "",
		last_communication_note: lead?.last_communication_note ?? "",
	};
}

export function formValuesToPayload(values, { mode }) {
	const optionalString = (v) => {
		const trimmed = typeof v === "string" ? v.trim() : v;
		return trimmed === "" || trimmed == null ? null : trimmed;
	};

	const optionalInt = (v) => {
		if (v === "" || v == null) return null;
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	};

	const payload = {
		name: values.name.trim(),
		phone: values.phone.trim(),
		email: optionalString(values.email),
		project_id: optionalInt(values.project_id),
		campaign_id: optionalInt(values.campaign_id),
		source: values.source,
		source_details: optionalString(values.source_details),
		scheduled_call_at: fromDatetimeLocalValue(values.scheduled_call_at),
		next_follow_up_at: fromDatetimeLocalValue(values.next_follow_up_at),
		note: optionalString(values.note),
		last_communication_note: optionalString(values.last_communication_note),
	};

	if (mode === "create") {
		payload.assigned_to = optionalInt(values.assigned_to);
	}

	return payload;
}
