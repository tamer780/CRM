import {
	Globe,
	MapPin,
	Megaphone,
	Radio,
	Share2,
	Store,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PLATFORM_BADGE_STYLES } from "../../features/campaigns/utils/campaignConstants";

const PLATFORM_ICONS = {
	facebook: Users,
	instagram: Megaphone,
	tiktok: Radio,
	google: Globe,
	website: Globe,
	offline: Store,
	referral: Share2,
	other: MapPin,
};

const PlatformBadge = ({ platform }) => {
	const { t } = useTranslation();

	if (!platform) {
		return <span className="text-sm text-muted">—</span>;
	}

	const styles =
		PLATFORM_BADGE_STYLES[platform] ?? "bg-background text-muted";
	const Icon = PLATFORM_ICONS[platform] ?? MapPin;
	const label = t(`campaigns.platforms.${platform}`, {
		defaultValue: t(`leads.sources.${platform}`, { defaultValue: platform }),
	});

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
		>
			<Icon className="size-3 shrink-0" aria-hidden="true" />
			{label}
		</span>
	);
};

export default PlatformBadge;
