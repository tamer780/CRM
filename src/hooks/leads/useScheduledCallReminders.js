import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	formatScheduledCallRemaining,
	getScheduledCallUrgency,
	SCHEDULED_CALL_REMINDER_BEFORE_MS,
} from "../../utils/leads/scheduledCallUrgency";
import { useLeads } from "./useLeads";

const TICK_MS = 30_000;

function isWithinReminderWindow(diffMs) {
	return diffMs > 0 && diffMs <= SCHEDULED_CALL_REMINDER_BEFORE_MS;
}

/**
 * Global toast when a lead's scheduled call is within 5 minutes ahead.
 * Runs on any authenticated CRM page; click opens that lead on /leads.
 */
export function useScheduledCallReminders() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const notifiedRef = useRef(new Set());
	const { data: leads } = useLeads({ status: undefined });

	useEffect(() => {
		const scan = () => {
			const now = Date.now();
			const list = leads ?? [];
			const stillDue = new Set();

			for (const lead of list) {
				if (lead?.id == null || !lead.scheduled_call_at) continue;

				const urgency = getScheduledCallUrgency(lead.scheduled_call_at, now);
				if (!urgency || !isWithinReminderWindow(urgency.diffMs)) continue;

				const key = String(lead.id);
				stillDue.add(key);

				if (notifiedRef.current.has(key)) continue;
				notifiedRef.current.add(key);

				const when = formatScheduledCallRemaining(urgency.diffMs, t);
				const name = lead.name?.trim() || `#${lead.id}`;

				toast.info(
					t("leads.scheduledCall.reminder", { name, when }),
					{
						id: `scheduled-call-${key}`,
						action: {
							label: t("leads.scheduledCall.open"),
							onClick: () =>
								navigate(`/leads?selected=${encodeURIComponent(key)}`),
						},
					},
				);
			}

			for (const key of notifiedRef.current) {
				if (!stillDue.has(key)) {
					notifiedRef.current.delete(key);
				}
			}
		};

		scan();
		const id = window.setInterval(scan, TICK_MS);
		return () => window.clearInterval(id);
	}, [leads, navigate, t]);
}
