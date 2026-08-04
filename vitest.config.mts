import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["projects/**/src/**/*.test.ts"],
		environment: "node",
	},
});
