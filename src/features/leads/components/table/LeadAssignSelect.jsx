import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { getUserRole } from "../../../users/utils/userConstants";
import { getAvatarTone, getInitials } from "../../utils/leadAvatars";

const ASSIGNABLE_ROLES = new Set(["sales", "leader", "supervisor"]);
const MENU_MAX_HEIGHT = 224; // max-h-56
const MENU_GAP = 6;

const LeadAssignSelect = ({
	assignedTo,
	users = [],
	onChange,
	disabled = false,
	isUpdating = false,
	placement = "bottom",
}) => {
	const { t } = useTranslation();
	const listId = useId();
	const triggerRef = useRef(null);
	const listRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState(null);

	const locked = disabled || isUpdating;
	const currentId =
		assignedTo != null && assignedTo !== "" ? String(assignedTo) : "";

	const options = useMemo(
		() =>
			users
				.filter((user) =>
					ASSIGNABLE_ROLES.has(getUserRole(user).toLowerCase()),
				)
				.map((user) => {
					const name = user.name ?? user.email ?? `#${user.id}`;
					const roleKey = getUserRole(user).toLowerCase();
					const roleLabel = roleKey
						? t(`users.roles.${roleKey}`, {
								defaultValue: user.role ?? user.job_title ?? "",
							})
						: (user.job_title ?? "");
					return {
						value: String(user.id),
						name,
						role: roleLabel,
					};
				}),
		[users, t],
	);

	const selected = options.find((opt) => opt.value === currentId) ?? null;

	const updateMenuPosition = () => {
		const trigger = triggerRef.current;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		const spaceAbove = rect.top;
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUp =
			placement === "top"
				? spaceAbove >= Math.min(MENU_MAX_HEIGHT, 120) || spaceAbove > spaceBelow
				: spaceBelow < Math.min(MENU_MAX_HEIGHT, 120) && spaceAbove > spaceBelow;

		const style = {
			position: "fixed",
			left: rect.left,
			minWidth: Math.max(rect.width, 208),
			maxHeight: MENU_MAX_HEIGHT,
			zIndex: 200,
		};

		if (openUp) {
			style.bottom = window.innerHeight - rect.top + MENU_GAP;
			style.top = "auto";
		} else {
			style.top = rect.bottom + MENU_GAP;
			style.bottom = "auto";
		}

		setMenuStyle(style);
	};

	useLayoutEffect(() => {
		if (!open) {
			setMenuStyle(null);
			return undefined;
		}
		updateMenuPosition();
		const handleReposition = () => updateMenuPosition();
		window.addEventListener("resize", handleReposition);
		window.addEventListener("scroll", handleReposition, true);
		return () => {
			window.removeEventListener("resize", handleReposition);
			window.removeEventListener("scroll", handleReposition, true);
		};
	}, [open, placement]);

	useEffect(() => {
		if (!open) return undefined;
		const handlePointer = (e) => {
			const inTrigger = triggerRef.current?.contains(e.target);
			const inList = listRef.current?.contains(e.target);
			if (!inTrigger && !inList) setOpen(false);
		};
		const handleKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	const selectUser = (nextId) => {
		setOpen(false);
		if (locked || String(nextId) === currentId) return;
		onChange?.(Number(nextId));
	};

	const menu =
		open &&
		menuStyle &&
		createPortal(
			<ul
				ref={listRef}
				id={listId}
				role="listbox"
				aria-label={t("dashboard.quickActions.assignLead")}
				style={menuStyle}
				className="custom-scrollbar animate-dropdown-in overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg"
			>
				{options.length === 0 ? (
					<li className="px-3 py-2 text-sm text-muted">—</li>
				) : (
					options.map((option) => {
						const isSelected = option.value === currentId;
						return (
							<li
								key={option.value}
								role="option"
								aria-selected={isSelected}
							>
								<button
									type="button"
									onClick={() => selectUser(option.value)}
									className={[
										"flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition-colors",
										isSelected
											? "bg-light-gold/60 font-medium text-text"
											: "text-text hover:bg-background",
									].join(" ")}
								>
									<span className="flex min-w-0 items-center gap-2.5">
										<span
											className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(option.name)}`}
										>
											{getInitials(option.name)}
										</span>
										<span className="min-w-0 flex flex-col">
											<span className="truncate">{option.name}</span>
											{option.role && (
												<span className="truncate text-xs text-muted">
													{option.role}
												</span>
											)}
										</span>
									</span>
									{isSelected && (
										<Check
											className="size-4 shrink-0 text-gold"
											aria-hidden="true"
										/>
									)}
								</button>
							</li>
						);
					})
				)}
			</ul>,
			document.body,
		);

	return (
		<div
			ref={triggerRef}
			className="relative inline-flex w-36 max-w-full"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				disabled={locked}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={t("dashboard.quickActions.assignLead")}
				title={selected?.name ?? t("dashboard.quickActions.assignLead")}
				onClick={() => !locked && setOpen((prev) => !prev)}
				className="inline-flex w-full min-w-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60"
			>
				{isUpdating ? (
					<span className="min-w-0 truncate text-muted">
						{t("common.loading")}
					</span>
				) : selected ? (
					<span className="flex min-w-0 flex-1 items-center gap-2">
						<span
							className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(selected.name)}`}
						>
							{getInitials(selected.name)}
						</span>
						<span className="truncate">{selected.name}</span>
					</span>
				) : (
					<span className="min-w-0 flex-1 truncate text-muted">—</span>
				)}
				<ChevronDown
					className={`size-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>
			{menu}
		</div>
	);
};

export default LeadAssignSelect;
