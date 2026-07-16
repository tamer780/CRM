const AVATAR_TONES = [
	"bg-primary/10 text-primary",
	"bg-accent/15 text-accent",
	"bg-gold/20 text-primary",
	"bg-secondary/10 text-secondary",
	"bg-light-gold text-primary",
];

export function getInitials(name) {
	if (!name || typeof name !== "string") return "?";
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getAvatarTone(name) {
	const str = String(name ?? "");
	let hash = 0;
	for (let i = 0; i < str.length; i += 1) {
		hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
	}
	return AVATAR_TONES[hash % AVATAR_TONES.length];
}
