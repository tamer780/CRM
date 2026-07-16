import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import CampaignStatusBadge from "../../../components/ui/CampaignStatusBadge";
import PlatformBadge from "../../../components/ui/PlatformBadge";
import SourceBadge from "../../../components/ui/SourceBadge";
import { computeRoi } from "../utils/campaignConstants";
import { formatCurrency } from "../utils/formatCurrency";

function formatDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function Field({ label, value }) {
	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			<p className="mt-1 text-sm text-text">
				{value == null || value === "" ? "—" : value}
			</p>
		</div>
	);
}

function ModalSkeleton() {
	return (
		<div className="space-y-6 p-5 sm:p-6">
			{Array.from({ length: 4 }).map((_, section) => (
				<div key={section} className="space-y-3">
					<div className="h-4 w-32 animate-pulse rounded bg-border/70" />
					<div className="grid grid-cols-2 gap-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-3 w-16 animate-pulse rounded bg-border/50" />
								<div className="h-4 w-full animate-pulse rounded bg-border/70" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function resolveProject(projectsMap, id) {
	if (id == null || id === "") return "—";
	const item = projectsMap?.get(Number(id)) ?? projectsMap?.get(String(id));
	if (!item) return String(id);
	return item.name ?? item.title ?? String(id);
}

const CampaignDetailModal = ({
	open,
	onClose,
	campaign,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	projectsMap,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);

	const roi = campaign
		? computeRoi(campaign.revenue, campaign.spent_amount)
		: 0;
	const roiColor =
		roi > 0 ? "text-green-700" : roi < 0 ? "text-red-600" : "text-muted";

	useEffect(() => {
		if (!open) return undefined;

		previousFocusRef.current = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const dialog = dialogRef.current;
		const focusable = dialog?.querySelector(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		focusable?.focus();

		const handleKeyDown = (event) => {
			if (event.key === "Escape" && !preventClose) {
				event.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
			previousFocusRef.current?.focus?.();
		};
	}, [open, onClose, preventClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
				onClick={() => {
					if (!preventClose) onClose();
				}}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="animate-card-in relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<h2
							id={titleId}
							className="truncate text-lg font-semibold text-text sm:text-xl"
						>
							{campaign?.name ?? t("campaigns.drawer.title")}
						</h2>
						{campaign?.external_reference && (
							<p className="mt-1 truncate text-sm text-muted">
								{campaign.external_reference}
							</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={preventClose}
						className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
						aria-label={t("common.close")}
					>
						<X className="size-5" />
					</button>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto">
					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="px-5 py-8 sm:px-6">
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
								<p className="text-sm text-red-600">
									{t("campaigns.errors.loadDetailFailed")}
								</p>
								{onRetry && (
									<button
										type="button"
										onClick={onRetry}
										className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
									>
										{t("dashboard.retry")}
									</button>
								)}
							</div>
						</div>
					)}

					{campaign && !isLoading && (
						<div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("campaigns.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field label={t("campaigns.form.name")} value={campaign.name} />
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("campaigns.form.platform")}
										</p>
										<div className="mt-1.5">
											<PlatformBadge platform={campaign.platform} />
										</div>
									</div>
									<Field
										label={t("campaigns.form.project")}
										value={resolveProject(projectsMap, campaign.project_id)}
									/>
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("campaigns.form.source")}
										</p>
										<div className="mt-1.5">
											<SourceBadge source={campaign.source} />
										</div>
									</div>
									<Field
										label={t("campaigns.form.externalReference")}
										value={campaign.external_reference}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("campaigns.drawer.financial")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("campaigns.form.budget")}
										value={formatCurrency(campaign.budget)}
									/>
									<Field
										label={t("campaigns.form.spent")}
										value={formatCurrency(campaign.spent_amount)}
									/>
									<Field
										label={t("campaigns.form.revenue")}
										value={formatCurrency(campaign.revenue)}
									/>
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("campaigns.columns.roi")}
										</p>
										<p
											className={`mt-1 text-sm font-semibold tabular-nums ${roiColor}`}
										>
											{formatCurrency(roi)}
										</p>
									</div>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("campaigns.drawer.timeline")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("campaigns.form.startedAt")}
										value={formatDateTime(campaign.started_at)}
									/>
									<Field
										label={t("campaigns.form.endedAt")}
										value={
											campaign.ended_at
												? formatDateTime(campaign.ended_at)
												: t("campaigns.present")
										}
									/>
									<Field
										label={t("campaigns.drawer.createdAt")}
										value={formatDateTime(campaign.created_at)}
									/>
									<Field
										label={t("campaigns.drawer.updatedAt")}
										value={formatDateTime(campaign.updated_at)}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("campaigns.drawer.status")}
								</h3>
								<div className="rounded-2xl border border-border bg-background/40 p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-muted">
										{t("campaigns.form.status")}
									</p>
									<div className="mt-1.5">
										<CampaignStatusBadge status={campaign.status} />
									</div>
								</div>
							</section>
						</div>
					)}
				</div>

				<div className="flex shrink-0 justify-end border-t border-border px-5 py-4 sm:px-6">
					<button
						type="button"
						onClick={onClose}
						disabled={preventClose}
						className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
					>
						{t("common.close")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CampaignDetailModal;
