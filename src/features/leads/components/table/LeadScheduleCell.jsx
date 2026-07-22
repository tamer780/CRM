import ScheduledCallBadge from "./ScheduledCallBadge";

const LeadScheduleCell = ({ lead }) => {
	const callAt = lead?.scheduled_call_at;
	const followUpAt = lead?.next_follow_up_at;
	const hasCall = Boolean(callAt);
	const hasFollowUp = Boolean(followUpAt);

	if (!hasCall && !hasFollowUp) {
		return (
			<span className="inline-flex w-36 max-w-full truncate text-muted">—</span>
		);
	}

	return (
		<div className="flex flex-col gap-1.5">
			{hasCall && <ScheduledCallBadge at={callAt} kind="call" />}
			{hasFollowUp && (
				<ScheduledCallBadge at={followUpAt} kind="follow_up" />
			)}
		</div>
	);
};

export default LeadScheduleCell;
