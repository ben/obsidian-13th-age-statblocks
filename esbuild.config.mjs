import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

esbuild.build({
	banner: {
		js: banner,
	},
	entryPoints: ['main.ts', 'import-from-archmage.ts', 'import-from-archmage-db.ts', 'import-from-archmage-yaml.ts'],
	bundle: true,
	external: ['obsidian', 'electron', ...builtins],
	format: 'cjs',
	watch: !prod,
	target: 'es2016',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outdir: '.'
}).catch(() => process.exit(1));
