import {
	fromDatetimeLocalValue,
	toDatetimeLocalValue,
} from "../../../utils/leads/leadConstants";

export const SCHEDULED_ACTION_TYPES = [
	"call",
	"follow_up",
	"meeting",
	"site_visit",
	"whatsapp",
	"email",
	"other",
];

export const SCHEDULED_ACTION_STATUSES = ["pending", "completed", "missed"];

export const SCHEDULED_ACTION_STATUS_STYLES = {
	pending: "bg-amber-50 text-amber-700",
	completed: "bg-emerald-50 text-emerald-700",
	missed: "bg-red-50 text-red-700",
};

function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

function hasId(value) {
	return value != null && value !== "" && Number(value) !== 0;
}

export function computeScheduledActionKpis(list) {
	const items = list ?? [];
	const total = items.length;
	let pending = 0;
	let completed = 0;
	let missed = 0;

	for (const item of items) {
		if (item.status === "completed") completed += 1;
		else if (item.status === "missed") missed += 1;
		else pending += 1;
	}

	return {
		total,
		pending,
		completed,
		missed,
		totalShare: "100%",
		pendingShare: shareOfTotal(pending, total),
		completedShare: shareOfTotal(completed, total),
		missedShare: shareOfTotal(missed, total),
	};
}

export function emptyScheduledActionFormValues() {
	return {
		related_type: "lead",
		lead_id: "",
		client_id: "",
		assigned_to: "",
		type: "call",
		scheduled_at: "",
		note: "",
	};
}

export function scheduledActionToFormValues(action) {
	if (!action) return emptyScheduledActionFormValues();
	const hasClient = hasId(action.client_id);
	return {
		related_type: hasClient ? "client" : "lead",
		lead_id: hasId(action.lead_id) ? String(action.lead_id) : "",
		client_id: hasClient ? String(action.client_id) : "",
		assigned_to: hasId(action.assigned_to) ? String(action.assigned_to) : "",
		type: action.type ?? "call",
		scheduled_at: toDatetimeLocalValue(action.scheduled_at),
		note: action.note ?? "",
	};
}

export function formValuesToPayload(values) {
	const relatedType = values.related_type === "client" ? "client" : "lead";
	const note =
		typeof values.note === "string" && values.note.trim()
			? values.note.trim()
			: null;

	return {
		lead_id:
			relatedType === "lead" && hasId(values.lead_id)
				? Number(values.lead_id)
				: null,
		client_id:
			relatedType === "client" && hasId(values.client_id)
				? Number(values.client_id)
				: null,
		assigned_to: hasId(values.assigned_to) ? Number(values.assigned_to) : null,
		type: values.type,
		scheduled_at: fromDatetimeLocalValue(values.scheduled_at),
		note,
	};
}

export function validateScheduledActionForm(values, t) {
	const errors = {};

	if (!values.type) {
		errors.type = t("scheduledActions.validation.typeRequired");
	}

	if (!hasId(values.assigned_to)) {
		errors.assigned_to = t("scheduledActions.validation.assignedRequired");
	}

	if (!values.scheduled_at) {
		errors.scheduled_at = t("scheduledActions.validation.scheduledAtRequired");
	}

	if (values.related_type === "client") {
		if (!hasId(values.client_id)) {
			errors.client_id = t("scheduledActions.validation.clientRequired");
		}
	} else if (!hasId(values.lead_id)) {
		errors.lead_id = t("scheduledActions.validation.leadRequired");
	}

	return errors;
}

export function validateCompleteForm(values, t) {
	const errors = {};
	if (!values.outcome?.trim()) {
		errors.outcome = t("scheduledActions.validation.outcomeRequired");
	}
	return errors;
}

export { toDatetimeLocalValue, fromDatetimeLocalValue };
