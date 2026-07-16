import { useState } from "react";
import { Outlet } from "react-router-dom";
import MobileSidebar from "./MobileSidebar";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background text-text">
			<Sidebar
				collapsed={collapsed}
				onToggleCollapse={() => setCollapsed((prev) => !prev)}
			/>
			<MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

			<div
				className={[
					"flex min-h-screen flex-col transition-[padding] duration-300",
					collapsed ? "lg:ps-[72px]" : "lg:ps-64",
				].join(" ")}
			>
				<Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
				<main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default AppLayout;
