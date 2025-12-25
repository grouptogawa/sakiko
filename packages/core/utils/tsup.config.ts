import { defineConfig } from "tsup";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), "package.json"), "utf8")
) as {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
};

const external = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {})
];

export default defineConfig({
    entry: {
        index: "src/index.ts",
        "context/index": "src/context/index.ts",
        "snowflake/index": "src/snowflake/index.ts",
        "endpoint/index": "src/endpoint/index.ts",
        "unimsg/index": "src/unimsg/index.ts"
    },

    outDir: "dist",
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,

    treeshake: true,
    splitting: false,
    bundle: true,

    external
});
