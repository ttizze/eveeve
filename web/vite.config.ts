import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/server-runtime" {
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig({
	//sentryにアップロードするため必要､upload後消されるためセキュリティの問題はない
	build: {
		sourcemap: true,
	},
	plugins: [
		envOnlyMacros(),
		reactRouter(),
		tsconfigPaths(),
		sentryVitePlugin({
			org: "reimei",
			project: "evame",
			url: "https://sentry.io/",
			sourcemaps: {
				filesToDeleteAfterUpload: "true",
			},
		}),
	],
});
