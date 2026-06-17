import fs from "node:fs/promises";
import ExcelJS from "exceljs";

const INPUT_TXT =
  "/Users/yuvraj/development/Cryto-World-Bank/Documentation/Previous plans/recalled .tex/comparison of compliance.txt";
const OUTPUT_XLSX =
  "/Users/yuvraj/development/Cryto-World-Bank/Documentation/Previous plans/recalled .tex/comparison of compliance.xlsx";

function parseChecklist(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  let section = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }
    if (line.startsWith("- ")) {
      const rest = line.slice(2).trim();
      const statusSymbol = rest[0];
      const item = rest.slice(1).trim();
      let status = "Unknown";
      if (statusSymbol === "✓") status = "Compliant";
      else if (statusSymbol === "~") status = "Partial";
      else if (statusSymbol === "✗") status = "Missing";
      rows.push({ section, item, statusSymbol, status });
    }
  }
  return rows;
}

function headerStyle(cell) {
  cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "FFBFBFBF" } },
    left: { style: "thin", color: { argb: "FFBFBFBF" } },
    bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
    right: { style: "thin", color: { argb: "FFBFBFBF" } },
  };
}

function bodyStyle(cell) {
  cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } },
  };
}

function statusFill(status) {
  if (status === "Compliant") return "FFDCFCE7"; // green-100
  if (status === "Partial") return "FFFEF9C3"; // yellow-100
  if (status === "Missing") return "FFFEE2E2"; // red-100
  return "FFFFFFFF";
}

async function main() {
  const text = await fs.readFile(INPUT_TXT, "utf8");
  const data = parseChecklist(text);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Cryto-World-Bank";

  const ws = wb.addWorksheet("Compliance Table");

  ws.mergeCells("A1:D1");
  ws.getCell("A1").value = "Compliance checklist table (from comparison of compliance.txt)";
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF111827" } };
  ws.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };

  ws.mergeCells("A2:D2");
  ws.getCell("A2").value = "Legend: ✓ Compliant   ~ Partial   ✗ Missing";
  ws.getCell("A2").font = { italic: true, color: { argb: "FF4B5563" } };
  ws.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };

  ws.addRow([]);

  const headerRow = 4;
  const headers = ["Section", "Checklist item", "Status", "Symbol"];
  ws.getRow(headerRow).values = [null, ...headers];
  ws.getRow(headerRow).height = 22;
  for (let c = 1; c <= headers.length; c++) headerStyle(ws.getRow(headerRow).getCell(c));

  let r = headerRow + 1;
  for (const row of data) {
    ws.getCell(`A${r}`).value = row.section;
    ws.getCell(`B${r}`).value = row.item;
    ws.getCell(`C${r}`).value = row.status;
    ws.getCell(`D${r}`).value = row.statusSymbol;

    for (const col of ["A", "B", "C", "D"]) bodyStyle(ws.getCell(`${col}${r}`));
    ws.getCell(`C${r}`).alignment = { vertical: "top", horizontal: "center", wrapText: true };
    ws.getCell(`D${r}`).alignment = { vertical: "top", horizontal: "center", wrapText: true };
    ws.getCell(`C${r}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: statusFill(row.status) },
    };
    r++;
  }

  // Freeze header row
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: headerRow }];

  // Column widths
  ws.getColumn(1).width = 34;
  ws.getColumn(2).width = 70;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 10;

  // Add filters
  ws.autoFilter = { from: "A4", to: "D4" };

  await wb.xlsx.writeFile(OUTPUT_XLSX);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

