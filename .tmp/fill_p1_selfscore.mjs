import ExcelJS from "exceljs";

const xlsxPath =
  "/Users/yuvraj/development/Cryto-World-Bank/Documentation/Previous plans/recalled .tex/Untitled spreadsheet.xlsx";

const OUT_PATH = xlsxPath; // in-place update

function setHeaderStyle(cell) {
  cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "FFBFBFBF" } },
    left: { style: "thin", color: { argb: "FFBFBFBF" } },
    bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
    right: { style: "thin", color: { argb: "FFBFBFBF" } },
  };
}

function setBodyStyle(cell) {
  cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "FFE0E0E0" } },
    left: { style: "thin", color: { argb: "FFE0E0E0" } },
    bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
    right: { style: "thin", color: { argb: "FFE0E0E0" } },
  };
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);

  // Recreate the worksheet cleanly (clears merges too).
  const existing = wb.getWorksheet("Pre-Thesis 1 Self-Scoring") ?? wb.worksheets[0];
  if (existing) {
    wb.removeWorksheet(existing.id);
  }
  const ws = wb.addWorksheet("Pre-Thesis 1 Self-Scoring");

  // Title + meta
  ws.mergeCells("A1:I1");
  ws.getCell("A1").value =
    "Pre‑Thesis 1 (P1) Self‑Scoring — Thesis ID [P26101123] Pre‑Thesis 1";
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF1F2937" } };
  ws.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };

  ws.mergeCells("A2:I2");
  ws.getCell("A2").value =
    "Rubric source: Documentation/Writing format/rubics.md — P1 assesses CO1 + CO9 (2.5 + 2.5 = 5 marks)";
  ws.getCell("A2").font = { italic: true, color: { argb: "FF4B5563" } };
  ws.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };

  ws.addRow([]);

  const headerRowIdx = 4;
  const headers = [
    "CO",
    "Rubric area (P1)",
    "Section / subsection",
    "Expectation (rubric)",
    "Evidence in Pre‑Thesis 1.tex (short)",
    "Self score",
    "Max",
    "Status",
    "Notes (very short)",
  ];
  ws.getRow(headerRowIdx).values = [null, ...headers];

  for (let c = 1; c <= headers.length; c++) setHeaderStyle(ws.getRow(headerRowIdx).getCell(c));
  ws.getRow(headerRowIdx).height = 26;

  const rows = [
    // CO1 total max 2.5
    {
      co: "CO1",
      area: "Chapter 1 — Problem Formulation",
      section: "1.1 Background",
      expect: "Context and domain background for the problem",
      evidence: "Unbanked/MSME gap; settlement costs; DeFi flat pools",
      score: 0.45,
      max: 0.5,
      status: "✓",
      notes: "Strong context with citations.",
    },
    {
      co: "CO1",
      area: "Chapter 1 — Problem Formulation",
      section: "1.2 Rationale / Motivation",
      expect: "Why the problem matters; gap or opportunity",
      evidence: "Hierarchy gap + auditable reserves + decision-support ML framing",
      score: 0.47,
      max: 0.5,
      status: "✓",
      notes: "Gap and motivation are explicit.",
    },
    {
      co: "CO1",
      area: "Chapter 1 — Problem Formulation",
      section: "Problem Statement",
      expect: "Clear, scoped statement of the engineering/computing problem",
      evidence: "Enumerated inefficiencies + protocol limitations",
      score: 0.46,
      max: 0.5,
      status: "✓",
      notes: "Clear structure; minor wording polish possible.",
    },
    {
      co: "CO1",
      area: "Chapter 1 — Problem Formulation",
      section: "1.3 Objective(s)",
      expect: "Objectives aligned with the problem",
      evidence: "Objectives list: tiered architecture + ML/oracle + roadmap",
      score: 0.47,
      max: 0.5,
      status: "✓",
      notes: "Well-aligned, specific objectives.",
    },
    {
      co: "CO1",
      area: "Chapter 1 — Problem Formulation",
      section: "1.4 Methodology in Brief",
      expect: "High-level approach to solving the problem",
      evidence: "4 agile phases + stack + when ML/oracle is implemented",
      score: 0.28,
      max: 0.3,
      status: "✓",
      notes: "Appropriate for P1 (spec stage).",
    },
    {
      co: "CO1",
      area: "Chapter 1 — Problem Formulation",
      section: "1.5 Scopes & Challenges",
      expect: "Boundaries, limitations, and known difficulties",
      evidence: "In-scope/out-of-scope + risks + constraints stated",
      score: 0.19,
      max: 0.2,
      status: "✓",
      notes: "Clear boundaries for P1.",
    },

    // CO9 total max 2.5
    {
      co: "CO9",
      area: "Chapter 2 — Literature Review",
      section: "2.1 Preliminaries",
      expect: "Foundations, terminology, and concepts needed for the review",
      evidence: "Preliminaries + glossary appendix references",
      score: 0.45,
      max: 0.5,
      status: "~",
      notes: "Ensure first-use expansions in main text.",
    },
    {
      co: "CO9",
      area: "Chapter 2 — Literature Review",
      section: "2.2 Review of Existing Research",
      expect: "Survey of prior work, methods, and tools",
      evidence: "PRISMA frame + themed subsections + literature summary tables",
      score: 1.35,
      max: 1.4,
      status: "✓",
      notes: "Strong breadth and mapping to design choices.",
    },
    {
      co: "CO9",
      area: "Chapter 2 — Literature Review",
      section: "2.3 Summary of Key Findings",
      expect: "Synthesis, gaps, and link to your problem",
      evidence: "Key findings list + protocol comparison + gap statement",
      score: 0.58,
      max: 0.6,
      status: "✓",
      notes: "Could explicitly link to stated RQs later.",
    },
  ];

  let r = headerRowIdx + 1;
  for (const row of rows) {
    ws.getCell(`A${r}`).value = row.co;
    ws.getCell(`B${r}`).value = row.area;
    ws.getCell(`C${r}`).value = row.section;
    ws.getCell(`D${r}`).value = row.expect;
    ws.getCell(`E${r}`).value = row.evidence;
    ws.getCell(`F${r}`).value = row.score;
    ws.getCell(`G${r}`).value = row.max;
    ws.getCell(`H${r}`).value = row.status;
    ws.getCell(`I${r}`).value = row.notes;

    for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I"]) {
      setBodyStyle(ws.getCell(`${col}${r}`));
    }
    ws.getCell(`H${r}`).alignment = { vertical: "top", horizontal: "center" };
    ws.getCell(`F${r}`).numFmt = "0.00";
    ws.getCell(`G${r}`).numFmt = "0.00";
    r++;
  }

  // Subtotals per CO + grand total
  const firstDataRow = headerRowIdx + 1;
  const lastDataRow = r - 1;
  const subtotalFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  const subtotalBorder = {
    top: { style: "thin", color: { argb: "FFBFBFBF" } },
    left: { style: "thin", color: { argb: "FFBFBFBF" } },
    bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
    right: { style: "thin", color: { argb: "FFBFBFBF" } },
  };

  const styleSubtotalCell = (cell) => {
    cell.fill = subtotalFill;
    cell.border = subtotalBorder;
    cell.font = { bold: true };
  };

  const addSubtotalRow = (label, coValue) => {
    ws.getCell(`E${r}`).value = label;
    ws.getCell(`F${r}`).value = {
      formula: `SUMIF(A${firstDataRow}:A${lastDataRow},"${coValue}",F${firstDataRow}:F${lastDataRow})`,
    };
    ws.getCell(`G${r}`).value = {
      formula: `SUMIF(A${firstDataRow}:A${lastDataRow},"${coValue}",G${firstDataRow}:G${lastDataRow})`,
    };
    ws.getCell(`F${r}`).numFmt = "0.00";
    ws.getCell(`G${r}`).numFmt = "0.00";
    for (const col of ["E", "F", "G"]) styleSubtotalCell(ws.getCell(`${col}${r}`));
    r++;
  };

  addSubtotalRow("Subtotal (CO1)", "CO1");
  addSubtotalRow("Subtotal (CO9)", "CO9");

  ws.getCell(`E${r}`).value = "Grand Total (P1)";
  ws.getCell(`F${r}`).value = { formula: `SUM(F${r - 2}:F${r - 1})` };
  ws.getCell(`G${r}`).value = { formula: `SUM(G${r - 2}:G${r - 1})` };
  ws.getCell(`F${r}`).numFmt = "0.00";
  ws.getCell(`G${r}`).numFmt = "0.00";
  for (const col of ["E", "F", "G"]) styleSubtotalCell(ws.getCell(`${col}${r}`));
  r++;

  // Column widths
  ws.getColumn(1).width = 8; // CO
  ws.getColumn(2).width = 30; // area
  ws.getColumn(3).width = 22; // section
  ws.getColumn(4).width = 34; // expectation
  ws.getColumn(5).width = 44; // evidence
  ws.getColumn(6).width = 12; // score
  ws.getColumn(7).width = 10; // max
  ws.getColumn(8).width = 10; // status
  ws.getColumn(9).width = 44; // notes

  // Freeze header
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: headerRowIdx }];

  await wb.xlsx.writeFile(OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

