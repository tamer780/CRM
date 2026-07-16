import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SidebarItem = ({ item, collapsed, onNavigate }) => {
	const { t } = useTranslation();
	const Icon = item.icon;

	return (
		<NavLink
			to={item.path}
			onClick={onNavigate}
			title={collapsed ? t(item.labelKey) : undefined}
			className={({ isActive }) =>
				[
					"group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
					collapsed ? "justify-center" : "",
					isActive
						? "border-s-2 border-gold bg-secondary text-gold"
						: "border-s-2 border-transparent text-white/75 hover:bg-secondary hover:text-white",
				].join(" ")
			}
		>
			{({ isActive }) => (
				<>
					<Icon
						className={[
							"size-5 shrink-0 transition-colors duration-200",
							isActive ? "text-gold" : "text-white/70 group-hover:text-white",
						].join(" ")}
						aria-hidden="true"
					/>
					{!collapsed && (
						<span className="truncate transition-opacity duration-200">
							{t(item.labelKey)}
						</span>
					)}
				</>
			)}
		</NavLink>
	);
};

export default SidebarItem;
