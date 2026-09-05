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
};

export async function buildInvestorDocumentPdf(
  options: DocumentPdfOptions,
) {
  const pdf =
    await PDFDocument.create();

  const regular =
    await pdf.embedFont(
      StandardFonts.Helvetica,
    );

  const bold =
    await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

  const page =
    pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  const ctx: Context = {
    pdf,
    page,
    regular,
    bold,
    y:
      PAGE_HEIGHT -
      MARGIN,
  };

  /*
   * ==================================================
   * BRAND HEADER
   * ==================================================
   */

  ctx.page.drawRectangle({
    x: 0,
    y:
      PAGE_HEIGHT -
      122,
    width:
      PAGE_WIDTH,
    height:
      122,
    color:
      COLORS.forest,
  });

  drawText(
    ctx,
    "TEVUAH RESERVE",
    {
      x:
        MARGIN,
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
    options.documentLabel.toUpperCase(),
    {
      x:
        MARGIN,
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
      x:
        MARGIN,
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

  ctx.y =
    PAGE_HEIGHT -
    157;

  /*
   * ==================================================
   * DOCUMENT TITLE
   * ==================================================
   */

  drawWrappedText(
    ctx,
    options.title,
    {
      size: 22,
      bold: true,
      color:
        COLORS.forest,
      maxWidth:
        PAGE_WIDTH -
        MARGIN * 2,
      lineHeight: 27,
    },
  );

  if (
    options.subtitle
  ) {
    ctx.y -= 5;

    drawWrappedText(
      ctx,
      options.subtitle,
      {
        size: 10,
        color:
          COLORS.stone,
        maxWidth:
          PAGE_WIDTH -
          MARGIN * 2,
        lineHeight: 15,
      },
    );
  }

  ctx.y -= 18;

  /*
   * ==================================================
   * DOCUMENT META
   * ==================================================
   */

  drawMetaBox(
    ctx,
    [
      {
        label:
          "Investor",
        value:
          options.investorName,
      },
      {
        label:
          "Reference",
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
   * ==================================================
   * DETAILS
   * ==================================================
   */

  drawText(
    ctx,
    "DOCUMENT DETAILS",
    {
      x:
        MARGIN,
      y:
        ctx.y,
      size: 9,
      bold: true,
      color:
        COLORS.gold,
    },
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
    );
  }

  if (
    options.notes?.length
  ) {
    ctx.y -= 20;

    drawText(
      ctx,
      "IMPORTANT INFORMATION",
      {
        x:
          MARGIN,
        y:
          ctx.y,
        size: 9,
        bold: true,
        color:
          COLORS.gold,
      },
    );

    ctx.y -= 18;

    for (
      const note of
        options.notes
    ) {
      drawWrappedText(
        ctx,
        `- ${note}`,
        {
          size: 9,
          color:
            COLORS.stone,
          maxWidth:
            PAGE_WIDTH -
            MARGIN * 2,
          lineHeight: 14,
        },
      );

      ctx.y -= 5;
    }
  }

  /*
   * ==================================================
   * FOOTER
   * ==================================================
   */

  const footerY = 42;

  ctx.page.drawLine({
    start: {
      x:
        MARGIN,
      y:
        footerY +
        24,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y:
        footerY +
        24,
    },
    thickness:
      0.8,
    color:
      COLORS.border,
  });

  drawText(
    ctx,
    "Tevuah Reserve - Confidential Investor Record",
    {
      x:
        MARGIN,
      y:
        footerY,
      size: 8,
      color:
        COLORS.stoneLight,
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

function drawMetaBox(
  ctx: Context,
  rows: Array<{
    label: string;
    value: string;
  }>,
) {
  const boxHeight =
    84;

  ctx.page.drawRectangle({
    x:
      MARGIN,
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
    borderWidth:
      0.8,
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
          lineHeight:
            12,
        },
      );
    },
  );

  ctx.y -=
    boxHeight;
}

function drawDetailRow(
  ctx: Context,
  label: string,
  value: string,
) {
  const leftWidth =
    165;

  const rowTop =
    ctx.y;

  drawText(
    ctx,
    label,
    {
      x:
        MARGIN,
      y:
        rowTop,
      size: 9,
      bold: true,
      color:
        COLORS.stone,
    },
  );

  const lines =
    wrapText(
      value,
      ctx.regular,
      10,
      PAGE_WIDTH -
        MARGIN * 2 -
        leftWidth,
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
            index * 14,
          size: 10,
          color:
            COLORS.forest,
        },
      );
    },
  );

  const consumed =
    Math.max(
      26,
      lines.length *
        14 +
        10,
    );

  ctx.page.drawLine({
    start: {
      x:
        MARGIN,
      y:
        rowTop -
        consumed +
        8,
    },
    end: {
      x:
        PAGE_WIDTH -
        MARGIN,
      y:
        rowTop -
        consumed +
        8,
    },
    thickness:
      0.6,
    color:
      COLORS.border,
  });

  ctx.y -=
    consumed;
}

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
    const line of lines
  ) {
    drawText(
      ctx,
      line,
      {
        x:
          MARGIN,
        y:
          ctx.y,
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

  let current =
    "";

  for (
    const word of words
  ) {
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
      if (
        current
      ) {
        lines.push(
          current,
        );
      }

      current =
        word;
    }
  }

  if (
    current
  ) {
    lines.push(
      current,
    );
  }

  return lines.length
    ? lines
    : [""];
}

function sanitizePdfText(
  value: string,
) {
  return value
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
    number | null | undefined,
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
    string | null | undefined,
) {
  if (
    !value
  ) {
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