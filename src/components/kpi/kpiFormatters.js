export function formatRate(value) {
	const rate = Number(value) || 0;
	return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

export function getDefaultTeamKpiTab(memberCount) {
	return memberCount > 3 ? "members" : "leads";
}
