// Normalises machine-specific paths out of a built bundle.
//
// spicetify-creator feeds esbuild a generated entry file in the OS temp
// directory, and the Sass step compiles through another temp path; esbuild
// then embeds both as comments. That leaks local temp paths into the committed
// artifact and makes back-to-back builds differ byte-for-byte, which in turn
// breaks CI's "is the committed bundle current?" check.
//
// Usage: node scripts/strip-build-paths.mjs <bundle.js> [...more files]
import { readFileSync, writeFileSync } from "node:fs";

for (const file of process.argv.slice(2)) {
	const before = readFileSync(file, "utf8");
	const after = before
		// `// ../../../var/folders/…/spicetify-creator/index.jsx`
		.replace(/^(\s*)\/\/ .*spicetify-creator\/index\.jsx$/m, "$1// spicetify-creator entry")
		// `/* ../../../var/folders/…/tmp-…/…/catalogue.css */` (inside the injected CSS string)
		.replace(/\/\*[^*]*\/(catalogue\.css) \*\//g, "/* $1 */");

	if (after !== before) {
		writeFileSync(file, after);
		console.log(`normalised ${file}`);
	} else {
		console.log(`already clean ${file}`);
	}
}
