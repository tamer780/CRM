import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import { getLocale } from "../utils/i18n/languageStorage";

export function applyDocumentDirection(locale) {
	const dir = locale === "ar" ? "rtl" : "ltr";
	document.documentElement.lang = locale;
	document.documentElement.dir = dir;
}

const savedLocale = getLocale();
applyDocumentDirection(savedLocale);

i18n.use(initReactI18next).init({
	resources: {
		ar: { translation: ar },
		en: { translation: en },
	},
	lng: savedLocale,
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
