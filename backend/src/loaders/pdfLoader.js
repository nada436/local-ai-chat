// loaders/pdfLoader.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Isolates "how do I turn a PDF file on disk into plain text" from everything
// else. If tomorrow you want to support .docx or .txt uploads too, you add a
// sibling loader here — nothing in rag.service.js has to change.
// -----------------------------------------------------------------------------
import fs from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts text from a PDF, page by page, so we can attach a real page
 * number to every chunk later (crucial for citing "source: file.pdf, p.4").
 * @param {string} filePath - absolute path to the uploaded PDF
 * @returns {Promise<{fullText: string, pages: {pageNumber: number, text: string}[], numPages: number}>}
 */
export async function loadPdf(filePath) {
  const buffer = await fs.readFile(filePath);

  // pdf-parse gives us the whole text plus a way to hook into per-page
  // rendering via `pagerender`, which is how we recover page boundaries.
  const pages = [];
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const text = textContent.items.map((i) => i.str).join(' ');
      pages.push({ pageNumber: pages.length + 1, text });
      return text;
    },
  };

  const data = await pdfParse(buffer, options);

  return {
    fullText: data.text,
    pages,
    numPages: data.numpages,
  };
}
