export const DUPLICATE_STATUSES = ["pending", "merged", "removed", "replaced"];

export const DUPLICATE_STATUS_STYLES = {
	pending: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
	merged: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
	removed: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200",
	replaced: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

export const DUPLICATE_STATUS_DOT_COLORS = {
	pending: "bg-orange-500",
	merged: "bg-green-500",
	removed: "bg-red-500",
	replaced: "bg-blue-500",
};

export const SOURCE_BADGE_STYLES = {
	facebook: "bg-blue-50 text-blue-700",
	instagram: "bg-pink-50 text-pink-700",
	tiktok: "bg-slate-900 text-white",
	google: "bg-red-50 text-red-700",
	website: "bg-teal-50 text-teal-700",
	whatsapp: "bg-green-50 text-green-700",
	referral: "bg-violet-50 text-violet-700",
	walk_in: "bg-amber-50 text-amber-700",
	phone_call: "bg-sky-50 text-sky-700",
	campaign: "bg-indigo-50 text-indigo-700",
	manual: "bg-slate-100 text-slate-700",
	import: "bg-stone-100 text-stone-700",
	other: "bg-background text-muted",
};

export function normalizePendingLeadsList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.pending_leads)) return payload.pending_leads;
	return [];
}

export function getDuplicateType(lead) {
	if (lead?.existing_lead_id != null) return "existing_lead";
	if (lead?.existing_client_id != null) return "existing_client";
	return null;
}
