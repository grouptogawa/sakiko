#!/usr/bin/env bun

// 你知道吗
// ChatGPT 真的太好用了.jpg
// 没有含人量的自动按依赖顺序编译整个项目的脚本，但是它该死的能用
// 所以我也该死的不想自己写了

// AI Generated Code Below

import { readFileSync, readdirSync } from "node:fs";

import { resolve } from "node:path";

type WorkspacePkg = {
    name: string;
    dir: string;
    scripts: Record<string, string>;
    deps: Set<string>;
};

type RootPkg = {
    workspaces?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readJsonFile<T>(absPath: string): T {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function joinPath(...parts: string[]) {
    return resolve(...parts);
}

function getWorkspacePackageDirs(rootDir: string): string[] {
    const rootPkg = readJsonFile<RootPkg>(joinPath(rootDir, "package.json"));
    const patterns = rootPkg.workspaces ?? [];

    // Support nested workspace globs under `packages/*/*` (e.g. `packages/core/*`, `packages/adapter/*`, ...).
    // We intentionally only implement the patterns we use in this repo to keep it simple and predictable.
    const dirs: string[] = [];
    const seen = new Set<string>();

    for (const p of patterns) {
        // Expect patterns like: "packages/<group>/*"
        const m = /^packages\/([^/]+)\/\*$/.exec(p);
        if (!m) continue;

        const groupDir = joinPath(rootDir, "packages", m[1]);
        for (const entry of readdirSync(groupDir, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;

            const abs = joinPath(groupDir, entry.name);
            if (seen.has(abs)) continue;
            seen.add(abs);
            dirs.push(abs);
        }
    }

    return dirs;
}

function readWorkspacePkg(dir: string): WorkspacePkg | null {
    const pkgPath = joinPath(dir, "package.json");
    try {
        readFileSync(pkgPath, "utf8");
    } catch {
        return null;
    }

    const pkgJson = readJsonFile<Record<string, unknown>>(pkgPath);
    const name = typeof pkgJson.name === "string" ? pkgJson.name : null;
    if (!name) return null;

    const scriptsRaw = isRecord(pkgJson.scripts) ? pkgJson.scripts : {};
    const scripts: Record<string, string> = {};
    for (const [k, v] of Object.entries(scriptsRaw)) {
        if (typeof v === "string") scripts[k] = v;
    }

    const deps = new Set<string>();
    for (const field of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies"
    ]) {
        const obj = isRecord(pkgJson[field])
            ? (pkgJson[field] as Record<string, unknown>)
            : null;
        if (!obj) continue;
        for (const depName of Object.keys(obj)) deps.add(depName);
    }

    return { name, dir, scripts, deps };
}

function topoSort(pkgs: WorkspacePkg[]): WorkspacePkg[] {
    const byName = new Map(pkgs.map((p) => [p.name, p] as const));

    // Edges: dep -> dependent (so deps build first)
    const outgoing = new Map<string, Set<string>>();
    const indegree = new Map<string, number>();

    for (const p of pkgs) {
        outgoing.set(p.name, new Set());
        indegree.set(p.name, 0);
    }

    for (const p of pkgs) {
        for (const dep of p.deps) {
            if (!byName.has(dep)) continue; // ignore external deps
            outgoing.get(dep)!.add(p.name);
            indegree.set(p.name, (indegree.get(p.name) ?? 0) + 1);
        }
    }

    const queue: string[] = [];
    for (const [name, deg] of indegree.entries()) {
        if (deg === 0) queue.push(name);
    }

    // stable-ish order
    queue.sort();

    const result: WorkspacePkg[] = [];
    while (queue.length) {
        const name = queue.shift()!;
        result.push(byName.get(name)!);

        const next = outgoing.get(name)!;
        for (const to of next) {
            const d = (indegree.get(to) ?? 0) - 1;
            indegree.set(to, d);
            if (d === 0) queue.push(to);
        }
        queue.sort();
    }

    if (result.length !== pkgs.length) {
        const remaining = pkgs
            .map((p) => p.name)
            .filter((n) => !result.some((p) => p.name === n));
        throw new Error(
            `workspace dependency cycle (or unresolved graph) detected among: ${remaining.join(", ")}`
        );
    }

    return result;
}

async function runScriptSequential(pkgs: WorkspacePkg[], scriptName: string) {
    for (const p of pkgs) {
        if (!p.scripts[scriptName]) continue;
        const child = Bun.spawn({
            cmd: ["bun", "run", scriptName],
            cwd: p.dir,
            stdout: "inherit",
            stderr: "inherit"
        });
        const exitCode = await child.exited;
        if (exitCode !== 0) {
            throw new Error(
                `script '${scriptName}' failed in ${p.name} (exit ${exitCode})`
            );
        }
    }
}

async function main() {
    const rootDir = process.cwd();
    const scriptName = process.argv[2] ?? "build";

    const dirs = getWorkspacePackageDirs(rootDir);
    const pkgs = dirs
        .map(readWorkspacePkg)
        .filter((p): p is WorkspacePkg => p !== null);

    const sorted = topoSort(pkgs);

    console.log(
        `[topo] running '${scriptName}' for ${sorted.length} workspaces in order:`
    );
    for (const p of sorted) console.log(`  - ${p.name}`);

    await runScriptSequential(sorted, scriptName);
}

await main();
