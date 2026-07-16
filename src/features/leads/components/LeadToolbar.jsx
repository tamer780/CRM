import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	LEAD_SOURCES,
	LEAD_STATUS_FILTERABLE,
} from "../../../utils/leads/leadConstants";
import ActiveFilters from "./filters/ActiveFilters";
import FilterButton from "./filters/FilterButton";
import FilterPopover from "./filters/FilterPopover";
import SearchInput from "./filters/SearchInput";
import {
	buildActiveFilterChips,
	clearAllAppliedFilters,
	countActiveFilters,
	emptyDraftFilters,
	pickDraftFromFilters,
} from "./filters/filterHelpers";

const statusOptions = LEAD_STATUS_FILTERABLE;

const LeadToolbar = ({
	filters,
	onFiltersChange,
	projects = [],
	campaigns = [],
	users = [],
}) => {
	const { t } = useTranslation();
	const anchorRef = useRef(null);
	const popoverRef = useRef(null);
	const buttonRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(emptyDraftFilters);

	const activeCount = countActiveFilters(filters);

	const statusOpts = useMemo(
		() =>
			statusOptions.map((s) => ({
				value: s,
				label: t(`leads.status.${s}`),
			})),
		[t],
	);

	const sourceOpts = useMemo(
		() =>
			LEAD_SOURCES.map((s) => ({
				value: s,
				label: t(`leads.sources.${s}`),
			})),
		[t],
	);

	const projectOpts = useMemo(
		() =>
			projects.map((p) => ({
				value: p.id,
				label: p.name ?? p.title ?? `#${p.id}`,
			})),
		[projects],
	);

	const campaignOpts = useMemo(
		() =>
			campaigns.map((c) => ({
				value: c.id,
				label: c.name ?? c.title ?? `#${c.id}`,
			})),
		[campaigns],
	);

	const userOpts = useMemo(
		() =>
			users.map((u) => ({
				value: u.id,
				label: u.name ?? u.email ?? `#${u.id}`,
			})),
		[users],
	);

	const chips = useMemo(
		() =>
			buildActiveFilterChips(filters, {
				t,
				statusOpts,
				sourceOpts,
				projectOpts,
				campaignOpts,
				userOpts,
			}),
		[
			filters,
			t,
			statusOpts,
			sourceOpts,
			projectOpts,
			campaignOpts,
			userOpts,
		],
	);

	const openPopover = () => {
		setDraft(pickDraftFromFilters(filters));
		setOpen(true);
	};

	const closePopover = () => setOpen(false);

	const togglePopover = () => {
		if (open) closePopover();
		else openPopover();
	};

	const handleApply = () => {
		onFiltersChange({
			...filters,
			...draft,
		});
		closePopover();
	};

	const handleDraftReset = () => {
		setDraft(emptyDraftFilters());
	};

	const handleRemoveChip = (chipId) => {
		const chip = chips.find((c) => c.id === chipId);
		if (!chip) return;
		onFiltersChange({ ...filters, ...chip.clear });
	};

	const handleClearAll = () => {
		onFiltersChange(clearAllAppliedFilters(filters));
	};

	useEffect(() => {
		if (!open) return undefined;

		const handlePointer = (e) => {
			const target = e.target;
			if (anchorRef.current?.contains(target)) return;
			closePopover();
		};
		const handleKey = (e) => {
			if (e.key === "Escape") closePopover();
		};

		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	return (
		<div className="sticky top-0 z-20 -mx-1 space-y-2.5 border-b border-border bg-background/95 px-1 py-3 backdrop-blur">
			<div className="flex flex-wrap items-center gap-2 sm:gap-3">
				<SearchInput
					value={filters.search}
					onChange={(search) => onFiltersChange({ ...filters, search })}
				/>

				<div className="relative" ref={anchorRef}>
					<FilterButton
						buttonRef={buttonRef}
						count={activeCount}
						open={open}
						onClick={togglePopover}
					/>
					{open && (
						<FilterPopover
							popoverRef={popoverRef}
							draft={draft}
							onDraftChange={setDraft}
							statusOpts={statusOpts}
							sourceOpts={sourceOpts}
							projectOpts={projectOpts}
							campaignOpts={campaignOpts}
							userOpts={userOpts}
							onApply={handleApply}
							onReset={handleDraftReset}
						/>
					)}
				</div>
			</div>

			<ActiveFilters
				chips={chips}
				onRemove={handleRemoveChip}
				onClearAll={handleClearAll}
			/>
		</div>
	);
};

export default LeadToolbar;
