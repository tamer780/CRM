import { FolderKanban } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

function formatDate(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const statusTone = {
	active: "bg-success/10 text-success",
	upcoming: "bg-primary/10 text-primary",
	paused: "bg-warning/10 text-warning",
	completed: "bg-slate-100 text-slate-700",
	archived: "bg-background text-muted",
};

const ProjectsOverview = ({ projects, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();
	const list = (projects ?? []).slice(0, 5);

	if (isLoading) return <LoadingSkeleton variant="table" />;

	return (
		<section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="text-[22px] font-semibold tracking-tight text-text">
						{t("dashboard.projects.title")}
					</h2>
					<p className="mt-1 text-sm text-muted">
						{t("dashboard.projects.subtitle")}
					</p>
				</div>
				<Link
					to="/projects"
					className="text-sm font-medium text-primary hover:text-secondary"
				>
					{t("dashboard.projects.viewAll")}
				</Link>
			</div>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !list.length ? (
				<EmptyState
					icon={FolderKanban}
					title={t("dashboard.projects.emptyTitle")}
					message={t("dashboard.projects.emptyMessage")}
				/>
			) : (
				<ul className="mt-5 space-y-3">
					{list.map((project, index) => {
						const status = String(project.status ?? "").toLowerCase();
						return (
							<motion.li
								key={project.id}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.04 }}
							>
								<Link
									to="/projects"
									className="block rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
									<div className="flex items-start justify-between gap-3">
										<p className="font-semibold text-text">
											{project.name ?? `Project #${project.id}`}
										</p>
										<span
											className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusTone[status] ?? "bg-background text-muted"}`}
										>
											{t(`projects.status.${status}`, {
												defaultValue: status || "—",
											})}
										</span>
									</div>
									<p className="mt-2 text-xs text-muted">
										{t("dashboard.projects.started")}:{" "}
										{formatDate(project.started_at)}
									</p>
								</Link>
							</motion.li>
						);
					})}
				</ul>
			)}
		</section>
	);
};

export default ProjectsOverview;
