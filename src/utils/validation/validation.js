import i18n from "../../i18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
	if (!email.trim()) {
		return i18n.t("validation.emailRequired");
	}
	if (!EMAIL_PATTERN.test(email)) {
		return i18n.t("validation.emailInvalid");
	}
	return "";
}

export function validatePassword(password) {
	if (!password) {
		return i18n.t("validation.passwordRequired");
	}
	if (password.length < 8) {
		return i18n.t("validation.passwordMinLength");
	}
	return "";
}

export function validateName(name) {
	if (!name.trim()) {
		return i18n.t("validation.nameRequired");
	}
	return "";
}

export function validatePasswordConfirmation(password, confirmation) {
	if (!confirmation) {
		return i18n.t("validation.confirmPasswordRequired");
	}
	if (password !== confirmation) {
		return i18n.t("validation.passwordsMismatch");
	}
	return "";
}
