const LOCALE_KEY = "amair_crm_locale";
const DEFAULT_LOCALE = "ar";

export function getLocale() {
	return localStorage.getItem(LOCALE_KEY) ?? DEFAULT_LOCALE;
}

export function setLocale(locale) {
	localStorage.setItem(LOCALE_KEY, locale);
}
