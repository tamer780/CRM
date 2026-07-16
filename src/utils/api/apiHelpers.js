export function extractData(response) {
	if (response?.data !== undefined && response?.success !== undefined) {
		return response.data;
	}

	if (response?.data !== undefined && typeof response.data === "object") {
		return response.data;
	}

	return response;
}

export function extractToken(data) {
	return data?.data?.token ?? data?.token ?? null;
}

export function extractUser(data) {
	return data?.data?.user ?? data?.data ?? data?.user ?? data;
}

export function extractApiError(error, fallback) {
	const data = error?.response?.data;

	if (typeof data?.message === "string" && data.message) {
		return data.message;
	}

	if (data?.errors && typeof data.errors === "object") {
		const firstField = Object.values(data.errors)[0];
		if (Array.isArray(firstField) && firstField[0]) {
			return firstField[0];
		}
	}

	return fallback;
}
