import { Loader2 } from "lucide-react";

const Spinner = ({ className = "size-5" }) => (
	<Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export default Spinner;
