import { useEffect } from "react";

let lockCount = 0;

function lockBodyScroll() {
	lockCount += 1;
	if (lockCount === 1) {
		document.body.style.overflow = "hidden";
	}

	return () => {
		lockCount -= 1;
		if (lockCount === 0) {
			document.body.style.overflow = "";
		}
	};
}

export function useBodyScrollLock(locked) {
	useEffect(() => {
		if (!locked) return undefined;
		return lockBodyScroll();
	}, [locked]);
}
