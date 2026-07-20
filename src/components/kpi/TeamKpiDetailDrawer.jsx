import { ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../hooks/ui/useBodyScrollLock";
import RateBar from "../dashboard/RateBar";
import { formatRate, getDefaultTeamKpiTab } from "./kpiFormatters";
import TeamKpiFunnelStrip from "./TeamKpiFunnelStrip";
import TeamKpiMeetingStats from "./TeamKpiMeetingStats";

const TABS = ["leads", "meetings", "members"];

const MEMBER_COLUMNS = [
	{ key: "name", sortKey: "name", labelKey: "name" },
	{ key: "total_assigned", sortKey: "total_assigned", labelKey: "assigned" },
	{ key: "contact_rate", sortKey: "contact_rate", labelKey: "contactRate" },
	{
		key: "conversion_rate",
		sortKey: "conversion_rate",
		labelKey: "conversionRate",
	},
	{ key: "meetings_total", sortKey: "meetings_total", labelKey: "meetingsTotal" },
	{ key: "show_rate", sortKey: "show_rate", labelKey: "showRate" },
	{ key: "purchase_rate", sortKey: "purchase_rate", labelKey: "purchaseRate" },
];

function formatPeriodDate(value) {
	if (!value) return "—";
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function getMemberSortValue(member, sortKey) {
	if (sortKey === "name") return (member.name ?? "").toLowerCase();
	if (sortKey === "meetings_total") return Number(member.meetings?.total) || 0;
	if (sortKey === "show_rate") return Number(member.meetings?.show_rate) || 0;
	if (sortKey === "purchase_rate") return Number(member.meetings?.purchase_rate) || 0;
	return Number(member[sortKey]) || 0;
}

function renderMemberCell(member, column) {
	switch (column.key) {
		case "name":
			return <span className="font-medium text-text">{member.name ?? "—"}</span>;
		case "total_assigned":
			return member.total_assigned ?? 0;
		case "contact_rate":
			return <RateBar value={member.contact_rate} />;
		case "conversion_rate":
			return <RateBar value={member.conversion_rate} />;
		case "meetings_total":
			return member.meetings?.total ?? 0;
		case "show_rate":
			return formatRate(member.meetings?.show_rate);
		case "purchase_rate":
			return formatRate(member.meetings?.purchase_rate);
		default:
			return "—";
	}
}

const TeamKpiMembersTable = ({ members }) => {
	const { t } = useTranslation();
	const [sortKey, setSortKey] = useState("conversion_rate");
	const [sortDir, setSortDir] = useState("desc");

	const sortedMembers = useMemo(() => {
		const list = [...(members ?? [])];
		list.sort((a, b) => {
			const aVal = getMemberSortValue(a, sortKey);
			const bVal = getMemberSortValue(b, sortKey);
			if (typeof aVal === "string" && typeof bVal === "string") {
				const cmp = aVal.localeCompare(bVal);
				return sortDir === "asc" ? cmp : -cmp;
			}
			const diff = Number(aVal) - Number(bVal);
			return sortDir === "asc" ? diff : -diff;
		});
		return list;
	}, [members, sortKey, sortDir]);

	const toggleSort = (key) => {
		if (sortKey === key) {
			setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
			return;
		}
		setSortKey(key);
		setSortDir(key === "name" ? "asc" : "desc");
	};

	const SortIcon = ({ columnKey }) => {
		if (sortKey !== columnKey) {
			return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
		}
		return sortDir === "asc" ? (
			<ArrowUp className="size-3.5" aria-hidden="true" />
		) : (
			<ArrowDown className="size-3.5" aria-hidden="true" />
		);
	};

	if (!sortedMembers.length) {
		return (
			<p className="rounded-xl border border-border bg-background/60 px-4 py-6 text-sm text-muted">
				{t("kpi.teams.members.empty")}
			</p>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border">
			<table className="min-w-full text-start text-sm">
				<thead className="bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
					<tr>
						{MEMBER_COLUMNS.map((column) => (
							<th key={column.key} className="px-3 py-3 text-start">
								<button
									type="button"
									onClick={() => toggleSort(column.sortKey)}
									className="inline-flex items-center gap-1 hover:text-text"
								>
									{t(`kpi.teams.members.columns.${column.labelKey}`)}
									<SortIcon columnKey={column.sortKey} />
								</button>
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-border bg-surface">
					{sortedMembers.map((member) => {
						const isLowContact = (Number(member.contact_rate) || 0) < 50;
						return (
							<tr
								key={member.user_id ?? member.name}
								className={[
									"transition-colors hover:bg-background/70",
									isLowContact ? "bg-warning/5" : "",
								].join(" ")}
							>
								{MEMBER_COLUMNS.map((column) => (
									<td key={column.key} className="px-3 py-3 text-muted">
										{renderMemberCell(member, column)}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

const TeamKpiDetailDrawer = ({ team, open, onClose, dateFrom, dateTo }) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const [activeTab, setActiveTab] = useState("leads");

	useBodyScrollLock(open);

	useEffect(() => {
		if (!open || !team) return;
		setActiveTab(getDefaultTeamKpiTab(team.members?.length ?? 0));
	}, [open, team]);

	useEffect(() => {
		if (!open) return undefined;

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	if (!open || !team) return null;

	const from = formatPeriodDate(dateFrom);
	const to = formatPeriodDate(dateTo);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="animate-card-in relative z-10 flex h-[min(92vh,720px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
			>
				<header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<h2
							id={titleId}
							className="truncate text-lg font-semibold text-text sm:text-xl"
						>
							{team.team_name ?? team.name ?? t("kpi.teams.title")}
						</h2>
						<div className="mt-2 space-y-2 text-sm text-muted">
							<p>{t("kpi.periodRange", { from, to })}</p>
							<div className="flex flex-wrap gap-4">
								<span>
									{t("kpi.sales.contactRate")}:{" "}
									<strong className="text-text">
										{formatRate(team.contact_rate)}
									</strong>
								</span>
								<span>
									{t("kpi.sales.conversionRate")}:{" "}
									<strong className="text-text">
										{formatRate(team.conversion_rate)}
									</strong>
								</span>
							</div>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
						aria-label={t("common.close")}
					>
						<X className="size-5" aria-hidden="true" />
					</button>
				</header>

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
					<nav
						className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-px"
						aria-label={t("kpi.teams.tabsLabel")}
						role="tablist"
					>
						{TABS.map((tab) => {
							const isActive = activeTab === tab;
							return (
								<button
									key={tab}
									type="button"
									role="tab"
									aria-selected={isActive}
									onClick={() => setActiveTab(tab)}
									className={[
										"shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition",
										isActive
											? "border-b-2 border-gold text-text"
											: "text-muted hover:text-text",
									].join(" ")}
								>
									{t(`kpi.teams.tabs.${tab}`)}
								</button>
							);
						})}
					</nav>

					{activeTab === "leads" && <TeamKpiFunnelStrip leads={team.leads} />}

					{activeTab === "meetings" && (
						<TeamKpiMeetingStats meetings={team.meetings} />
					)}

					{activeTab === "members" && (
						<TeamKpiMembersTable members={team.members} />
					)}
				</div>
			</div>
		</div>
	);
};

export default TeamKpiDetailDrawer;
