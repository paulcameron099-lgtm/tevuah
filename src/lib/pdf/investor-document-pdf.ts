import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

type DocumentPdfOptions = {
  documentLabel: string;
  title: string;
  subtitle?: string | null;
  investorName: string;
  reference: string;
  effectiveDate: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
  notes?: string[];
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

const MARGIN = 48;

const HEADER_HEIGHT = 122;
const CONTENT_TOP = PAGE_HEIGHT - 157;

/*
 * Everything below this Y value is reserved for the footer.
 *
 * Content is never allowed to enter this region.
 */
const FOOTER_LINE_Y = 66;
const FOOTER_TEXT_Y = 42;
const CONTENT_BOTTOM = 92;

const COLORS = {
  forest: rgb(0.075, 0.165, 0.125),
  forestSoft: rgb(0.15, 0.26, 0.21),
  gold: rgb(0.68, 0.51, 0.2),
  stone: rgb(0.37, 0.35, 0.32),
  stoneLight: rgb(0.62, 0.60, 0.56),
  border: rgb(0.88, 0.87, 0.84),
  ivory: rgb(0.975, 0.965, 0.93),
  white: rgb(1, 1, 1),
};

type Context = {
  pdf: PDFDocument;
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  y: number;
  pageNumber: number;
};

export async function buildInvestorDocumentPdf(
  options: DocumentPdfOptions,
) {
  const pdf = await PDFDocument.create();

  const regular = await pdf.embedFont(
    StandardFonts.Helvetica,
  );

  const bold = await pdf.embedFont(
    StandardFonts.HelveticaBold,
  );

  const page = pdf.addPage([
    PAGE_WIDTH,
    PAGE_HEIGHT,
  ]);

  const ctx: Context = {
    pdf,
    page,
    regular,
    bold,
    y: PAGE_HEIGHT - MARGIN,
    pageNumber: 1,
  };

  drawBrandHeader(
    ctx,
    options.documentLabel,
  );

  ctx.y = CONTENT_TOP;

  /*
   * ==========================================================
   * DOCUMENT TITLE
   * ==========================================================
   */

  drawWrappedText(
    ctx,
    options.title,
    {
      size: 22,
      bold: true,
      color: COLORS.forest,
      maxWidth:
        PAGE_WIDTH -
        MARGIN * 2,
      lineHeight: 27,
    },
  );

  if (options.subtitle) {
    ctx.y -= 5;

    drawWrappedText(
      ctx,
      options.subtitle,
      {
        size: 10,
        color: COLORS.stone,
        maxWidth:
          PAGE_WIDTH -
          MARGIN * 2,
        lineHeight: 15,
      },
    );
  }

  ctx.y -= 18;

  /*
   * ==========================================================
   * DOCUMENT META
   * ==========================================================
   */

  ensureSpace(
    ctx,
    84 + 28,
    options.documentLabel,
  );

  drawMetaBox(
    ctx,
    [
      {
        label: "Investor",
        value:
          options.investorName,
      },
      {
        label: "Reference",
        value:
          options.reference,
      },
      {
        label:
          "Effective date",
        value:
          options.effectiveDate,
      },
    ],
  );

  ctx.y -= 28;

  /*
   * ==========================================================
   * DETAILS
   * ==========================================================
   */

  ensureSpace(
    ctx,
    40,
    options.documentLabel,
  );

  drawSectionLabel(
    ctx,
    "DOCUMENT DETAILS",
  );

  ctx.y -= 20;

  for (
    const row of
    options.rows
  ) {
    drawDetailRow(
      ctx,
      row.label,
      row.value,
      options.documentLabel,
    );
  }

  /*
   * ==========================================================
   * NOTES
   * ==========================================================
   */

  if (
    options.notes?.length
  ) {
    ctx.y -= 20;

    ensureSpace(
      ctx,
      40,
      options.documentLabel,
    );

    drawSectionLabel(
      ctx,
      "IMPORTANT INFORMATION",
    );

    ctx.y -= 18;

    for (
      const note of
      options.notes
    ) {
      drawNote(
        ctx,
        note,
        options.documentLabel,
      );

      ctx.y -= 5;
    }
  }

  /*
   * Footer is drawn on every page only after all content has
   * been laid out.
   */
  const pages =
    pdf.getPages();

  pages.forEach(
    (
      pdfPage,
      index,
    ) => {
      drawFooter(
        {
          ...ctx,
          page:
            pdfPage,
          pageNumber:
            index + 1,
        },
        index + 1,
        pages.length,
      );
    },
  );

  const bytes =
    await pdf.save();

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset +
      bytes.byteLength,
  ) as ArrayBuffer;
}

/*
 * ============================================================
 * PAGE STRUCTURE
 * ============================================================
 */

function addContinuationPage(
  ctx: Context,
  documentLabel: string,
) {
  ctx.page =
    ctx.pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  ctx.pageNumber += 1;

  drawContinuationHeader(
    ctx,
    documentLabel,
  );

  ctx.y =
    PAGE_HEIGHT -
    92;
}

function ensureSpace(
  ctx: Context,
  requiredHeight: number,
  documentLabel: string,
) {
  if (
    ctx.y -
      requiredHeight >=
    CONTENT_BOTTOM
  ) {
    return;
  }

  addContinuationPage(
    ctx,
    documentLabel,
  );
}

function drawBrandHeader(
  ctx: Context,
  documentLabel: string,
) {
  ctx.page.drawRectangle({
    x: 0,
    y:
      PAGE_HEIGHT -
      HEADER_HEIGHT,
    width:
      PAGE_WIDTH,
    height:
      HEADER_HEIGHT,
    color:
      COLORS.forest,
  });

  drawText(
    ctx,
    "TEVUAH RESERVE",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        52,
      size: 11,
      bold: true,
      color:
        COLORS.gold,
    },
  );

  drawText(
    ctx,
    documentLabel.toUpperCase(),
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        83,
      size: 21,
      bold: true,
      color:
        COLORS.white,
    },
  );

  drawText(
    ctx,
    "Investor Records & Reporting",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        104,
      size: 9,
      color:
        rgb(
          0.78,
          0.82,
          0.79,
        ),
    },
  );
}

function drawContinuationHeader(
  ctx: Context,
  documentLabel: string,
) {
  drawText(
    ctx,
    "TEVUAH RESERVE",
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        48,
      size: 10,
      bold: true,
      color:
        COLORS.gold,
    },
  );

  drawText(
    ctx,
    documentLabel.toUpperCase(),
    {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        67,
      size: 8,
      bold: true,
      color:
        COLORS.forest,
    },
  );

  ctx.page.drawLine({
    start: {
      x: MARGIN,
      y:
        PAGE_HEIGHT -
        77,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y:
        PAGE_HEIGHT -
        77,
    },
    thickness: 0.8,
    color:
      COLORS.border,
  });
}

function drawFooter(
  ctx: Context,
  pageNumber: number,
  totalPages: number,
) {
  ctx.page.drawLine({
    start: {
      x: MARGIN,
      y:
        FOOTER_LINE_Y,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y:
        FOOTER_LINE_Y,
    },
    thickness: 0.8,
    color:
      COLORS.border,
  });

  drawText(
    ctx,
    "Tevuah Reserve - Confidential Investor Record",
    {
      x: MARGIN,
      y:
        FOOTER_TEXT_Y,
      size: 7.5,
      color:
        COLORS.stoneLight,
    },
  );

  const pageLabel =
    `Page ${pageNumber} of ${totalPages}`;

  const pageLabelWidth =
    ctx.regular.widthOfTextAtSize(
      pageLabel,
      7.5,
    );

  drawText(
    ctx,
    pageLabel,
    {
      x:
        PAGE_WIDTH -
        MARGIN -
        pageLabelWidth,
      y:
        FOOTER_TEXT_Y,
      size: 7.5,
      color:
        COLORS.stoneLight,
    },
  );
}

/*
 * ============================================================
 * META
 * ============================================================
 */

function drawMetaBox(
  ctx: Context,
  rows: Array<{
    label: string;
    value: string;
  }>,
) {
  const boxHeight = 84;

  ctx.page.drawRectangle({
    x: MARGIN,
    y:
      ctx.y -
      boxHeight,
    width:
      PAGE_WIDTH -
      MARGIN * 2,
    height:
      boxHeight,
    color:
      COLORS.ivory,
    borderColor:
      COLORS.border,
    borderWidth: 0.8,
  });

  const columnWidth =
    (
      PAGE_WIDTH -
      MARGIN * 2
    ) /
    rows.length;

  rows.forEach(
    (
      row,
      index,
    ) => {
      const x =
        MARGIN +
        index *
          columnWidth +
        16;

      drawText(
        ctx,
        row.label.toUpperCase(),
        {
          x,
          y:
            ctx.y -
            26,
          size: 7.5,
          bold: true,
          color:
            COLORS.stoneLight,
        },
      );

      drawWrappedTextAt(
        ctx,
        row.value,
        {
          x,
          y:
            ctx.y -
            46,
          size: 9.5,
          bold: true,
          color:
            COLORS.forest,
          maxWidth:
            columnWidth -
            30,
          lineHeight: 12,
        },
      );
    },
  );

  ctx.y -=
    boxHeight;
}

/*
 * ============================================================
 * DETAIL ROWS
 * ============================================================
 */

function drawDetailRow(
  ctx: Context,
  label: string,
  value: string,
  documentLabel: string,
) {
  const leftWidth = 165;

  const valueWidth =
    PAGE_WIDTH -
    MARGIN * 2 -
    leftWidth;

  const lines =
    wrapText(
      value,
      ctx.regular,
      10,
      valueWidth,
    );

  const consumed =
    Math.max(
      32,
      lines.length *
        14 +
        14,
    );

  /*
   * We calculate row height before drawing anything.
   * This prevents a row from being split across pages and
   * prevents its separator from entering the footer.
   */
  ensureSpace(
    ctx,
    consumed,
    documentLabel,
  );

  const rowTop =
    ctx.y;

  drawText(
    ctx,
    label,
    {
      x: MARGIN,
      y:
        rowTop -
        2,
      size: 9,
      bold: true,
      color:
        COLORS.stone,
    },
  );

  lines.forEach(
    (
      line,
      index,
    ) => {
      drawText(
        ctx,
        line,
        {
          x:
            MARGIN +
            leftWidth,
          y:
            rowTop -
            2 -
            index * 14,
          size: 10,
          color:
            COLORS.forest,
        },
      );
    },
  );

  const separatorY =
    rowTop -
    consumed +
    8;

  ctx.page.drawLine({
    start: {
      x: MARGIN,
      y:
        separatorY,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y:
        separatorY,
    },
    thickness: 0.6,
    color:
      COLORS.border,
  });

  ctx.y -=
    consumed;
}

/*
 * ============================================================
 * NOTES
 * ============================================================
 */

function drawNote(
  ctx: Context,
  note: string,
  documentLabel: string,
) {
  const value =
    `- ${note}`;

  const lines =
    wrapText(
      value,
      ctx.regular,
      9,
      PAGE_WIDTH -
        MARGIN * 2,
    );

  const requiredHeight =
    lines.length *
      14 +
    4;

  ensureSpace(
    ctx,
    requiredHeight,
    documentLabel,
  );

  for (
    const line of
    lines
  ) {
    drawText(
      ctx,
      line,
      {
        x: MARGIN,
        y: ctx.y,
        size: 9,
        color:
          COLORS.stone,
      },
    );

    ctx.y -= 14;
  }
}

function drawSectionLabel(
  ctx: Context,
  value: string,
) {
  drawText(
    ctx,
    value,
    {
      x: MARGIN,
      y: ctx.y,
      size: 9,
      bold: true,
      color:
        COLORS.gold,
    },
  );
}

/*
 * ============================================================
 * WRAPPED TEXT
 * ============================================================
 */

function drawWrappedText(
  ctx: Context,
  value: string,
  options: {
    size: number;
    bold?: boolean;
    color: ReturnType<
      typeof rgb
    >;
    maxWidth: number;
    lineHeight: number;
  },
) {
  const font =
    options.bold
      ? ctx.bold
      : ctx.regular;

  const lines =
    wrapText(
      value,
      font,
      options.size,
      options.maxWidth,
    );

  for (
    const line of
    lines
  ) {
    drawText(
      ctx,
      line,
      {
        x: MARGIN,
        y: ctx.y,
        size:
          options.size,
        bold:
          options.bold,
        color:
          options.color,
      },
    );

    ctx.y -=
      options.lineHeight;
  }
}

function drawWrappedTextAt(
  ctx: Context,
  value: string,
  options: {
    x: number;
    y: number;
    size: number;
    bold?: boolean;
    color: ReturnType<
      typeof rgb
    >;
    maxWidth: number;
    lineHeight: number;
  },
) {
  const font =
    options.bold
      ? ctx.bold
      : ctx.regular;

  const lines =
    wrapText(
      value,
      font,
      options.size,
      options.maxWidth,
    );

  lines.forEach(
    (
      line,
      index,
    ) => {
      drawText(
        ctx,
        line,
        {
          x:
            options.x,
          y:
            options.y -
            index *
              options.lineHeight,
          size:
            options.size,
          bold:
            options.bold,
          color:
            options.color,
        },
      );
    },
  );
}

function drawText(
  ctx: Context,
  value: string,
  options: {
    x: number;
    y: number;
    size: number;
    bold?: boolean;
    color: ReturnType<
      typeof rgb
    >;
  },
) {
  ctx.page.drawText(
    sanitizePdfText(
      value,
    ),
    {
      x:
        options.x,
      y:
        options.y,
      size:
        options.size,
      font:
        options.bold
          ? ctx.bold
          : ctx.regular,
      color:
        options.color,
    },
  );
}

function wrapText(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const clean =
    sanitizePdfText(
      value,
    );

  const words =
    clean.split(
      /\s+/,
    );

  const lines:
    string[] = [];

  let current = "";

  for (
    const word of
    words
  ) {
    /*
     * Long UUIDs, transaction hashes and references do not
     * contain spaces. Break them safely instead of allowing
     * them to run outside the document.
     */
    if (
      font.widthOfTextAtSize(
        word,
        size,
      ) > maxWidth
    ) {
      if (current) {
        lines.push(
          current,
        );

        current = "";
      }

      const chunks =
        breakLongWord(
          word,
          font,
          size,
          maxWidth,
        );

      lines.push(
        ...chunks,
      );

      continue;
    }

    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      font.widthOfTextAtSize(
        candidate,
        size,
      ) <= maxWidth
    ) {
      current =
        candidate;
    } else {
      if (current) {
        lines.push(
          current,
        );
      }

      current =
        word;
    }
  }

  if (current) {
    lines.push(
      current,
    );
  }

  return lines.length
    ? lines
    : [""];
}

function breakLongWord(
  word: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const chunks:
    string[] = [];

  let current = "";

  for (
    const character of
    word
  ) {
    const candidate =
      current +
      character;

    if (
      current &&
      font.widthOfTextAtSize(
        candidate,
        size,
      ) > maxWidth
    ) {
      chunks.push(
        current,
      );

      current =
        character;
    } else {
      current =
        candidate;
    }
  }

  if (current) {
    chunks.push(
      current,
    );
  }

  return chunks;
}

function sanitizePdfText(
  value: string,
) {
  return String(
    value ?? "",
  )
    .replaceAll(
      "—",
      "-",
    )
    .replaceAll(
      "–",
      "-",
    )
    .replaceAll(
      "’",
      "'",
    )
    .replaceAll(
      "“",
      '"',
    )
    .replaceAll(
      "”",
      '"',
    );
}

export function formatDocumentMoney(
  cents:
    number |
    null |
    undefined,
  currency =
    "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency,
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    },
  ).format(
    Number(
      cents ?? 0,
    ) / 100,
  );
}

export function formatDocumentDate(
  value:
    string |
    null |
    undefined,
) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",
      month:
        "long",
      day:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

export function safePdfFileName(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}