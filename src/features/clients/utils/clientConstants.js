export const CLIENT_STATUSES = [
	"active",
	"reserved",
	"contracted",
	"bought",
	"canceled",
	"lost",
	"archived",
];

export const CLIENT_SOURCES = [
	"facebook",
	"instagram",
	"google",
	"tiktok",
	"website",
	"referral",
	"manual",
];

export const CLIENT_STATUS_STYLES = {
	active: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
	reserved: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
	contracted: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
	bought: "bg-light-gold text-gold ring-1 ring-inset ring-gold/30",
	canceled: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
	lost: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200",
	archived: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export const CLIENT_STATUS_DOT_COLORS = {
	active: "bg-green-500",
	reserved: "bg-blue-500",
	contracted: "bg-violet-500",
	bought: "bg-gold",
	canceled: "bg-orange-500",
	lost: "bg-red-500",
	archived: "bg-slate-400",
};

function shareOfTotal(count, total) {
	if (!total) return "0%";
	return `${Math.round((count / total) * 100)}%`;
}

export function computeClientKpis(list) {
	const items = list ?? [];
	const total = items.length;
	let active = 0;
	let reserved = 0;
	let contracted = 0;
	let bought = 0;
	let lost = 0;

	for (const item of items) {
		if (item.status === "active") active += 1;
		else if (item.status === "reserved") reserved += 1;
		else if (item.status === "contracted") contracted += 1;
		else if (item.status === "bought") bought += 1;
		else if (item.status === "lost") lost += 1;
	}

	return {
		total,
		active,
		reserved,
		contracted,
		bought,
		lost,
		totalShare: "100%",
		activeShare: shareOfTotal(active, total),
		reservedShare: shareOfTotal(reserved, total),
		contractedShare: shareOfTotal(contracted, total),
		boughtShare: shareOfTotal(bought, total),
		lostShare: shareOfTotal(lost, total),
	};
}

export function emptyClientFormValues() {
	return {
		name: "",
		phone: "",
		email: "",
		project_id: "",
		campaign_id: "",
		assigned_to: "",
		status: "active",
	};
}

export function clientToFormValues(client) {
	if (!client) return emptyClientFormValues();
	return {
		name: client.name ?? "",
		phone: client.phone ?? "",
		email: client.email ?? "",
		project_id:
			client.project_id == null || client.project_id === ""
				? ""
				: String(client.project_id),
		campaign_id:
			client.campaign_id == null || client.campaign_id === ""
				? ""
				: String(client.campaign_id),
		assigned_to:
			client.assigned_to == null || client.assigned_to === ""
				? ""
				: String(client.assigned_to),
		status: client.status ?? "active",
	};
}

export function formValuesToPayload(values) {
	return {
		name: values.name.trim(),
		phone: values.phone.trim(),
		email: values.email?.trim() || null,
		project_id: values.project_id ? Number(values.project_id) : null,
		campaign_id: values.campaign_id ? Number(values.campaign_id) : null,
		assigned_to: values.assigned_to ? Number(values.assigned_to) : null,
		status: values.status || "active",
	};
}

export function validateClientForm(values, t) {
	const errors = {};

	if (!values.name?.trim()) {
		errors.name = t("clients.validation.nameRequired");
	}
	if (!values.phone?.trim()) {
		errors.phone = t("clients.validation.phoneRequired");
	}

	return errors;
}
