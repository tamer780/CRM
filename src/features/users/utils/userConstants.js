export const USER_ROLES = ["admin", "sales", "leader", "supervisor"];

function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

export function getUserRole(user) {
	if (!user) return "";
	if (user.role) return String(user.role);
	if (Array.isArray(user.roles) && user.roles[0]) return String(user.roles[0]);
	return "";
}

export function isUserActive(user) {
	if (!user) return false;
	if (typeof user.is_active === "boolean") return user.is_active;
	if (user.status === "active") return true;
	if (user.status === "inactive") return false;
	return true;
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
	};
}

export function userToFormValues(user) {
	if (!user) return emptyUserFormValues();
	return {
		name: user.name ?? "",
		email: user.email ?? "",
		password: "",
		password_confirmation: "",
		role: getUserRole(user),
		job_title: user.job_title ?? "",
	};
}

export function formValuesToPayload(values, mode = "create") {
	const payload = {
		name: values.name.trim(),
		email: values.email.trim(),
		role: values.role.trim(),
		job_title: values.job_title.trim() || null,
	};

	const hasPassword = Boolean(values.password);
	if (mode === "create" || hasPassword) {
		payload.password = values.password;
		payload.password_confirmation = values.password_confirmation;
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
