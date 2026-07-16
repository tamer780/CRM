import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const ErrorState = ({ message, onRetry }) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
			<div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50">
				<AlertCircle className="size-7 text-red-500" aria-hidden="true" />
			</div>
			<h3 className="text-base font-semibold text-text">
				{t("dashboard.errorTitle")}
			</h3>
			<p className="mt-1.5 max-w-sm text-sm text-muted">
				{message || t("dashboard.errorMessage")}
			</p>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary"
				>
					<RefreshCw className="size-4" aria-hidden="true" />
					{t("dashboard.retry")}
				</button>
			)}
		</div>
	);
};

export default ErrorState;
