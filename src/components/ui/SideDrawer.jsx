import { X } from "lucide-react";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../hooks/ui/useBodyScrollLock";

const SIZE_CLASSES = {
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-3xl",
};

const SideDrawer = ({
	open,
	onClose,
	title,
	subtitle,
	headerActions,
	children,
	preventClose = false,
	wide = false,
	size,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const resolvedSize = size ?? (wide ? "lg" : "md");
	const sizeClass = SIZE_CLASSES[resolvedSize] ?? SIZE_CLASSES.md;

	useBodyScrollLock(open);

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (e) => {
			if (e.key === "Escape" && !preventClose) onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("keydown", handleKey);
		};
	}, [open, preventClose, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div
				className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
				onClick={() => !preventClose && onClose()}
				aria-hidden="true"
			/>
			<aside
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={[
					"animate-drawer-in relative z-10 flex h-full w-full flex-col border-s border-border bg-surface shadow-2xl",
					sizeClass,
				].join(" ")}
			>
				<header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
					<div className="min-w-0 flex-1">
						<h2 id={titleId} className="text-lg font-semibold text-text">
							{title}
						</h2>
						{subtitle && (
							<div className="mt-0.5 text-sm text-muted">{subtitle}</div>
						)}
					</div>
					<div className="flex shrink-0 items-center gap-1">
						{headerActions}
						<button
							type="button"
							onClick={onClose}
							disabled={preventClose}
							className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text disabled:opacity-50"
							aria-label={t("common.close")}
						>
							<X className="size-5" aria-hidden="true" />
						</button>
					</div>
				</header>
				<div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
			</aside>
		</div>
	);
};

export default SideDrawer;
