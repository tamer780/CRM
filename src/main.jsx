import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./i18n";
import "./index.css";
import router from "./router.jsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				const status = error?.response?.status ?? error?.status;
				if (status === 401 || status === 403) return false;
				return failureCount < 3;
			},
		},
	},
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<Toaster
				position="top-right"
				richColors
				closeButton
				toastOptions={{
					classNames: {
						toast: "rounded-xl border border-border shadow-lg",
					},
				}}
			/>
		</QueryClientProvider>
	</StrictMode>,
);
