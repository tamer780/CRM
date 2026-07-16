import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getNavLabelKey } from "../components/layout/navConfig";

const ComingSoonPage = () => {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const title = t(getNavLabelKey(pathname));

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-10 text-center shadow-sm transition-shadow duration-300 hover:shadow-md">
				<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-light-gold">
					<Construction className="size-8 text-gold" aria-hidden="true" />
				</div>
				<h1 className="text-2xl font-semibold tracking-tight text-text">
					{title}
				</h1>
				<p className="mt-2 text-muted">{t("comingSoon.message")}</p>
				<p className="mt-1 text-sm text-muted/80">{t("comingSoon.hint")}</p>
			</div>
		</div>
	);
};

export default ComingSoonPage;
