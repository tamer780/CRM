export const SCHEDULED_CALL_WINDOW_MS = 30 * 60 * 1000;
export const SCHEDULED_CALL_REMINDER_BEFORE_MS = 5 * 60 * 1000;


export function getScheduledCallUrgency(iso, now = Date.now()) {
	if (iso == null || iso === "") return null;
	const scheduledAt = new Date(iso);
	if (Number.isNaN(scheduledAt.getTime())) return null;

	const diffMs = scheduledAt.getTime() - now;
	let tone = "yellow";
	if (diffMs > SCHEDULED_CALL_WINDOW_MS) tone = "green";
	else if (diffMs < -SCHEDULED_CALL_WINDOW_MS) tone = "red";

	return { tone, diffMs, scheduledAt };
}


export function formatScheduledCallRemaining(diffMs, t) {
	const abs = Math.abs(diffMs);
	const totalMinutes = Math.round(abs / 60_000);

	if (totalMinutes < 1) {
		return t("leads.scheduledCall.now");
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const upcoming = diffMs >= 0;

	if (hours === 0) {
		return upcoming
			? t("leads.scheduledCall.inMinutes", { count: minutes })
			: t("leads.scheduledCall.overdueMinutes", { count: minutes });
	}

	return upcoming
		? t("leads.scheduledCall.inHoursMinutes", { hours, minutes })
		: t("leads.scheduledCall.overdueHoursMinutes", { hours, minutes });
}

export function formatScheduledCallClock(date) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
	return date.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
}
