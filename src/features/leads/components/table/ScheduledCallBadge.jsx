import { PhoneCall, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	formatScheduledCallClock,
	formatScheduledCallRemaining,
	getScheduledCallUrgency,
} from "../../../../utils/leads/scheduledCallUrgency";

const TONE_STYLES = {
	green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
	yellow: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
	red: "bg-red-50 text-red-700 ring-1 ring-red-200 animate-pulse",
};

const KIND_ICONS = {
	call: PhoneCall,
	follow_up: RefreshCw,
};

const TICK_MS = 30_000;

/**
 * @param {{ at: string | null | undefined, kind?: "call" | "follow_up" }} props
 */
const ScheduledCallBadge = ({ at, kind = "call" }) => {
	const { t } = useTranslation();
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!at) return undefined;
		const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
		return () => window.clearInterval(id);
	}, [at]);

	const urgency = getScheduledCallUrgency(at, now);
	if (!urgency) return null;

	const { tone, diffMs, scheduledAt } = urgency;
	const remaining = formatScheduledCallRemaining(diffMs, t);
	const clock = formatScheduledCallClock(scheduledAt);
	const Icon = KIND_ICONS[kind] ?? PhoneCall;
	const kindLabel = t(
		kind === "follow_up"
			? "leads.schedule.followUp"
			: "leads.schedule.call",
	);
	const whenLabel = scheduledAt.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	const tooltip = `${kindLabel}: ${whenLabel}`;

	return (
		<span
			className={`inline-flex w-36 max-w-full min-w-0 flex-col gap-0.5 rounded-xl px-2.5 py-1.5 ${TONE_STYLES[tone]}`}
			title={tooltip}
		>
			<span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-tight">
				<Icon className="size-3.5 shrink-0" aria-hidden="true" />
				<span className="truncate">{remaining}</span>
			</span>
			<span className="truncate ps-5 text-[10px] font-medium opacity-80">
				<span className="me-1">{kindLabel}</span>
				{clock && (
					<span dir="ltr" className="tabular-nums">
						{clock}
					</span>
				)}
			</span>
		</span>
	);
};

export default ScheduledCallBadge;
