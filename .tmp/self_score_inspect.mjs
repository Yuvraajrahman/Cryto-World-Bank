import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const xlsxPath =
  "/Users/yuvraj/development/Cryto-World-Bank/Documentation/Previous plans/recalled .tex/Untitled spreadsheet.xlsx";

async function main() {
  const blob = await FileBlob.load(xlsxPath);
  const workbook = await SpreadsheetFile.importXlsx(blob);

  const sheetInspect = await workbook.inspect({
    kind: "sheet",
    include: "id,name",
    maxChars: 8000,
  });
  console.log(sheetInspect.ndjson);

  // Inspect first couple sheets' top-left areas to infer layout.
  for (const ws of workbook.worksheets.items.slice(0, 5)) {
    const name = ws.name;
    const used = ws.getUsedRange?.(true);
    let usedA1 = "A1:K40";
    if (used) {
      const addr = used.address;
      // Keep it bounded for logging.
      usedA1 = addr.split("!").at(-1) ?? usedA1;
    }
    const table = await workbook.inspect({
      kind: "table",
      sheetName: name,
      range: "A1:K40",
      include: "values,formulas",
      tableMaxRows: 40,
      tableMaxCols: 11,
      tableMaxCellChars: 120,
      maxChars: 12000,
    });
    console.log(`\n--- SHEET PREVIEW: ${name} ---\n`);
    console.log(table.ndjson);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

