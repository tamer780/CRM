import {
	fromDatetimeLocalValue,
	toDatetimeLocalValue,
} from "../../../utils/leads/leadConstants";

export const MEETING_STATUSES = [
	"scheduled",
	"visit",
	"reserved",
	"bought",
	"canceled",
	"didnt_come",
];

export const MEETING_STATUS_STYLES = {
	scheduled: "bg-amber-50 text-amber-700",
	visit: "bg-sky-50 text-sky-700",
	reserved: "bg-violet-50 text-violet-700",
	bought: "bg-emerald-50 text-emerald-700",
	canceled: "bg-slate-100 text-slate-600",
	didnt_come: "bg-red-50 text-red-700",
};

export const MEETING_STATUS_DOT_COLORS = {
	scheduled: "bg-amber-500",
	visit: "bg-sky-500",
	reserved: "bg-violet-500",
	bought: "bg-emerald-500",
	canceled: "bg-slate-400",
	didnt_come: "bg-red-500",
};

function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

function hasId(value) {
	return value != null && value !== "" && Number(value) !== 0;
}

export function computeMeetingKpis(list) {
	const items = list ?? [];
	const total = items.length;
	let scheduled = 0;
	let visit = 0;
	let bought = 0;
	let canceled = 0;

	for (const item of items) {
		if (item.status === "scheduled") scheduled += 1;
		else if (item.status === "visit") visit += 1;
		else if (item.status === "bought") bought += 1;
		else if (item.status === "canceled" || item.status === "didnt_come") {
			canceled += 1;
		}
	}

	return {
		total,
		scheduled,
		visit,
		bought,
		canceled,
		totalShare: "100%",
		scheduledShare: shareOfTotal(scheduled, total),
		visitShare: shareOfTotal(visit, total),
		boughtShare: shareOfTotal(bought, total),
		canceledShare: shareOfTotal(canceled, total),
	};
}

export function emptyMeetingFormValues() {
	return {
		lead_id: "",
		assigned_to: "",
		status: "scheduled",
		meeting_date: "",
		notes: "",
	};
}

export function meetingToFormValues(meeting) {
	if (!meeting) return emptyMeetingFormValues();
	return {
		lead_id: hasId(meeting.lead_id) ? String(meeting.lead_id) : "",
		assigned_to: hasId(meeting.assigned_to)
			? String(meeting.assigned_to)
			: "",
		status: meeting.status ?? "scheduled",
		meeting_date: toDatetimeLocalValue(meeting.meeting_date),
		notes: meeting.notes ?? "",
	};
}

export function formValuesToCreatePayload(values) {
	const notes =
		typeof values.notes === "string" && values.notes.trim()
			? values.notes.trim()
			: null;

	return {
		lead_id: hasId(values.lead_id) ? Number(values.lead_id) : null,
		assigned_to: hasId(values.assigned_to)
			? Number(values.assigned_to)
			: null,
		status: values.status || "scheduled",
		meeting_date: fromDatetimeLocalValue(values.meeting_date),
		notes,
	};
}

export function formValuesToUpdatePayload(values) {
	const notes =
		typeof values.notes === "string" && values.notes.trim()
			? values.notes.trim()
			: null;

	return {
		assigned_to: hasId(values.assigned_to)
			? Number(values.assigned_to)
			: null,
		status: values.status || "scheduled",
		meeting_date: fromDatetimeLocalValue(values.meeting_date),
		notes,
	};
}

export function validateMeetingForm(values, t, { mode = "create" } = {}) {
	const errors = {};

	if (mode === "create" && !hasId(values.lead_id)) {
		errors.lead_id = t("meetings.validation.leadRequired");
	}

	if (!hasId(values.assigned_to)) {
		errors.assigned_to = t("meetings.validation.assignedRequired");
	}

	if (!values.status) {
		errors.status = t("meetings.validation.statusRequired");
	}

	if (!values.meeting_date) {
		errors.meeting_date = t("meetings.validation.meetingDateRequired");
	}

	return errors;
}

export { toDatetimeLocalValue, fromDatetimeLocalValue };
