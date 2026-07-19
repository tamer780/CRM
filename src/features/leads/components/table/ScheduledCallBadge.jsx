import { PhoneCall } from "lucide-react";
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

const TICK_MS = 30_000;

const ScheduledCallBadge = ({ scheduledCallAt }) => {
	const { t } = useTranslation();
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!scheduledCallAt) return undefined;
		const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
		return () => window.clearInterval(id);
	}, [scheduledCallAt]);

	const urgency = getScheduledCallUrgency(scheduledCallAt, now);
	if (!urgency) {
		return (
			<span className="inline-flex w-36 max-w-full truncate text-muted">—</span>
		);
	}

	const { tone, diffMs, scheduledAt } = urgency;
	const remaining = formatScheduledCallRemaining(diffMs, t);
	const clock = formatScheduledCallClock(scheduledAt);
	const tooltip = scheduledAt.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<span
			className={`inline-flex w-36 max-w-full min-w-0 flex-col gap-0.5 rounded-xl px-2.5 py-1.5 ${TONE_STYLES[tone]}`}
			title={tooltip}
		>
			<span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-tight">
				<PhoneCall className="size-3.5 shrink-0" aria-hidden="true" />
				<span className="truncate">{remaining}</span>
			</span>
			{clock && (
				<span
					className="truncate ps-5 text-[10px] font-medium opacity-80"
					dir="ltr"
				>
					{clock}
				</span>
			)}
		</span>
	);
};

export default ScheduledCallBadge;
