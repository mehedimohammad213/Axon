#!/usr/bin/env node
/**
 * Bulk rename .js/.jsx → .ts/.tsx for axon_cms.
 * - Files with JSX become .tsx
 * - Pure JS become .ts
 * - Config / tooling files stay as .js
 * Does not change runtime logic.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const KEEP_AS_JS = new Set([
  "next.config.js",
  "postcss.config.js",
  "tailwind.config.js",
  "ecosystem.config.js",
  "server.js", // CommonJS production server
]);

const SKIP_DIRS = new Set(["node_modules", ".next", "out", ".git"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && /\.(js|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function containsJsx(content) {
  // Heuristic: JSX tags in source (not in strings/comments is hard; good enough)
  return /<[A-Za-z][\w.:-]*(\s|>|\/)/.test(content) || /<\/[A-Za-z]/.test(content) || /<>/.test(content) || /<\/>/.test(content);
}

function targetExt(filePath, content) {
  const base = path.basename(filePath);
  if (KEEP_AS_JS.has(base)) return null; // skip
  if (filePath.endsWith(".jsx")) return ".tsx";
  if (containsJsx(content)) return ".tsx";
  return ".ts";
}

const files = walk(ROOT);
const renames = [];
const skipped = [];

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, "utf8");
  const ext = targetExt(file, content);
  if (!ext) {
    skipped.push(rel);
    continue;
  }
  const newPath = file.replace(/\.(js|jsx)$/, ext);
  if (newPath === file) continue;
  fs.renameSync(file, newPath);
  renames.push({ from: rel, to: path.relative(ROOT, newPath) });
}

// Fix known explicit .jsx imports after rename
const importFixFiles = [
  path.join(ROOT, "components/formbuilder/builder/ElementConfig.tsx"),
  path.join(ROOT, "components/formbuilder/builder/ElementConfig.ts"),
  path.join(ROOT, "components/Footer.tsx"),
  path.join(ROOT, "components/Footer.ts"),
];

for (const f of importFixFiles) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, "utf8");
  const next = c.replace(/MediaSelectionModal\.jsx/g, "MediaSelectionModal");
  if (next !== c) {
    fs.writeFileSync(f, next);
    console.log("Fixed import extensions in", path.relative(ROOT, f));
  }
}

console.log(JSON.stringify({ renamed: renames.length, skipped, sample: renames.slice(0, 15) }, null, 2));
