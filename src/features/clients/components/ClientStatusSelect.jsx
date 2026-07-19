import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
	CLIENT_STATUSES,
	CLIENT_STATUS_DOT_COLORS,
	CLIENT_STATUS_STYLES,
} from "../utils/clientConstants";

const MENU_MAX_HEIGHT = 280;
const MENU_GAP = 6;

function statusLabel(t, status) {
	const key = String(status ?? "").toLowerCase();
	return t(`clients.status.${key}`, {
		defaultValue: status ? String(status).replaceAll("_", " ") : "—",
	});
}

const ClientStatusSelect = ({
	status,
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

	const key = String(status ?? "").toLowerCase();
	const styles = CLIENT_STATUS_STYLES[key] ?? "bg-background text-muted";
	const dot = CLIENT_STATUS_DOT_COLORS[key] ?? "bg-muted";
	const label = statusLabel(t, status);
	const locked = disabled || isUpdating;

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
			minWidth: Math.max(rect.width, 176),
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

	const selectStatus = (next) => {
		setOpen(false);
		if (next === key || locked) return;
		onChange?.(next);
	};

	const menu =
		open &&
		menuStyle &&
		createPortal(
			<ul
				ref={listRef}
				id={listId}
				role="listbox"
				aria-label={t("clients.columns.status")}
				style={menuStyle}
				className="custom-scrollbar animate-dropdown-in overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg"
			>
				{CLIENT_STATUSES.map((option) => {
					const selected = option === key;
					const optionDot = CLIENT_STATUS_DOT_COLORS[option] ?? "bg-muted";
					return (
						<li key={option} role="option" aria-selected={selected}>
							<button
								type="button"
								onClick={() => selectStatus(option)}
								className={[
									"flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm capitalize transition-colors",
									selected
										? "bg-light-gold/60 font-medium text-text"
										: "text-text hover:bg-background",
								].join(" ")}
							>
								<span className="inline-flex items-center gap-2">
									<span
										className={`size-1.5 shrink-0 rounded-full ${optionDot}`}
										aria-hidden="true"
									/>
									{statusLabel(t, option)}
								</span>
								{selected && (
									<Check className="size-4 text-gold" aria-hidden="true" />
								)}
							</button>
						</li>
					);
				})}
			</ul>,
			document.body,
		);

	return (
		<div
			ref={triggerRef}
			className="relative inline-flex"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				disabled={locked}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={t("clients.columns.status")}
				title={t("clients.columns.status")}
				onClick={() => !locked && setOpen((prev) => !prev)}
				className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ring-black/5 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60 ${styles}`}
			>
				<span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
				{isUpdating ? t("common.loading") : label}
				<ChevronDown
					className={`size-3 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>
			{menu}
		</div>
	);
};

export default ClientStatusSelect;
