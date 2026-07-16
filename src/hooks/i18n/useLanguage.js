import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { applyDocumentDirection } from "../../i18n";
import { setLocale } from "../../utils/i18n/languageStorage";

export function useLanguage() {
	const { i18n } = useTranslation();
	const currentLanguage = i18n.language?.startsWith("ar") ? "ar" : "en";

	const changeLanguage = useCallback(
		(locale) => {
			if (locale === currentLanguage) return;
			setLocale(locale);
			applyDocumentDirection(locale);
			i18n.changeLanguage(locale);
		},
		[currentLanguage, i18n],
	);

	return {
		currentLanguage,
		changeLanguage,
		isRtl: currentLanguage === "ar",
	};
}
