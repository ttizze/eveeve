import * as path from "node:path";
import * as VitestConfig from "vitest/config";
import dotenv from 'dotenv';

export default VitestConfig.defineConfig({
	test: {
		env: dotenv.config({ path: ".env" }).parsed,
		globals: true,
		environment: "vprisma",
		setupFiles: ["vitest-environment-vprisma/setup", "vitest.setup.ts"],
		environmentOptions: {
			vprisma: {
				baseEnv: "jsdom",
				databaseUrl:
					"postgresql://postgres:password@localhost:5433/postgres?schema=public",
			},
		},
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "app"),
		},
	},
});
