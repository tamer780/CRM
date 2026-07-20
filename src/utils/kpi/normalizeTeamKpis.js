function normalizeLeadMetrics(source = {}) {
	return {
		total_assigned: source.total_assigned ?? 0,
		contacted: source.contacted ?? 0,
		qualified: source.qualified ?? 0,
		converted: source.converted ?? 0,
		contact_rate: source.contact_rate ?? 0,
		qualification_rate: source.qualification_rate ?? 0,
		conversion_rate: source.conversion_rate ?? 0,
	};
}

function normalizeMeetingMetrics(source = {}) {
	return {
		total: source.total ?? 0,
		scheduled: source.scheduled ?? 0,
		visit: source.visit ?? 0,
		reserved: source.reserved ?? 0,
		bought: source.bought ?? 0,
		canceled: source.canceled ?? 0,
		didnt_come: source.didnt_come ?? 0,
		completed: source.completed ?? 0,
		show_rate: source.show_rate ?? 0,
		no_show_rate: source.no_show_rate ?? 0,
		visit_rate: source.visit_rate ?? 0,
		reservation_rate: source.reservation_rate ?? 0,
		purchase_rate: source.purchase_rate ?? 0,
	};
}

export function normalizeMemberKpi(member = {}) {
	const leads = normalizeLeadMetrics(member.leads ?? member);
	const meetings = normalizeMeetingMetrics(member.meetings ?? {});

	return {
		...member,
		user_id: member.user_id,
		name: member.name ?? "",
		leads: { ...(member.leads ?? {}), ...leads },
		meetings: { ...(member.meetings ?? {}), ...meetings },
		...leads,
	};
}

export function normalizeTeamKpi(team = {}) {
	const teamId = team.team_id ?? team.id;
	const teamName = team.team_name ?? team.name ?? "";
	const leads = normalizeLeadMetrics(team.leads ?? team);
	const meetings = normalizeMeetingMetrics(team.meetings ?? {});
	const members = (team.members ?? []).map(normalizeMemberKpi);

	return {
		...team,
		team_id: teamId,
		id: teamId,
		team_name: teamName,
		name: teamName,
		leads: { ...(team.leads ?? {}), ...leads },
		meetings: { ...(team.meetings ?? {}), ...meetings },
		members,
		...leads,
	};
}

export function normalizeTeamKpis(teams) {
	if (!Array.isArray(teams)) return [];
	return teams.map(normalizeTeamKpi);
}
