export const PROJECT_STATUSES = [
	"upcoming",
	"active",
	"paused",
	"completed",
	"archived",
];

export const PROJECT_STATUS_STYLES = {
	upcoming: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
	active: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
	paused: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
	completed: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
	archived: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export const PROJECT_STATUS_DOT_COLORS = {
	upcoming: "bg-blue-500",
	active: "bg-green-500",
	paused: "bg-orange-500",
	completed: "bg-violet-500",
	archived: "bg-slate-400",
};

function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

export function computeProjectKpis(list) {
	const items = list ?? [];
	const total = items.length;
	let active = 0;
	let upcoming = 0;
	let paused = 0;
	let completed = 0;
	let archived = 0;

	for (const item of items) {
		if (item.status === "active") active += 1;
		else if (item.status === "upcoming") upcoming += 1;
		else if (item.status === "paused") paused += 1;
		else if (item.status === "completed") completed += 1;
		else if (item.status === "archived") archived += 1;
	}

	return {
		total,
		active,
		upcoming,
		paused,
		completed,
		archived,
		totalShare: "100%",
		activeShare: shareOfTotal(active, total),
		upcomingShare: shareOfTotal(upcoming, total),
		pausedShare: shareOfTotal(paused, total),
		completedShare: shareOfTotal(completed, total),
		archivedShare: shareOfTotal(archived, total),
	};
}

export function emptyProjectFormValues() {
	return {
		name: "",
		description: "",
		started_at: "",
		status: "upcoming",
		team_ids: [],
	};
}

function toDateInputValue(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function dateInputToIso(value) {
	if (!value) return null;
	const date = new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}

export function projectToFormValues(project) {
	if (!project) return emptyProjectFormValues();
	const teamIds = Array.isArray(project.team_ids)
		? project.team_ids.map(String)
		: Array.isArray(project.teams)
			? project.teams.map((t) => String(t.id))
			: [];
	return {
		name: project.name ?? "",
		description: project.description ?? "",
		started_at: toDateInputValue(project.started_at),
		status: project.status ?? "upcoming",
		team_ids: teamIds,
	};
}

export function formValuesToPayload(values) {
	return {
		name: values.name.trim(),
		description: values.description?.trim() || null,
		started_at: dateInputToIso(values.started_at),
		status: values.status || "upcoming",
		team_ids: (values.team_ids ?? [])
			.map((id) => Number(id))
			.filter((id) => Number.isFinite(id)),
	};
}

export function validateProjectForm(values, t) {
	const errors = {};

	if (!values.name?.trim()) {
		errors.name = t("projects.validation.nameRequired");
	}
	if (!values.status) {
		errors.status = t("projects.validation.statusRequired");
	}

	return errors;
}
