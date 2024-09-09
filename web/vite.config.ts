import { vitePlugin as remix } from "@remix-run/dev";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { remixDevTools } from "remix-development-tools";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	build: {
		sourcemap: true,
	},
	plugins: [
		remixDevTools(),
		envOnlyMacros(),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
			ignoredRouteFiles: ["**/*"],
			routes: async (defineRoutes) => {
				return flatRoutes("routes", defineRoutes);
			},
		}),
		tsconfigPaths(),
		sentryVitePlugin({
			org: "reimei",
			project: "eveeve",
			url: "https://sentry.io/",
		}),
	],
});
