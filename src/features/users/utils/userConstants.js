export const USER_ROLES = [
	"superadmin",
	"admin",
	"leader",
	"supervisor",
	"sales",
];

/**
 * Values accepted by the API `role` field (Title Case / Spatie names).
 * UI + permissions keep lowercase slugs in USER_ROLES.
 */
export const ROLE_API_VALUES = {
	superadmin: "Super Admin",
	admin: "Admin",
	leader: "Leader",
	supervisor: "Supervisor",
	sales: "Sales",
};

/** Map API / display variants → canonical role slug used by permissions. */
const ROLE_ALIASES = {
	superadmin: "superadmin",
	super_admin: "superadmin",
	"super-admin": "superadmin",
	"super admin": "superadmin",
	admin: "admin",
	leader: "leader",
	team_leader: "leader",
	"team-leader": "leader",
	"team leader": "leader",
	supervisor: "supervisor",
	sales_supervisor: "supervisor",
	"sales-supervisor": "supervisor",
	"sales supervisor": "supervisor",
	sales: "sales",
};

export function normalizeRoleValue(raw) {
	if (raw == null || raw === "") return "";

	let value = raw;
	if (typeof value === "object") {
		value =
			value.name ??
			value.slug ??
			value.role ??
			value.key ??
			value.label ??
			value.value ??
			"";
	}

	const trimmed = String(value).trim();
	if (!trimmed) return "";

	const lower = trimmed.toLowerCase();
	const spaced = lower.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
	const underscored = spaced.replace(/\s+/g, "_");
	const compact = spaced.replace(/\s+/g, "");

	return (
		ROLE_ALIASES[lower] ??
		ROLE_ALIASES[spaced] ??
		ROLE_ALIASES[underscored] ??
		ROLE_ALIASES[compact] ??
		lower
	);
}

/** Convert internal slug → API `role` string. */
export function roleToApiValue(role) {
	const canonical = normalizeRoleValue(role);
	return ROLE_API_VALUES[canonical] ?? String(role ?? "").trim();
}

const ROLE_PRIORITY = [
	"superadmin",
	"admin",
	"leader",
	"supervisor",
	"sales",
];

function pickHighestRole(roles) {
	const normalized = roles.map(normalizeRoleValue).filter(Boolean);
	for (const role of ROLE_PRIORITY) {
		if (normalized.includes(role)) return role;
	}
	return normalized[0] ?? "";
}

function shareOfTotal(count, total) {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

export function getUserRole(user) {
  if (!user) return "";
  if (user.role != null && user.role !== "") {
    return normalizeRoleValue(user.role);
  }
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return pickHighestRole(user.roles);
  }
  return "";
}

export function isUserActive(user) {
  if (!user) return false;
  if (typeof user.is_active === "boolean") return user.is_active;
  if (user.status === "active") return true;
  if (user.status === "inactive") return false;
  return true;
}

function hasId(value) {
  return value != null && value !== "" && Number(value) !== 0;
}

export function getUserTeamId(user) {
  if (!user) return null;
  if (hasId(user.team_id)) return Number(user.team_id);
  if (hasId(user.team?.id)) return Number(user.team.id);
  return null;
}

export function getUserTeamName(user, teams = []) {
  if (!user) return "";
  if (user.team_name) return String(user.team_name);
  if (user.team?.name) return String(user.team.name);
  const teamId = getUserTeamId(user);
  if (teamId == null) return "";
  const match = (teams ?? []).find((team) => Number(team.id) === teamId);
  return match?.name ? String(match.name) : "";
}

export function computeUserKpis(list) {
  const items = list ?? [];
  const total = items.length;
  let active = 0;
  let inactive = 0;
  let admins = 0;

  for (const item of items) {
    if (isUserActive(item)) active += 1;
    else inactive += 1;
    if (getUserRole(item) === "admin") admins += 1;
  }

  return {
    total,
    active,
    inactive,
    admins,
    totalShare: "100%",
    activeShare: shareOfTotal(active, total),
    inactiveShare: shareOfTotal(inactive, total),
    adminsShare: shareOfTotal(admins, total),
  };
}

export function emptyUserFormValues() {
  return {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
    job_title: "",
    phone: "",
    team_id: "",
    is_active: true,
  };
}

export function userToFormValues(user) {
  if (!user) return emptyUserFormValues();
  const teamId = getUserTeamId(user);
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    password: "",
    password_confirmation: "",
    role: getUserRole(user),
    job_title: user.job_title ?? "",
    phone: user.phone ?? "",
    team_id: teamId != null ? String(teamId) : "",
    is_active: isUserActive(user),
  };
}

export function formValuesToPayload(values, mode = "create") {
	const payload = {
		name: values.name.trim(),
		email: values.email.trim(),
		role: roleToApiValue(values.role),
		job_title: values.job_title.trim() || null,
		phone: values.phone?.trim() || null,
		team_id: hasId(values.team_id) ? Number(values.team_id) : null,
	};

  const hasPassword = Boolean(values.password);
  if (mode === "create" || hasPassword) {
    payload.password = values.password;
    payload.password_confirmation = values.password_confirmation;
  }

  if (mode === "edit") {
    payload.is_active = Boolean(values.is_active);
  }

  return payload;
}

export function validateUserForm(values, t, mode = "create") {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = t("users.validation.nameRequired");
  }

  if (!values.email?.trim()) {
    errors.email = t("users.validation.emailRequired");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = t("users.validation.emailInvalid");
  }

  if (!values.role?.trim()) {
    errors.role = t("users.validation.roleRequired");
  }

  const needsPassword = mode === "create" || Boolean(values.password);
  if (needsPassword) {
    if (!values.password) {
      errors.password = t("users.validation.passwordRequired");
    } else if (values.password.length < 8) {
      errors.password = t("users.validation.passwordMinLength");
    }

    if (!values.password_confirmation) {
      errors.password_confirmation = t(
        "users.validation.confirmPasswordRequired",
      );
    } else if (values.password !== values.password_confirmation) {
      errors.password_confirmation = t("users.validation.passwordsMismatch");
    }
  }

  return errors;
}
