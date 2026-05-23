#!/usr/bin/env node
/**
 * One-off: extract GRAMMAR_PATTERNS array from grammar-by-level/page.tsx
 * into a standalone data module so the page can dynamic-import it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const SRC = "src/pages/grammar-by-level/page.tsx";
const DEST = "src/data/grammarPatterns.ts";

const lines = readFileSync(SRC, "utf8").split("\n");

// 0-indexed: interface starts at line index 4 (file line 5), ends at line index 18 (file line 19)
// Array literal: line index 20 (file line 21) "const GRAMMAR_PATTERNS..." through line index 10281 (file line 10282) "];"
const interfaceLines = lines.slice(4, 19);   // GrammarPattern interface
const arrayLines = lines.slice(20, 10282);   // const GRAMMAR_PATTERNS: GrammarPattern[] = [ ... ];

const dataModule = [
  "// Auto-extracted from grammar-by-level/page.tsx by scripts/extract-grammar-data.mjs",
  "// Loaded via dynamic import so the 800KB+ payload is its own chunk and doesn't",
  "// bloat the initial bundle.",
  "",
  "export " + interfaceLines.join("\n"),
  "",
  "export " + arrayLines.join("\n"),
  "",
].join("\n");

mkdirSync(dirname(DEST), { recursive: true });
writeFileSync(DEST, dataModule, "utf8");
console.log(`Wrote ${DEST} (${(dataModule.length / 1024).toFixed(1)} KB, ${arrayLines.length} lines of array)`);

// Now rewrite the page to remove the interface + array and dynamic-import them.
const pageHeader = [
  'import { useState, useMemo, useEffect } from "react";',
  'import { useLocation } from "react-router-dom";',
  'import DashboardLayout from "@/components/feature/DashboardLayout";',
  'import type { GrammarPattern } from "@/data/grammarPatterns";',
  "",
].join("\n");

// Everything from line 10283 onward (file line 10284: `const LEVELS = ...`)
const tail = lines.slice(10283).join("\n");

const newPage = pageHeader + "\n" + tail;
writeFileSync(SRC, newPage, "utf8");
console.log(`Rewrote ${SRC} (${(newPage.length / 1024).toFixed(1)} KB)`);
