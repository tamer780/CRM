import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../../hooks/ui/useBodyScrollLock";

const LeadFormModal = ({
	open,
	title,
	subtitle,
	onClose,
	children,
	preventClose = false,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const descId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const onCloseRef = useRef(onClose);
	const preventCloseRef = useRef(preventClose);

	useBodyScrollLock(open);

	useEffect(() => {
		onCloseRef.current = onClose;
		preventCloseRef.current = preventClose;
	});

	// Only run open/close side effects when `open` changes — not when
	// onClose/preventClose identities change on each parent re-render
	// (e.g. typing in the form), which would steal focus.
	useEffect(() => {
		if (!open) return undefined;

		previousFocusRef.current = document.activeElement;

		const dialog = dialogRef.current;
		const focusable = dialog?.querySelector(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		focusable?.focus();

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				if (!preventCloseRef.current) {
					event.preventDefault();
					onCloseRef.current();
				}
				return;
			}

			if (event.key !== "Tab" || !dialog) return;

			const nodes = dialog.querySelectorAll(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
			);
			const list = Array.from(nodes);
			if (list.length === 0) return;

			const first = list[0];
			const last = list[list.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			previousFocusRef.current?.focus?.();
		};
	}, [open]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
			<div
				className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
				onClick={() => {
					if (!preventCloseRef.current) onCloseRef.current();
				}}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={subtitle ? descId : undefined}
				className="animate-card-in relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden border border-border bg-surface shadow-xl max-sm:h-full max-sm:max-h-none max-sm:rounded-none sm:rounded-2xl"
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<h2 id={titleId} className="text-lg font-semibold text-text sm:text-xl">
							{title}
						</h2>
						{subtitle && (
							<p id={descId} className="mt-1 text-sm text-muted">
								{subtitle}
							</p>
						)}
					</div>
					<button
						type="button"
						onClick={() => onCloseRef.current()}
						disabled={preventClose}
						className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
						aria-label={t("common.close")}
					>
						<X className="size-5" />
					</button>
				</div>
				<div className="flex min-h-0 flex-1 flex-col">{children}</div>
			</div>
		</div>
	);
};

export default LeadFormModal;
