const TOKEN_KEY = "amair_crm_token";
const EMAIL_KEY = "amair_crm_email";

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
	localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
	localStorage.removeItem(TOKEN_KEY);
}

export function getRememberedEmail() {
	return localStorage.getItem(EMAIL_KEY) ?? "";
}

export function setRememberedEmail(email) {
	localStorage.setItem(EMAIL_KEY, email);
}

export function clearRememberedEmail() {
	localStorage.removeItem(EMAIL_KEY);
}
