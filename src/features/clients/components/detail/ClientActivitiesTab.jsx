import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { sortActivitiesDesc } from "../../../pendingLeads/utils/activityDiff";
import ClientActivityItem from "./ClientActivityItem";

function EmptyState({ title, message }) {
	return (
		<div className="px-4 py-10 text-center">
			<p className="text-sm font-medium text-text">{title}</p>
			<p className="mt-1 text-sm text-muted">{message}</p>
		</div>
	);
}

const ClientActivitiesTab = ({ activities = [] }) => {
	const { t } = useTranslation();
	const sorted = useMemo(() => sortActivitiesDesc(activities), [activities]);

	if (sorted.length === 0) {
		return (
			<EmptyState
				title={t("clients.drawer.activitiesEmptyTitle")}
				message={t("clients.drawer.activitiesEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="relative space-y-3 border-s border-border ms-1.5 py-1">
			{sorted.map((activity) => (
				<ClientActivityItem key={activity.id} activity={activity} />
			))}
		</ul>
	);
};

export default ClientActivitiesTab;
