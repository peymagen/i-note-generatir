import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, LevelFormat, HeadingLevel, UnderlineType, PageBreak,
} from "docx";
import { JSDOM } from "jsdom";
import https from "https";
import http from "http";

// ─── Types ───────────────────────────────────────────────────────────────────
type Alignment = typeof AlignmentType[keyof typeof AlignmentType];
type DocxChild = Paragraph | Table;

// ─── Page layout ─────────────────────────────────────────────────────────────
// 1 inch = 1440 DXA. Change MARGIN to adjust all four margins at once.
const PAGE_W    = 12240;              // 8.5 inch
const PAGE_H    = 15840;              // 11 inch
const MARGIN    = 500;                // ~0.35 inch
const CONTENT_W = PAGE_W - MARGIN * 2; // 11240 — table max width

// ─── Border presets ──────────────────────────────────────────────────────────
const B_NONE   = { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" } as const;
const B_SINGLE = { style: BorderStyle.SINGLE, size: 1, color: "000000" } as const;
const ALL_BORDERS = { top: B_SINGLE, bottom: B_SINGLE, left: B_SINGLE, right: B_SINGLE };
const NO_BORDERS  = { top: B_NONE,   bottom: B_NONE,   left: B_NONE,   right: B_NONE   };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fontFor(text: string) {
  return /[\u0900-\u097F]/.test(text) ? "Arial" : "Arial";
}

// Fetch a remote image URL and return raw bytes
async function fetchImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith("https") ? https : http;
      client.get(url, { timeout: 8000 }, (res) => {
        if (res.statusCode !== 200) return resolve(null);
        const chunks: Buffer[] = [];
        res.on("data",  (c: Buffer) => chunks.push(c));
        res.on("end",   () => resolve(Buffer.concat(chunks)));
        res.on("error", () => resolve(null));
      }).on("error", () => resolve(null));
    } catch { resolve(null); }
  });
}

function imageType(url: string): "png" | "jpg" | "gif" | "bmp" {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "gif") return "gif";
  if (ext === "bmp") return "bmp";
  return "jpg";
}

// Build one TextRun with font, size, and optional bold / italic / underline
function makeRun(
  text: string,
  size: number,
  bold = false,
  italic = false,
  underline = false,
): TextRun {
  return new TextRun({
    text,
    size,
    font: fontFor(text),
    bold,
    italics: italic,
    underline: underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

// Walk inline HTML nodes (text, <strong>, <em>, <u>, <br>) and return TextRuns.
// Does NOT enter block elements — those are handled by their callers.
function collectRuns(
  node: any,
  size: number,
  bold = false,
  italic = false,
  underline = false,
): TextRun[] {
  const runs: TextRun[] = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = child.textContent ?? "";
      if (text) runs.push(makeRun(text, size, bold, italic, underline));
    } else if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase();
      if (tag === "br") {
        runs.push(new TextRun({ text: "", break: 1 }));
      } else {
        // propagate formatting into child nodes
        runs.push(...collectRuns(
          child, size,
          bold      || tag === "strong" || tag === "b",
          italic    || tag === "em"     || tag === "i",
          underline || tag === "u",
        ));
      }
    }
  }
  return runs;
}

// Wrap runs in a Paragraph with spacing and alignment
function makeParagraph(
  runs: TextRun[],
  size = 16, // Default to 8pt (size 16)
  alignment?: Alignment,
  spacingAfter = 0,
): Paragraph {
  return new Paragraph({
    children: runs.length ? runs : [new TextRun({ text: " ", size })],
    alignment,
    spacing: { before: 0, after: spacingAfter, line: 240, lineRule: "auto" as any },
  });
}

// ─── Cell content builder ─────────────────────────────────────────────────────
// Converts the children of a <td> or <th> into an array of Paragraphs / Tables.
//
// Rules:
//   plain text / inline tags  →  collect into pendingRuns buffer
//   <br>                      →  push break:1 run (no new paragraph)
//   <p>                       →  flush buffer, make paragraph from <p> runs
//   <figure class="image">    →  flush buffer, fetch image, make ImageRun paragraph
//   <figure class="table">    →  flush buffer, build nested Table
//   anything else             →  treat as inline (collectRuns from it)
async function buildCellContent(
  cell: any,
  size: number,
  bold: boolean,
  alignment: Alignment,
): Promise<DocxChild[]> {
  const result: DocxChild[]  = [];
  let   pending: TextRun[]   = [];

  function flush() {
    if (!pending.length) return;
    result.push(makeParagraph(pending, size, alignment));
    pending = [];
  }

  for (const child of cell.childNodes) {

    // plain text node
    if (child.nodeType === 3) {
      const text = (child.textContent ?? "").trim();
      if (text) pending.push(makeRun(text, size, bold));
      continue;
    }

    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();

    if (tag === "br") {
      // line break stays inside the current paragraph
      pending.push(new TextRun({ text: "", break: 1 }));

    } else if (tag === "p") {
      // each <p> is its own paragraph
      flush();
      const runs = collectRuns(child, size, bold);
      if (runs.length) result.push(makeParagraph(runs, size, alignment));

    } else if (tag === "figure" && child.classList.contains("image")) {
      // embedded image (logo etc.)
      flush();
      const img = child.querySelector("img");
      if (img) {
        const src = img.getAttribute("src") ?? "";
        const w   = parseInt(img.getAttribute("width")  ?? "70", 10);
        const h   = parseInt(img.getAttribute("height") ?? "98", 10);
        const buf = src ? await fetchImage(src) : null;
        if (buf) {
          result.push(new Paragraph({
            children: [new ImageRun({
              type: imageType(src),
              data: buf,
              transformation: { width: w, height: h },
              altText: { title: "logo", description: "logo", name: "logo" },
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
          }));
        }
      }

    } else if (tag === "figure" && child.classList.contains("table")) {
      // nested table inside a cell
      flush();
      const nested = await buildTable(child, -1);
      if (nested) result.push(nested);

    } else {
      // everything else (span, div, strong, em, u…) — treat as inline
      pending.push(...collectRuns(child, size, bold));
    }
  }

  flush();
  if (!result.length) result.push(makeParagraph([], size)); // keep cell non-empty
  return result;
}

// ─── TABLE STYLES — one entry per table in document order ────────────────────
// figIndex 0 = first <figure class="table">, 1 = second, etc.
//
// fontSize     : half-points  (20 = 10pt · 18 = 9pt · 16 = 8pt · 13 = 6.5pt)
// borders      : ALL_BORDERS or NO_BORDERS
// borderStyle  : "all"            → borders on every cell
//                "none"           → no borders
//                "top-bottom-only"→ border only above first row and below last row
// alignment    : AlignmentType.LEFT / CENTER / RIGHT
// margins      : cell inner padding in DXA (80 ≈ 0.056 inch)
// boldHeaders  : bold text in <th> cells
// headerShading: light-blue fill on <th> cells

interface TableConfig {
  fontSize:      number;
  borders:       typeof ALL_BORDERS | typeof NO_BORDERS;
  borderStyle:   "all" | "none" | "top-bottom-only";
  alignment:     Alignment;
  margins:       { top: number; bottom: number; left: number; right: number };
  boldHeaders:   boolean;
  headerShading: boolean;
}

function getTableConfig(figIndex: number): TableConfig {
  if (figIndex === 0) return {   // Letterhead header (contact | logo | address)
    fontSize: 20, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.LEFT,
    margins: { top: 20, bottom: 20, left: 40, right: 40 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 1) return {   // Dispatch info (I-note / supply order / item)
    fontSize: 18, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.LEFT,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 2) return {   // INSPECTION NOTE header block
    fontSize: 20, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    boldHeaders: true, headerShading: false,
  };
  if (figIndex === 3) return {   // Hindi column headers (Bullet 9 top)
    fontSize: 13, borders: NO_BORDERS, borderStyle: "top-bottom-only",
    alignment: AlignmentType.CENTER,
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 4 || figIndex === 10) return {   // English column headers (Bullet 9 bottom)
    fontSize: 15, borders: NO_BORDERS, borderStyle: "top-bottom-only",
    alignment: AlignmentType.CENTER,
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    boldHeaders: true, headerShading: false,
  };
  if (figIndex === 5) return {   // Remark table (Bullet 9 finish)
    fontSize: 17, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.LEFT,
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 6) return {   // 2nd INSPECTION NOTE header (Page 2)
    fontSize: 18, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.LEFT,
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 7) return {   // Receipt cert (item / reason / amount)
    fontSize: 20, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.LEFT,
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 8) return {   // Annexure table
    fontSize: 16, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.CENTER,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    boldHeaders: true, headerShading: true,
  };
  return {                       // fallback for any extra tables
    fontSize: 16, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.LEFT,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    boldHeaders: false, headerShading: false,
  };
}

// ─── COLUMN WIDTHS — per-table column splits ──────────────────────────────────
// All values are DXA and must sum to CONTENT_W (10800).
// Add an if-block here to give any figIndex custom column widths.
function getColWidths(figIndex: number, colCount: number): number[] {
  // Letterhead (3 cols)
  if (figIndex === 0 && colCount === 3) {
    return [Math.round(CONTENT_W * 0.28), Math.round(CONTENT_W * 0.12), Math.round(CONTENT_W * 0.60)];
  }
  // Dispatch Info (3 cols)
  if (figIndex === 1 && colCount === 3) {
    return [Math.round(CONTENT_W * 0.35), Math.round(CONTENT_W * 0.35), Math.round(CONTENT_W * 0.30)];
  }
  // Hindi Headers (9 cols) - Total 11240
  if (figIndex === 3 && colCount === 9) {
    return [650, 3240, 850, 1050, 1050, 1550, 1050, 1050, 750];
  }
  // English Headers / Main Inspection Table (9 or 10 cols)
  if ((figIndex === 4 || figIndex === 10) && colCount >= 9) {
    // 1:ItemNo, 2:Desc, 3:Unit, 4:Tend, 5:Acc, 6:Brought, 7:Rej, 8:Cert, 9:Remark
    const base = [550, 3340, 750, 950, 950, 1450, 1000, 1450, 800];
    if (colCount === 10) base.push(0); // handle if 10th exists
    return base.slice(0, colCount);
  }
  // Annexure I Table (10 cols or 9 cols with one merged)
  if (figIndex === 8) {
    const base = [650, 3140, 550, 750, 1050, 1050, 1550, 1050, 750, 700];
    return base.slice(0, colCount);
  }

  // Default: equal columns
  const per  = Math.floor(CONTENT_W / colCount);
  const cols = Array<number>(colCount).fill(per);
  cols[colCount - 1] += CONTENT_W - per * colCount; // fix rounding
  return cols;
}

// ─── Build a docx Table from <figure class="table"> ──────────────────────────
async function buildTable(figureNode: any, figIndex: number): Promise<Table | null> {
  const tableNode = figureNode.querySelector("table");
  if (!tableNode) return null;

  const rows: any[] = Array.from(tableNode.querySelectorAll("tr"));
  if (!rows.length) return null;

  const cfg       = getTableConfig(figIndex);
  
  // Calculate effective column count (considering colspans in the first row)
  let colCount = 0;
  if (rows[0]) {
    const firstRowCells = Array.from(rows[0].querySelectorAll("td,th"));
    firstRowCells.forEach((c: any) => {
      colCount += parseInt(c.getAttribute("colspan") || "1", 10);
    });
  }
  if (colCount === 0) colCount = 1;

  const colWidths = getColWidths(figIndex, colCount);

  const docxRows = await Promise.all(
    rows.map(async (tr, rowIndex) => {
      const cells: any[] = Array.from(tr.querySelectorAll("td,th"));

      const docxCells = await Promise.all(
        cells.map(async (cell, ci) => {
          const isHeader = cell.tagName.toLowerCase() === "th";
          const colspan  = parseInt(cell.getAttribute("colspan") || "1", 10);
          const rowspan  = parseInt(cell.getAttribute("rowspan") || "1", 10);

          // Calculate width by summing relevant colWidths
          let cellWidth = 0;
          // Note: This logic assumes simple tables where ci maps to the starting col index.
          // For complex tables with previous colspans, we'd need a more advanced tracker.
          // But for these I-Notes, it's usually straightforward.
          let startColIdx = 0;
          for(let i=0; i<ci; i++) {
             startColIdx += parseInt(cells[i].getAttribute("colspan") || "1", 10);
          }
          for(let i=0; i<colspan; i++) {
              cellWidth += colWidths[startColIdx + i] || 500;
          }

          // determine cell borders
          let borders: any;
          if (cfg.borderStyle === "top-bottom-only") {
            borders = {
              top:   rowIndex === 0              ? B_SINGLE : B_NONE,
              bottom: rowIndex === rows.length-1 ? B_SINGLE : B_NONE,
              left:  B_NONE,
              right: B_NONE,
            };
          } else {
            borders = cfg.borders;
          }

          return new TableCell({
            children: await buildCellContent(
              cell, cfg.fontSize, isHeader && cfg.boldHeaders, cfg.alignment,
            ),
            borders,
            columnSpan: colspan > 1 ? colspan : undefined,
            rowSpan:    rowspan > 1 ? rowspan : undefined,
            shading: isHeader && cfg.headerShading
              ? { fill: "D5E8F0", type: ShadingType.CLEAR }
              : undefined,
            margins:       cfg.margins,
            width:         { size: cellWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.TOP,
          });
        })
      );

      return new TableRow({ children: docxCells });
    })
  );

  return new Table({
    width:        { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colWidths,
    rows:         docxRows,
  });
}

// ─── Parse the full HTML body into docx elements ─────────────────────────────
async function parseHTML(html: string): Promise<DocxChild[]> {
  const body = new JSDOM(html).window.document.body;
  const out: DocxChild[] = [];
  let figIdx = 0; // increments for every <figure class="table"> found

  async function walk(node: any): Promise<void> {
    if (!node) return;

    // plain text node
    if (node.nodeType === 3) {
      const text = (node.textContent ?? "").trim();
      if (text) out.push(makeParagraph([makeRun(text, 19)], 19, undefined, 40));
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();

    // <p>
    if (tag === "p") {
      out.push(makeParagraph(collectRuns(node, 19), 19, undefined, 40));
      return;
    }

    // <h1> <h2> <h3>
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const size  = tag === "h1" ? 48 : tag === "h2" ? 40 : 36;
      const level = tag === "h1" ? HeadingLevel.HEADING_1
                  : tag === "h2" ? HeadingLevel.HEADING_2
                  :                HeadingLevel.HEADING_3;
      out.push(new Paragraph({
        heading:  level,
        children: [new TextRun({ text: node.textContent, bold: true, size })],
      }));
      return;
    }

    // <figure class="table">
    if (tag === "figure" && node.classList.contains("table")) {
      const table = await buildTable(node, figIdx++);
      if (table) out.push(table);
      return;
    }

    // <ol>
    if (tag === "ol") {
      for (const li of node.querySelectorAll(":scope > li")) {
        out.push(new Paragraph({
          numbering: { reference: "numbering-ordered", level: 0 },
          children:  collectRuns(li, 19).length
                       ? collectRuns(li, 19)
                       : [new TextRun({ text: " ", size: 19 })],
          spacing:   { after: 40 },
        }));
        // block children inside the list item (nested tables, paragraphs)
        for (const child of li.childNodes) {
          if (child.nodeType !== 1) continue;
          const ct = child.tagName.toLowerCase();
          if (ct === "figure" && child.classList.contains("table")) {
            const table = await buildTable(child, figIdx++);
            if (table) out.push(table);
          } else if (ct === "p") {
            out.push(makeParagraph(collectRuns(child, 19), 19, undefined, 40));
          }
        }
      }
      return;
    }

    // <ul>
    if (tag === "ul") {
      for (const li of node.querySelectorAll(":scope > li")) {
        out.push(new Paragraph({
          numbering: { reference: "numbering-bullets", level: 0 },
          children:  [new TextRun({ text: li.textContent.trim(), size: 19 })],
          spacing:   { after: 40 },
        }));
      }
      return;
    }

    // ── SPACING BLOCK ─────────────────────────────────────────────────────────
    // Frontend sends: <div class="page-break" data-lines="44"></div>
    // data-lines = exact count of <p>&nbsp;</p> in the original HTML.
    //
    // Each &nbsp; paragraph in the browser = one blank 8pt line.
    // We emit that exact number of empty 8pt paragraphs in Word
    // so the vertical space matches the HTML 1-to-1.
    //
    // Fallback (no data-lines attribute): two PageBreaks = one blank page.
    if (tag === "div" && node.classList.contains("page-break")) {
      const lines = parseInt(node.getAttribute("data-lines") ?? "0", 10);
      if (lines > 0) {
        for (let i = 0; i < lines; i++) {
          out.push(new Paragraph({
            children: [new TextRun({ text: "", size: 16 })], // 16 half-pts = 8pt
            spacing:  { before: 0, after: 0, line: 240, lineRule: "auto" as any },
          }));
        }
      } else {
        // fallback — no count sent, produce a blank page
        out.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }));
        out.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }));
      }
      return;
    }

    // anything else — recurse into children
    for (const child of node.childNodes) await walk(child);
  }

  for (const child of body.childNodes) await walk(child);
  return out;
}

// ─── HTTP controller ──────────────────────────────────────────────────────────
export const convertToDocx = asyncHandler(async (req: Request, res: Response) => {
  const { html, filename = "document.docx" } = req.body;

  if (!html || typeof html !== "string") {
    res.status(400).json({ error: "Missing or invalid 'html' field" });
    return;
  }

  try {
    const content = await parseHTML(html);

    const doc = new Document({
      styles: {
        default: { document: { run: { font: "Arial", size: 19 } } },
        paragraphStyles: [{
          id: "ListItem", name: "List Item", basedOn: "Normal",
          run: { size: 18, font: "Arial" },
          paragraph: { spacing: { after: 20 } },
        }],
      },
      numbering: {
        config: [
          {
            reference: "numbering-ordered",
            levels: [{
              level: 0, format: LevelFormat.DECIMAL, text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
          },
          {
            reference: "numbering-bullets",
            levels: [{
              level: 0, format: LevelFormat.BULLET, text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            size:   { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        children: content,
      }],
    });

    const buffer   = await Packer.toBuffer(doc);
    const safeName = filename.endsWith(".docx") ? filename : `${filename}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.send(buffer);

  } catch (err: any) {
    console.error("DOCX error:", err);
    res.status(500).json({ error: "Failed to create DOCX", details: err.message });
  }
});