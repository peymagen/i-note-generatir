import { Request, Response } from "express";
import {
  createPage,
  getAllPages,
  getPageById,
  updatePage,
  deletePage,
} from "./page.service";

// @ts-ignore – for commonjs import libs in TS
const pdf = require("html-pdf");
// @ts-ignore
const htmlDocx = require("html-docx-js");

export const getAllPagesHandler = async (req: Request, res: Response) => {
  const pages = await getAllPages();

  res.json({
    success: true,
    data: pages,
  });
};

export const getPageByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = await getPageById(id);

  if (!page) {
    res.status(404).json({
      success: false,
      error: "Page not found",
      message: "Page not found",
    });
  }

  res.json({
    success: true,
    data: page,
  });
};

export const createPageHandler = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = Number((req.user as any)?.id);
    console.log("Creating page for user ID:", req.user);
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated or user ID not found",
      });
    }

    const page = await createPage({ title, content, userId });

    if (!page) {
      res.status(400).json({
        success: false,
        message: "Unable to create page",
      });
    }

    res.status(201).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePageHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(typeof id);
  const { title, content } = req.body;

  const page = await updatePage(id, { title, content });

  if (!page) {
    res.status(404).json({
      success: false,
      error: "Page not found",
      message: "Page not found",
    });
  }

  res.json({
    success: true,
    data: page,
  });
};

export const deletePageHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await deletePage(id);

  if (!result) {
    res.status(404).json({
      success: false,
      error: "Page not found",
      message: "Page not found",
    });
  }

  res.json({
    success: true,
    data: true,
  });
};

// In exportPagePdfHandler:
export const exportPagePdfHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = await getPageById(id);

  if (!page) {
    res.status(404).json({
      success: false,
      error: "Page not found",
      message: "Page not found",
    });
    return;
  }

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${page.title}</title>
      </head>
      <body>
        ${page.content}
      </body>
    </html>
  `;

  pdf.create(html).toBuffer((err: any, buffer: Buffer) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        error: "PDF_ERROR",
        message: "Unable to generate PDF",
      });
    }

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${page.title}.pdf"`,
      "Content-Length": buffer.length,
    });

    return res.end(buffer);
  });
};

// In exportPageDocxHandler:
export const exportPageDocxHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = await getPageById(id);

  if (!page) {
    res.status(404).json({
      success: false,
      error: "Page not found",
      message: "Page not found",
    });
    return;
  }

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${page.title}</title>
      </head>
      <body>
        ${page.content}
      </body>
    </html>
  `;

  const docxBuffer: Buffer = htmlDocx.asBuffer(html);

  res.writeHead(200, {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename="${page.title}.docx"`,
    "Content-Length": docxBuffer.length,
  });

  res.end(docxBuffer);
};
