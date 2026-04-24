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
const PAGE_W    = 12240;
const PAGE_H    = 15840;
const MARGIN    = 600;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Border presets ──────────────────────────────────────────────────────────
const B_NONE   = { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" } as const;
const B_SINGLE = { style: BorderStyle.SINGLE, size: 1, color: "000000" } as const;
const ALL_BORDERS = { top: B_SINGLE, bottom: B_SINGLE, left: B_SINGLE, right: B_SINGLE };
const NO_BORDERS  = { top: B_NONE,   bottom: B_NONE,   left: B_NONE,   right: B_NONE   };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fontFor(text: string) {
  return /[\u0900-\u097F]/.test(text) ? "Arial" : "Arial";
}

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

const BLOCK_TAGS = new Set(["p", "figure", "div", "table", "thead", "tbody", "tr", "td", "th", "ol", "ul", "li"]);

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
      if (BLOCK_TAGS.has(tag)) continue;
      if (tag === "br") {
        runs.push(new TextRun({ text: "", break: 1 }));
      } else {
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

function makeParagraph(
  runs: TextRun[],
  size = 16,
  alignment?: Alignment,
  spacingAfter = 0,
): Paragraph {
  return new Paragraph({
    children: runs.length ? runs : [new TextRun({ text: " ", size })],
    alignment,
    spacing: { before: 0, after: spacingAfter, line: 240, lineRule: "auto" as any },
  });
}

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
    if (child.nodeType === 3) {
      const text = (child.textContent ?? "").trim();
      if (text) pending.push(makeRun(text, size, bold));
      continue;
    }

    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();

    if (tag === "br") {
      pending.push(new TextRun({ text: "", break: 1 }));

    } else if (tag === "p") {
      flush();
      const runs = collectRuns(child, size, bold);
      if (runs.length) result.push(makeParagraph(runs, size, alignment));

    } else if (tag === "figure" && child.classList.contains("image")) {
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
      flush();
      const nested = await buildTable(child, -1);
      if (nested) result.push(nested);

    } else {
      pending.push(...collectRuns(child, size, bold));
    }
  }

  flush();
  if (!result.length) result.push(makeParagraph([], size));
  return result;
}

interface TableConfig {
  fontSize:       number;
  borders:        typeof ALL_BORDERS | typeof NO_BORDERS;
  borderStyle:    "all" | "none" | "top-bottom-only";
  alignment:      Alignment;
  colAlignments?: Alignment[]; // Per-column alignment override
  margins:        { top: number; bottom: number; left: number; right: number };
  boldHeaders:    boolean;
  headerShading:  boolean;
  headerRowHeight?: number; // Header row height in twips
  dataRowHeight?: number;   // Data row height in twips
}

function getTableConfig(figIndex: number): TableConfig {
  if (figIndex === 0) return {
    fontSize: 20, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.LEFT,
    margins: { top: 21, bottom: 20, left: 40, right: 40 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 1) return {
    fontSize: 18, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.LEFT,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 2) return {
    fontSize: 21, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    colAlignments: [ // Column 1, 2, 3 (first 3 cols: LEFT, CENTER, LEFT)
      AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.LEFT
    ],
    boldHeaders: true, headerShading: false,
  };
  if (figIndex === 3) return {
    fontSize: 15, borders: NO_BORDERS, borderStyle: "top-bottom-only",
    alignment: AlignmentType.CENTER,
    margins: { top: 20, bottom: 20, left: 15, right: 15 },
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 4 || figIndex === 10) return {
    fontSize: 17, borders: NO_BORDERS, borderStyle: "top-bottom-only",
    alignment: AlignmentType.CENTER,
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    boldHeaders: true, headerShading: false,
  };
  if (figIndex === 5) return {
    fontSize: 20, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.LEFT,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    boldHeaders: true, headerShading: false,
  };
  if (figIndex === 6) return {
    fontSize: 21, borders: NO_BORDERS, borderStyle: "none",
    alignment: AlignmentType.CENTER,
    margins: { top: 20, bottom: 20, left: 40, right: 40 },
    colAlignments: [ // Column 1, 2, 3: LEFT, CENTER, LEFT
      AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.LEFT
    ],
    boldHeaders: false, headerShading: false,
  };
  if (figIndex === 7) return {
    fontSize: 20, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.LEFT,
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    boldHeaders: false, headerShading: false,
    headerRowHeight: 800, // Increase header row height
    dataRowHeight: 1400,   // Increase data row height
  };
  if (figIndex === 8) return {
    fontSize: 16, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.CENTER,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    boldHeaders: true, headerShading: true,
  };
  return {
    fontSize: 16, borders: ALL_BORDERS, borderStyle: "all",
    alignment: AlignmentType.LEFT,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    boldHeaders: false, headerShading: false,
  };
}

function getColWidths(figIndex: number, colCount: number): number[] {
  if (figIndex === 0 && colCount === 3) {
    return [Math.round(CONTENT_W * 0.30), Math.round(CONTENT_W * 0.30), Math.round(CONTENT_W * 0.40)];
  }
  if (figIndex === 1 && colCount === 3) {
    return [Math.round(CONTENT_W * 0.35), Math.round(CONTENT_W * 0.35), Math.round(CONTENT_W * 0.30)];
  }
  if (figIndex === 2 && colCount === 3) {
    return [Math.round(CONTENT_W * 0.25), Math.round(CONTENT_W * 0.50), Math.round(CONTENT_W * 0.25)];
  }
  if (figIndex === 3 && colCount === 9) {
    return [600, 3800, 750, 800, 800, 1300, 800, 1950, 440];
  }
  if ((figIndex === 4 || figIndex === 10) && colCount >= 9) {
    const base = [550, 3340, 750, 950, 950, 1450, 1000, 1450, 800];
    if (colCount === 10) base.push(0);
    return base.slice(0, colCount);
  }
  if (figIndex === 6 && colCount === 3) {
    return [Math.round(CONTENT_W * 0.25), Math.round(CONTENT_W * 0.50), Math.round(CONTENT_W * 0.25)];
  }
  if (figIndex === 8) {
    const base = [650, 3140, 550, 750, 1050, 1050, 1550, 1050, 750, 700];
    return base.slice(0, colCount);
  }
  const per  = Math.floor(CONTENT_W / colCount);
  const cols = Array<number>(colCount).fill(per);
  cols[colCount - 1] += CONTENT_W - per * colCount;
  return cols;
}

async function buildTable(figureNode: any, figIndex: number): Promise<Table | null> {
  const tableNode = figureNode.querySelector("table");
  if (!tableNode) return null;

  const rows: any[] = Array.from(tableNode.querySelectorAll("tr"));
  if (!rows.length) return null;

  const cfg = getTableConfig(figIndex);

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

          // For table 7, column 4 (index 3) should be empty/gap
          if (figIndex === 7 && ci === 3) {
            return new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "", size: 19 })] })],
              borders: { top: B_NONE, bottom: B_NONE, left: B_NONE, right: B_NONE },
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              width: { size: 150, type: WidthType.DXA },  // Small gap width
              verticalAlign: VerticalAlign.TOP,
            });
          }

          let cellWidth = 0;
          let startColIdx = 0;
          for (let i = 0; i < ci; i++) {
            startColIdx += parseInt(cells[i].getAttribute("colspan") || "1", 10);
          }
          for (let i = 0; i < colspan; i++) {
            cellWidth += colWidths[startColIdx + i] || 500;
          }

          let borders: any;
          if (cfg.borderStyle === "top-bottom-only") {
            borders = {
              top:    rowIndex === 0               ? B_SINGLE : B_NONE,
              bottom: rowIndex === rows.length - 1 ? B_SINGLE : B_NONE,
              left:   B_NONE,
              right:  B_NONE,
            };
          } else {
            borders = cfg.borders;
          }

          // Determine alignment: use per-column if defined, otherwise use default
          const cellAlignment = cfg.colAlignments 
            ? (cfg.colAlignments[startColIdx] || cfg.alignment)
            : cfg.alignment;

          return new TableCell({
            children: await buildCellContent(
              cell, cfg.fontSize, isHeader && cfg.boldHeaders, cellAlignment,
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

      return new TableRow({ 
        children: docxCells,
        height: rowIndex === 0 && cfg.headerRowHeight 
          ? { value: cfg.headerRowHeight, rule: "atLeast" }
          : rowIndex > 0 && cfg.dataRowHeight
          ? { value: cfg.dataRowHeight, rule: "atLeast" }
          : undefined,
      });
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
  let figIdx = 0;
  let olIndex = 0;  // Track which <ol> we're in for unique numbering

  async function walk(node: any): Promise<void> {
    if (!node) return;

    if (node.nodeType === 3) {
      const text = (node.textContent ?? "").trim();
      if (text) out.push(makeParagraph([makeRun(text, 19)], 19, undefined, 40));
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();

    // ── <p> ──────────────────────────────────────────────────────────────────
    // Convert &nbsp;-only paragraphs to spacing (don't skip them!)
    // This preserves the vertical spacing from your HTML
    if (tag === "p") {
      const rawText = node.textContent ?? "";
      const isBlank = rawText.replace(/\u00a0/g, "").trim() === "";
      
      if (isBlank) {
        // Count &nbsp; entities to calculate spacing
        const nbspCount = (node.textContent?.match(/\u00a0/g) ?? []).length;
        const spacingAmount = Math.max(nbspCount * 15, 20); // Each &nbsp; = 15 DXA
        out.push(makeParagraph([], 20, undefined, spacingAmount));
      } else {
        out.push(makeParagraph(collectRuns(node, 20), 20, undefined, 40));
      }
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
      const currentOlIndex = olIndex++;  // Get unique index for this ol
      for (const li of node.querySelectorAll(":scope > li")) {
        // Collect ALL inline runs including from nested <p> tags
        const allRuns: TextRun[] = [];
        let hasTables = false;
        const tablesToAdd: any[] = [];
        let fullText = "";  // Track text separately since TextRun.text is not accessible

        for (const child of li.childNodes) {
          if (child.nodeType === 3) {
            // Text node
            const text = (child.textContent ?? "");
            if (text.trim()) {
              allRuns.push(makeRun(text, 18.5));
              fullText += text;
            }
          } else if (child.nodeType === 1) {
            const ct = child.tagName.toLowerCase();
            if (ct === "br") {
              // ✅ FIX: Direct <br> inside <li> — insert line break
              allRuns.push(new TextRun({ text: "", break: 1 }));
            } else if (ct === "p") {
              // Include <p> content inline (don't create new paragraph)
              allRuns.push(...collectRuns(child, 19.5));
              fullText += (child.textContent ?? "").trim();
            } else if (ct === "figure" && child.classList.contains("table")) {
              hasTables = true;
              const table = await buildTable(child, figIdx++);
              if (table) tablesToAdd.push(table);
            } else {
              const isBold = ct === "strong" || ct === "b";
              const isItalic = ct === "em" || ct === "i";
              const isUnderline = ct === "u";
              allRuns.push(...collectRuns(child, 19.5, isBold, isItalic, isUnderline));
              fullText += (child.textContent ?? "").trim();
            }
          }
        }

        // Check if text already starts with a number (e.g., "12.", "13.")
        const hasExistingNumber = /^\d+\./.test(fullText.trim());

        // Use unique numbering reference for each ol (numbering-ordered-0, numbering-ordered-1, etc.)
        const numberingRef = hasExistingNumber ? undefined : `numbering-ordered-${currentOlIndex}`;

        // Add paragraph - with or without numbering depending on existing numbers
        out.push(new Paragraph({
          numbering: numberingRef ? { reference: numberingRef, level: 0 } : undefined,
          children:  allRuns.length
                       ? allRuns
                       : [new TextRun({ text: " ", size: 19.5 })],
          spacing:   { after: 40 },
        }));

        // Add any tables after the paragraph
        for (const table of tablesToAdd) {
          out.push(table);
        }
      }
      return;
    }

    // <ul>
    if (tag === "ul") {
      for (const li of node.querySelectorAll(":scope > li")) {
        out.push(new Paragraph({
          numbering: { reference: "numbering-bullets", level: 0 },
          children:  [new TextRun({ text: li.textContent.trim(), size: 20 })],
          spacing:   { after: 40 },
        }));
      }
      return;
    }

    // ── BLANK PAGE ────────────────────────────────────────────────────────────
    // The frontend collapses 16+ consecutive &nbsp; paragraphs into:
    //   <div class="page-break"></div>
    //
    // To produce a genuine BLANK PAGE in Word we need TWO PageBreak paragraphs:
    //
    //   [Letter content]
    //       ↓ PageBreak 1  →  cursor jumps to a new page
    //   [blank page — nothing printed here]
    //       ↓ PageBreak 2  →  cursor jumps to another new page
    //   [Inspection Note content starts here at TOP]
    //
    if (tag === "div" && node.classList.contains("page-break")) {
      // First page break moves to next page
      out.push(new Paragraph({ 
        children: [new PageBreak()], 
        spacing: { before: 0, after: 0 } 
      }));
      // Second page break creates blank page and moves to next page
      out.push(new Paragraph({ 
        children: [new PageBreak()], 
        spacing: { before: 0, after: 0 } 
      }));
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

    // Count how many <ol> elements exist in the HTML
    const tempBody = new JSDOM(html).window.document.body;
    const olCount = tempBody.querySelectorAll("ol").length;

    // Generate numbering config for each <ol>
    const numberingConfigs = [];
    for (let i = 0; i < olCount; i++) {
      numberingConfigs.push({
        reference: `numbering-ordered-${i}`,
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      });
    }

    // Always add bullets config
    numberingConfigs.push({
      reference: "numbering-bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    });

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
        config: numberingConfigs,
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