// Script: tách data array lớn từ mocks/*.ts sang mocks/data/*.ts
// Giữ types + helpers trong file gốc, chỉ chuyển data array sang file riêng
import fs from "fs";
import path from "path";

const MOCKS_DIR = path.resolve("src/mocks");
const DATA_DIR = path.resolve("src/mocks/data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const SPLITS = [
  {
    file: "seoulTextbook.ts",
    exportName: "seoulBooks",
    typeAnnotation: "SeoulBook[]",
  },
  {
    file: "epsLessons.ts",
    exportName: "epsLessons",
    typeAnnotation: "EpsLesson[]",
  },
  {
    file: "vocabularyData.ts",
    exportName: "vocabularyData",
    typeAnnotation: "VocabItem[]",
  },
  {
    file: "hanjaData.ts",
    exportName: "HANJA_DATA",
    typeAnnotation: "HanjaEntry[]",
  },
];

for (const split of SPLITS) {
  const filePath = path.join(MOCKS_DIR, split.file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${split.file} not found`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const pattern = new RegExp(
    `export const ${split.exportName}: ${split.typeAnnotation.replace(/[[\]]/g, m => '\\' + m)} = \\[`,
  );
  const match = content.match(pattern);
  if (!match) {
    console.log(`SKIP: ${split.file} — could not find export pattern`);
    continue;
  }

  const startIdx = match.index;
  // Find the closing ]; — scan from the export line
  let bracketDepth = 0;
  let endIdx = -1;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = startIdx; i < content.length; i++) {
    const ch = content[i];

    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }

    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === "[") bracketDepth++;
    if (ch === "]") {
      bracketDepth--;
      if (bracketDepth === 0) {
        // Find the ; after ]
        let j = i + 1;
        while (j < content.length && content[j] !== ";") j++;
        endIdx = j + 1;
        break;
      }
    }
  }

  if (endIdx === -1) {
    console.log(`SKIP: ${split.file} — could not find end of array`);
    continue;
  }

  const dataPart = content.slice(startIdx, endIdx);
  const remainingPart = content.slice(0, startIdx) + content.slice(endIdx);

  // Write data file
  const dataFileName = split.exportName.replace(/([A-Z])/g, (m, i) => (i === 0 ? m.toLowerCase() : "-" + m.toLowerCase())) + "-data.ts";
  const dataFilePath = path.join(DATA_DIR, dataFileName);
  const dataFileContent = `// Auto-extracted from ${split.file}\nimport type { ${split.typeAnnotation.replace("[]", "").trim()} } from "../${split.file.replace(".ts", "")}";\n\n${dataPart.trim()}\n`;
  fs.writeFileSync(dataFilePath, dataFileContent);

  // Modify original file: remove data, add re-export
  const reExport = `// Data moved to data/${dataFileName} for code splitting\nexport { ${split.exportName} } from "./data/${dataFileName.replace(".ts", "")}";\n`;
  const newContent = remainingPart.trimEnd() + "\n\n" + reExport + "\n";
  fs.writeFileSync(filePath, newContent);

  console.log(`✓ ${split.file}: extracted ${split.exportName} → data/${dataFileName}`);
}

console.log("\nDone! Add data files to manualChunks in vite.config.ts for optimal splitting.");
