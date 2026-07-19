function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

function hasId(value) {
	return value != null && value !== "" && Number(value) !== 0;
}

export function personDisplayName(person) {
	if (!person) return null;
	if (person.name) return person.name;
	if (person.email) return person.email;
	if (person.id != null) return `#${person.id}`;
	return null;
}

export function resolveTeamPerson(team, nestedKey, idKey, usersMap) {
	const nested = team?.[nestedKey];
	if (nested && (nested.name || nested.email || nested.id != null)) {
		return nested;
	}

	const userId = team?.[idKey];
	if (!hasId(userId)) return null;

	const fromMap =
		usersMap?.get(Number(userId)) ?? usersMap?.get(String(userId));
	if (fromMap) return fromMap;

	return { id: userId };
}

export function getTeamMembers(team) {
	return Array.isArray(team?.members) ? team.members : [];
}

export function getTeamProjects(team) {
	return Array.isArray(team?.projects) ? team.projects : [];
}

export function computeTeamKpis(list) {
	const items = list ?? [];
	const total = items.length;
	let withLeader = 0;
	let withSupervisor = 0;
	let incomplete = 0;

	for (const item of items) {
		const leader = hasId(item.team_leader_id);
		const supervisor = hasId(item.supervisor_id);
		if (leader) withLeader += 1;
		if (supervisor) withSupervisor += 1;
		if (!leader || !supervisor) incomplete += 1;
	}

	return {
		total,
		withLeader,
		withSupervisor,
		incomplete,
		totalShare: "100%",
		withLeaderShare: shareOfTotal(withLeader, total),
		withSupervisorShare: shareOfTotal(withSupervisor, total),
		incompleteShare: shareOfTotal(incomplete, total),
	};
}

export function emptyTeamFormValues() {
	return {
		name: "",
		team_leader_id: "",
		supervisor_id: "",
	};
}

export function teamToFormValues(team) {
	if (!team) return emptyTeamFormValues();
	return {
		name: team.name ?? "",
		team_leader_id: hasId(team.team_leader_id)
			? String(team.team_leader_id)
			: "",
		supervisor_id: hasId(team.supervisor_id)
			? String(team.supervisor_id)
			: "",
	};
}

export function formValuesToPayload(values) {
	return {
		name: values.name.trim(),
		team_leader_id: values.team_leader_id
			? Number(values.team_leader_id)
			: null,
		supervisor_id: values.supervisor_id
			? Number(values.supervisor_id)
			: null,
	};
}

export function validateTeamForm(values, t) {
	const errors = {};
	if (!values.name?.trim()) {
		errors.name = t("teams.validation.nameRequired");
	}
	return errors;
}
