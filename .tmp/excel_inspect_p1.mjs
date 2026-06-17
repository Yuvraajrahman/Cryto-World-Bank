import ExcelJS from "exceljs";

const xlsxPath =
  "/Users/yuvraj/development/Cryto-World-Bank/Documentation/Previous plans/recalled .tex/Untitled spreadsheet.xlsx";

function cellToString(v) {
  if (v == null) return "";
  if (typeof v === "object") {
    if (v.text) return String(v.text);
    if (v.richText) return v.richText.map((x) => x.text).join("");
    if (v.result != null) return String(v.result);
    if (v.formula) return `=${v.formula}`;
  }
  return String(v);
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);

  console.log(
    JSON.stringify(
      {
        sheets: wb.worksheets.map((ws) => ({
          name: ws.name,
          rowCount: ws.rowCount,
          columnCount: ws.columnCount,
        })),
      },
      null,
      2,
    ),
  );

  for (const ws of wb.worksheets.slice(0, 5)) {
    console.log(`\n=== SHEET: ${ws.name} ===`);
    const maxRow = Math.min(30, ws.rowCount || 30);
    const maxCol = Math.min(12, ws.columnCount || 12);
    for (let r = 1; r <= maxRow; r++) {
      const row = ws.getRow(r);
      const vals = [];
      for (let c = 1; c <= maxCol; c++) {
        vals.push(cellToString(row.getCell(c).value).replace(/\s+/g, " ").trim());
      }
      if (vals.join("").length === 0) continue;
      console.log(`${String(r).padStart(2, "0")}: ${vals.join(" | ")}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

