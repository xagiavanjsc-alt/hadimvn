import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "docs", "email-templates");

const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));
for (const f of files) {
  const full = path.join(dir, f);
  const content = fs.readFileSync(full, "utf8");
  const updated = content.replace(/© 2025 Hàn Quốc Ơi!/g, "© Hàn Quốc Ơi!");
  if (updated !== content) {
    fs.writeFileSync(full, updated, "utf8");
    console.log("Updated:", f);
  } else {
    console.log("No change:", f);
  }
}
