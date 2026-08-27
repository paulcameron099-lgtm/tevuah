import {
  NextResponse,
} from "next/server";

import {
  readFile,
} from "node:fs/promises";

import path from "node:path";

import {
  PDFDocument,
  PDFPage,
  PDFFont,
  StandardFonts,
  rgb,
} from "pdf-lib";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    statementId: string;
  }>;
};

type PdfContext = {
  pdf: PDFDocument;
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  width: number;
  height: number;
  margin: number;
  y: number;
  pageNumber: number;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 46;

const COLORS = {
  forest: rgb(0.075, 0.165, 0.125),
  forestSoft: rgb(0.15, 0.26, 0.21),
  gold: rgb(0.68, 0.51, 0.20),
  stone: rgb(0.37, 0.35, 0.32),
  stoneLight: rgb(0.68, 0.66, 0.62),
  border: rgb(0.88, 0.87, 0.84),
  ivory: rgb(0.975, 0.965, 0.93),
  white: rgb(1, 1, 1),
  greenBg: rgb(0.93, 0.98, 0.95),
  blueBg: rgb(0.93, 0.96, 1),
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    /*
     * ==================================================
     * 1. AUTH
     * ==================================================
     */
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      statementId,
    } = await context.params;

    const admin =
      createAdminClient();

    /*
     * ==================================================
     * 2. LOAD STATEMENT
     * ==================================================
     *
     * Investor:
     * - own statement
     * - published only
     *
     * Admin / super_admin:
     * - may download for review
     */
    let query =
      admin
        .from(
          "investor_statements",
        )
        .select(
          `
          id,

          investor_id,

          period_start,
          period_end,

          statement_type,
          currency,

          opening_portfolio_value,
          closing_portfolio_value,

          original_principal,
          adjusted_cost_basis,

          income_received,
          capital_returned,
          total_cash_received,

          total_economic_value,

          unrealized_gain_loss,
          total_gain_loss,
          total_return_percent,

          position_count,

          reconstructed_from_legacy,
          historical_generated_at,
          historical_published_at,

          generated_at,
          published_at,
          reinstated_at,

          status,

          investor:profiles!investor_statements_investor_id_fkey (
            id,
            first_name,
            last_name
          )
          `,
        )
        .eq(
          "id",
          statementId,
        );

    if (
      user.role ===
      "investor"
    ) {
      query =
        query
          .eq(
            "investor_id",
            user.id,
          )
          .eq(
            "status",
            "published",
          );
    } else if (
      user.role !==
        "admin" &&
      user.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: statement,
      error: statementError,
    } =
      await query.maybeSingle();

    if (
      statementError ||
      !statement
    ) {
      console.error(
        "Statement PDF lookup error:",
        statementError,
      );

      return NextResponse.json(
        {
          error:
            "Statement not found.",
        },
        {
          status: 404,
        },
      );
    }

    const statementRecord =
      statement;

    /*
     * ==================================================
     * 3. NORMALIZE INVESTOR
     * ==================================================
     */
    const investor =
      Array.isArray(
        statementRecord.investor,
      )
        ? statementRecord.investor[0] ??
          null
        : statementRecord.investor;

    const investorName =
      investor
        ? [
            investor.first_name,
            investor.last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Investor"
        : "Investor";

    /*
     * ==================================================
     * 4. LOAD FROZEN POSITION SNAPSHOTS
     * ==================================================
     */
    const {
      data: positions,
      error: positionsError,
    } = await admin
      .from(
        "investor_statement_positions",
      )
      .select(
        `
        id,
        position_id,

        opportunity_title,
        opportunity_slug,
        asset_category,

        original_principal,
        adjusted_cost_basis,

        opening_value,
        closing_value,

        income_received,
        capital_returned,
        total_cash_received,

        unrealized_gain_loss,
        total_gain_loss,
        total_return_percent,

        currency,
        position_status,

        funded_at,
        valuation_date,

        created_at
        `,
      )
      .eq(
        "statement_id",
        statementRecord.id,
      )
      .order(
        "created_at",
        {
          ascending: true,
        },
      );

    if (
      positionsError
    ) {
      console.error(
        "Statement PDF positions load error:",
        positionsError,
      );

      throw new Error(
        "Unable to load statement positions.",
      );
    }

    /*
     * ==================================================
     * 5. LOAD FROZEN ACTIVITY
     * ==================================================
     */
    const {
      data: activity,
      error: activityError,
    } = await admin
      .from(
        "investor_statement_activity",
      )
      .select(
        `
        id,

        activity_type,
        activity_date,

        title,
        description,

        amount,
        basis_effect,

        currency
        `,
      )
      .eq(
        "statement_id",
        statementRecord.id,
      )
      .order(
        "activity_date",
        {
          ascending: true,
        },
      );

    if (
      activityError
    ) {
      console.error(
        "Statement PDF activity load error:",
        activityError,
      );

      throw new Error(
        "Unable to load statement activity.",
      );
    }

    const positionRows =
      positions ?? [];

    const activityRows =
      activity ?? [];

    /*
     * ==================================================
     * 6. CREATE PDF
     * ==================================================
     */
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

    const ctx =
      createPageContext(
        pdf,
        regular,
        bold,
      );

    /*
     * ==================================================
     * 7. LOGO
     * ==================================================
     *
     * Preferred file:
     *
     * public/brand/tevuah-reserve-logo.png
     *
     * If it does not exist, the PDF falls back to
     * a text-based Tevuah Reserve wordmark.
     */
    const logo =
      await loadLogo(
        pdf,
      );

    /*
     * ==================================================
     * 8. COVER / HEADER
     * ==================================================
     */
    drawBrandHeader(
      ctx,
      logo,
    );

    drawText(
  ctx,
  "INVESTOR STATEMENT",
  {
    size: 10,
    bold: true,
    color: COLORS.gold,
    gapAfter: 8,
  },
);

    drawText(
      ctx,
      investorName,
      {
        size: 25,
        bold: true,
        color:
          COLORS.forest,
        gapAfter:
          6,
      },
    );

    drawText(
      ctx,
      `${formatDate(
        statementRecord.period_start,
      )} - ${formatDate(
        statementRecord.period_end,
      )}`,
      {
        size: 11,
        color:
          COLORS.stone,
        gapAfter:
          4,
      },
    );

    drawText(
      ctx,
      humanize(
        statementRecord.statement_type,
      ),
      {
        size: 9,
        color:
          COLORS.stoneLight,
        gapAfter:
          12,
      },
    );

    const displayPublishedDate =
      statementRecord.reconstructed_from_legacy &&
      statementRecord.historical_published_at
        ? statementRecord.historical_published_at
        : statementRecord.published_at;

    drawInfoBanner(
      ctx,
      statementRecord.reconstructed_from_legacy
        ? "Historical statement reconstruction"
        : "Published investor statement",
      statementRecord.reconstructed_from_legacy
        ? `Historical statement date: ${
            displayPublishedDate
              ? formatDate(
                  displayPublishedDate.slice(
                    0,
                    10,
                  ),
                )
              : "Not provided"
          }. This statement was reconstructed from historical records.`
        : `Statement date: ${
            displayPublishedDate
              ? formatDate(
                  displayPublishedDate.slice(
                    0,
                    10,
                  ),
                )
              : "Published"
          }.`,
      statementRecord.reconstructed_from_legacy
        ? COLORS.blueBg
        : COLORS.greenBg,
    );

    /*
     * ==================================================
     * 9. PORTFOLIO SUMMARY
     * ==================================================
     */
    sectionTitle(
      ctx,
      "Portfolio Summary",
      "Frozen values for this reporting period.",
    );

    const summaryRows: Array<
      [
        string,
        string,
      ]
    > = [
      [
        "Opening portfolio value",
        formatMoney(
          Number(
            statementRecord.opening_portfolio_value,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Closing portfolio value",
        formatMoney(
          Number(
            statementRecord.closing_portfolio_value,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Original principal",
        formatMoney(
          Number(
            statementRecord.original_principal,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Adjusted cost basis",
        formatMoney(
          Number(
            statementRecord.adjusted_cost_basis,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Income received",
        formatMoney(
          Number(
            statementRecord.income_received,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Capital returned",
        formatMoney(
          Number(
            statementRecord.capital_returned,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Total cash received",
        formatMoney(
          Number(
            statementRecord.total_cash_received,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Total economic value",
        formatMoney(
          Number(
            statementRecord.total_economic_value,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Total gain / loss",
        formatSignedMoney(
          Number(
            statementRecord.total_gain_loss,
          ),
          statementRecord.currency,
        ),
      ],
      [
        "Total return",
        statementRecord.total_return_percent !=
        null
          ? formatPercent(
              Number(
                statementRecord.total_return_percent,
              ),
            )
          : "-",
      ],
    ];

    drawKeyValueGrid(
      ctx,
      summaryRows,
    );

    /*
     * ==================================================
     * 10. HOLDINGS TABLE
     * ==================================================
     */
    sectionTitle(
      ctx,
      "Holdings",
      `${positionRows.length} position${
        positionRows.length === 1
          ? ""
          : "s"
      } included in this frozen statement snapshot.`,
    );

    if (
      positionRows.length ===
      0
    ) {
      drawMutedText(
        ctx,
        "No positions were included in this statement.",
      );
    } else {
      drawHoldingsTable(
        ctx,
        positionRows.map(
          (
            position,
          ) => ({
            title:
              position.opportunity_title,

            category:
              position.asset_category
                ? humanize(
                    position.asset_category,
                  )
                : "Investment",

            principal:
              formatMoney(
                Number(
                  position.original_principal,
                ),
                position.currency,
              ),

            basis:
              formatMoney(
                Number(
                  position.adjusted_cost_basis,
                ),
                position.currency,
              ),

            closing:
              formatMoney(
                Number(
                  position.closing_value,
                ),
                position.currency,
              ),

            income:
              formatMoney(
                Number(
                  position.income_received,
                ),
                position.currency,
              ),

            capital:
              formatMoney(
                Number(
                  position.capital_returned,
                ),
                position.currency,
              ),

            returnValue:
              position.total_return_percent !=
              null
                ? formatPercent(
                    Number(
                      position.total_return_percent,
                    ),
                  )
                : "-",
          }),
        ),
      );
    }

    /*
     * ==================================================
     * 11. ACTIVITY HISTORY
     * ==================================================
     */
    sectionTitle(
      ctx,
      "Statement Activity",
      "Funding, valuation, distribution and cost-basis events captured in this reporting period.",
    );

    if (
      activityRows.length ===
      0
    ) {
      drawMutedText(
        ctx,
        "No reportable activity occurred during this statement period.",
      );
    } else {
      for (
        const item of
          activityRows
      ) {
        ensureSpace(
          ctx,
          78,
          {
            continuedHeader:
              "Statement Activity - continued",
          },
        );

        drawActivityRow(
          ctx,
          {
            date:
              formatDate(
                item.activity_date.slice(
                  0,
                  10,
                ),
              ),

            type:
              humanize(
                item.activity_type,
              ),

            title:
              item.title,

            description:
              item.description ??
              "",

            amount:
              item.amount !=
              null
                ? formatMoney(
                    Number(
                      item.amount,
                    ),
                    item.currency,
                  )
                : "",

            basisEffect:
              item.basis_effect !=
              null
                ? formatSignedMoney(
                    Number(
                      item.basis_effect,
                    ),
                    item.currency,
                  )
                : "",
          },
        );
      }
    }

    /*
     * ==================================================
     * 12. DISCLOSURES
     * ==================================================
     */
    ensureSpace(
      ctx,
      190,
      {
        continuedHeader:
          "Important Information",
      },
    );

    sectionTitle(
      ctx,
      "Important Information",
      "Please retain this statement with your investment records.",
    );

    const disclosures = [
      "This statement reflects a frozen historical snapshot of the investor account for the stated reporting period.",
      "Values shown are based on records available when the statement snapshot was generated and may differ from later portfolio valuations.",
      "Income received includes completed paid distributions classified as investment income. Return of capital and redemption are disclosed separately because they may affect adjusted cost basis.",
      "Performance figures are informational and do not constitute tax, legal or investment advice.",
      statementRecord.reconstructed_from_legacy
        ? "This statement was reconstructed from historical or legacy records. Historical statement dates may differ from the system reconstruction date."
        : null,
    ].filter(
      (
        value,
      ): value is string =>
        Boolean(
          value,
        ),
    );

    drawBulletList(
      ctx,
      disclosures,
    );

    /*
     * ==================================================
     * 13. AUDIT FOOTNOTE
     * ==================================================
     */
    ensureSpace(
      ctx,
      80,
    );

    ctx.y -=
      10;

    drawText(
      ctx,
      `Statement ID: ${statementRecord.id}`,
      {
        size: 7,
        color:
          COLORS.stoneLight,
        gapAfter:
          3,
      },
    );

    drawText(
      ctx,
      `Generated in system: ${formatDateTime(
        statementRecord.generated_at,
      )}`,
      {
        size: 7,
        color:
          COLORS.stoneLight,
        gapAfter:
          3,
      },
    );

    if (
      statementRecord.reinstated_at
    ) {
      drawText(
        ctx,
        `Last reinstated: ${formatDateTime(
          statementRecord.reinstated_at,
        )}`,
        {
          size: 7,
          color:
            COLORS.stoneLight,
          gapAfter:
            3,
        },
      );
    }

    /*
     * ==================================================
     * 14. PAGE NUMBERS + FOOTERS
     * ==================================================
     */
    addPageFooters(
      pdf,
      regular,
    );

    /*
     * ==================================================
     * 15. SAVE
     * ==================================================
     */
   const bytes =
  await pdf.save();

/*
 * Convert pdf-lib Uint8Array into a plain ArrayBuffer
 * so Next.js Response accepts it as BodyInit.
 */
const pdfBuffer =
  bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset +
      bytes.byteLength,
  ) as ArrayBuffer;

const fileName =
  `tevuah-statement-${statementRecord.period_end}-${statementRecord.id}.pdf`;

return new Response(
  pdfBuffer,
  {
    status: 200,

    headers: {
      "Content-Type":
        "application/pdf",

      "Content-Disposition":
        `attachment; filename="${fileName}"`,

      "Cache-Control":
        "private, no-store",
    },
  },
);
  } catch (error) {
    console.error(
      "Statement PDF generation error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate statement PDF.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * ==================================================
 * PAGE CREATION
 * ==================================================
 */

function createPageContext(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
): PdfContext {
  const page =
    pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  return {
    pdf,
    page,
    regular,
    bold,
    width:
      PAGE_WIDTH,
    height:
      PAGE_HEIGHT,
    margin:
      MARGIN,
    y:
      PAGE_HEIGHT -
      MARGIN,
    pageNumber:
      1,
  };
}

function newPage(
  ctx: PdfContext,
  continuedHeader?: string,
) {
  ctx.page =
    ctx.pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

  ctx.pageNumber +=
    1;

  ctx.y =
    PAGE_HEIGHT -
    MARGIN;

  drawMiniBrandHeader(
    ctx,
  );

  if (
    continuedHeader
  ) {
    drawText(
      ctx,
      continuedHeader,
      {
        size: 13,
        bold: true,
        color:
          COLORS.forest,
        gapAfter:
          12,
      },
    );
  }
}

function ensureSpace(
  ctx: PdfContext,
  required: number,
  options?: {
    continuedHeader?: string;
  },
) {
  if (
    ctx.y - required >
    52
  ) {
    return;
  }

  newPage(
    ctx,
    options?.continuedHeader,
  );
}

/*
 * ==================================================
 * BRAND
 * ==================================================
 */

async function loadLogo(
  pdf: PDFDocument,
) {
  try {
    const logoPath =
      path.join(
        process.cwd(),
        "public",
        "brand",
        "tevuah-reserve-logo.png",
      );

    const bytes =
      await readFile(
        logoPath,
      );

    return await pdf.embedPng(
      bytes,
    );
  } catch {
    return null;
  }
}

function drawBrandHeader(
  ctx: PdfContext,
  logo:
    | Awaited<
        ReturnType<
          PDFDocument["embedPng"]
        >
      >
    | null,
) {
  if (
    logo
  ) {
    const scaled =
      logo.scale(
        0.22,
      );

    const maxHeight =
      42;

    const ratio =
      scaled.height >
      maxHeight
        ? maxHeight /
          scaled.height
        : 1;

    ctx.page.drawImage(
      logo,
      {
        x:
          ctx.margin,
        y:
          ctx.y -
          scaled.height *
            ratio +
          5,

        width:
          scaled.width *
          ratio,

        height:
          scaled.height *
          ratio,
      },
    );

    ctx.y -=
      52;
  } else {
    drawText(
  ctx,
  "TEVUAH RESERVE",
  {
    size: 17,
    bold: true,
    color:
      COLORS.forest,
    gapAfter:
      3,
  },
);

    drawText(
  ctx,
  "PRIVATE MARKETS | REAL ASSETS",
  {
    size: 7,
    bold: true,
    color:
      COLORS.gold,
    gapAfter:
      15,
  },
);
  }

  ctx.page.drawLine({
    start: {
      x:
        ctx.margin,
      y:
        ctx.y,
    },

    end: {
      x:
        ctx.width -
        ctx.margin,
      y:
        ctx.y,
    },

    thickness:
      1,

    color:
      COLORS.border,
  });

  ctx.y -=
    22;
}

function drawMiniBrandHeader(
  ctx: PdfContext,
) {
  ctx.page.drawText(
    "TEVUAH RESERVE",
    {
      x:
        ctx.margin,
      y:
        ctx.y,
      size:
        9,
      font:
        ctx.bold,
      color:
        COLORS.forest,
    },
  );

  ctx.y -=
    14;

  ctx.page.drawLine({
    start: {
      x:
        ctx.margin,
      y:
        ctx.y,
    },

    end: {
      x:
        ctx.width -
        ctx.margin,
      y:
        ctx.y,
    },

    thickness:
      0.75,

    color:
      COLORS.border,
  });

  ctx.y -=
    18;
}

/*
 * ==================================================
 * TEXT
 * ==================================================
 */

function drawText(
  ctx: PdfContext,
  value: string,
 options?: {
  size?: number;
  bold?: boolean;
  color?: ReturnType<
    typeof rgb
  >;
  gapAfter?: number;
  x?: number;
  maxWidth?: number;
},
) {
  const size =
    options?.size ??
    10;

  const font =
    options?.bold
      ? ctx.bold
      : ctx.regular;

  const maxWidth =
    options?.maxWidth ??
    ctx.width -
      ctx.margin * 2;

  const lines =
    wrapText(
      value,
      font,
      size,
      maxWidth,
    );

  ensureSpace(
    ctx,
    lines.length *
      (size + 3) +
      (options?.gapAfter ??
        4),
  );

  for (
    const line of
      lines
  ) {
ctx.page.drawText(
  line,
  {
    x:
      options?.x ??
      ctx.margin,

    y:
      ctx.y,

    size,

    font,

    color:
      options?.color ??
      COLORS.forest,
  },
);

    ctx.y -=
      size + 3;
  }

  ctx.y -=
    options?.gapAfter ??
    4;
}

function drawMutedText(
  ctx: PdfContext,
  value: string,
) {
  drawText(
    ctx,
    value,
    {
      size: 9,
      color:
        COLORS.stone,
      gapAfter:
        12,
    },
  );
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const paragraphs =
    text
      .split(
        /\r?\n/,
      );

  const lines: string[] =
    [];

  for (
    const paragraph of
      paragraphs
  ) {
    const words =
      paragraph
        .split(
          /\s+/,
        )
        .filter(Boolean);

    if (
      words.length ===
      0
    ) {
      lines.push(
        "",
      );
      continue;
    }

    let current =
      "";

    for (
      const word of
        words
    ) {
      const candidate =
        current
          ? `${current} ${word}`
          : word;

      const width =
        font.widthOfTextAtSize(
          candidate,
          size,
        );

      if (
        width <=
          maxWidth ||
        !current
      ) {
        current =
          candidate;
      } else {
        lines.push(
          current,
        );

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
  }

  return lines;
}

/*
 * ==================================================
 * SECTION TITLES
 * ==================================================
 */

function sectionTitle(
  ctx: PdfContext,
  title: string,
  subtitle?: string,
) {
  ensureSpace(
    ctx,
    subtitle
      ? 58
      : 38,
  );

  ctx.y -=
    8;

  drawText(
    ctx,
    title,
    {
      size: 15,
      bold: true,
      color:
        COLORS.forest,
      gapAfter:
        4,
    },
  );

  if (
    subtitle
  ) {
    drawText(
      ctx,
      subtitle,
      {
        size: 8,
        color:
          COLORS.stone,
        gapAfter:
          12,
      },
    );
  }
}

/*
 * ==================================================
 * INFO BANNER
 * ==================================================
 */

function drawInfoBanner(
  ctx: PdfContext,
  title: string,
  body: string,
  background:
    ReturnType<
      typeof rgb
    >,
) {
  const titleSize =
    9;

  const bodySize =
    8;

  const innerWidth =
    ctx.width -
    ctx.margin * 2 -
    24;

  const bodyLines =
    wrapText(
      body,
      ctx.regular,
      bodySize,
      innerWidth,
    );

  const height =
    18 +
    titleSize +
    8 +
    bodyLines.length *
      (bodySize + 3) +
    14;

  ensureSpace(
    ctx,
    height +
      12,
  );

  ctx.page.drawRectangle({
    x:
      ctx.margin,
    y:
      ctx.y -
      height,

    width:
      ctx.width -
      ctx.margin * 2,

    height,

    color:
      background,
  });

  const startY =
    ctx.y -
    17;

  ctx.page.drawText(
    title,
    {
      x:
        ctx.margin +
        12,

      y:
        startY,

      size:
        titleSize,

      font:
        ctx.bold,

      color:
        COLORS.forest,
    },
  );

  let bodyY =
    startY -
    17;

  for (
    const line of
      bodyLines
  ) {
    ctx.page.drawText(
      line,
      {
        x:
          ctx.margin +
          12,

        y:
          bodyY,

        size:
          bodySize,

        font:
          ctx.regular,

        color:
          COLORS.stone,
      },
    );

    bodyY -=
      bodySize + 3;
  }

  ctx.y -=
    height + 15;
}

/*
 * ==================================================
 * KEY VALUE GRID
 * ==================================================
 */

function drawKeyValueGrid(
  ctx: PdfContext,
  rows: Array<
    [
      string,
      string,
    ]
  >,
) {
  const columnGap =
    14;

  const cardWidth =
    (
      ctx.width -
      ctx.margin * 2 -
      columnGap
    ) /
    2;

  const cardHeight =
    46;

  for (
    let index = 0;
    index <
    rows.length;
    index += 2
  ) {
    ensureSpace(
      ctx,
      cardHeight +
        10,
    );

    const leftRow =
      rows[index];

    const rightRow =
      rows[
        index + 1
      ];

    drawMetricBox(
      ctx,
      ctx.margin,
      ctx.y -
        cardHeight,
      cardWidth,
      cardHeight,
      leftRow[0],
      leftRow[1],
    );

    if (
      rightRow
    ) {
      drawMetricBox(
        ctx,
        ctx.margin +
          cardWidth +
          columnGap,
        ctx.y -
          cardHeight,
        cardWidth,
        cardHeight,
        rightRow[0],
        rightRow[1],
      );
    }

    ctx.y -=
      cardHeight + 10;
  }
}

function drawMetricBox(
  ctx: PdfContext,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
) {
  ctx.page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor:
      COLORS.border,
    borderWidth:
      0.75,
    color:
      COLORS.ivory,
  });

  ctx.page.drawText(
    label.toUpperCase(),
    {
      x:
        x + 10,
      y:
        y +
        height -
        15,
      size:
        6.5,
      font:
        ctx.bold,
      color:
        COLORS.stoneLight,
    },
  );

  ctx.page.drawText(
    value,
    {
      x:
        x + 10,
      y:
        y + 12,
      size:
        11,
      font:
        ctx.bold,
      color:
        COLORS.forest,
    },
  );
}

/*
 * ==================================================
 * HOLDINGS TABLE
 * ==================================================
 */

function drawHoldingsTable(
  ctx: PdfContext,
  rows: Array<{
    title: string;
    category: string;
    principal: string;
    basis: string;
    closing: string;
    income: string;
    capital: string;
    returnValue: string;
  }>,
) {
  const columns = [
    {
      label:
        "Holding",
      width:
        160,
      align:
        "left" as const,
    },
    {
      label:
        "Principal",
      width:
        72,
      align:
        "right" as const,
    },
    {
      label:
        "Adj. Basis",
      width:
        72,
      align:
        "right" as const,
    },
    {
      label:
        "Closing",
      width:
        72,
      align:
        "right" as const,
    },
    {
      label:
        "Income",
      width:
        62,
      align:
        "right" as const,
    },
    {
      label:
        "Return",
      width:
        54,
      align:
        "right" as const,
    },
  ];

  const tableWidth =
    columns.reduce(
      (
        total,
        column,
      ) =>
        total +
        column.width,
      0,
    );

  function header() {
    ensureSpace(
      ctx,
      32,
    );

    const height =
      24;

    ctx.page.drawRectangle({
      x:
        ctx.margin,
      y:
        ctx.y -
        height,
      width:
        tableWidth,
      height,
      color:
        COLORS.forest,
    });

    let x =
      ctx.margin;

    for (
      const column of
        columns
    ) {
      drawCellText(
        ctx,
        column.label,
        x,
        ctx.y -
          16,
        column.width,
        7,
        true,
        COLORS.white,
        column.align,
      );

      x +=
        column.width;
    }

    ctx.y -=
      height;
  }

  header();

  for (
    const row of
      rows
  ) {
    const titleLines =
      wrapText(
        row.title,
        ctx.bold,
        7.5,
        columns[0].width -
          14,
      );

    const rowHeight =
      Math.max(
        37,
        20 +
          titleLines.length *
            9,
      );

    if (
      ctx.y -
        rowHeight <
      58
    ) {
      newPage(
        ctx,
        "Holdings - continued",
      );

      header();
    }

    ctx.page.drawRectangle({
      x:
        ctx.margin,
      y:
        ctx.y -
        rowHeight,
      width:
        tableWidth,
      height:
        rowHeight,
      borderColor:
        COLORS.border,
      borderWidth:
        0.5,
      color:
        COLORS.white,
    });

    let x =
      ctx.margin;

    let titleY =
      ctx.y -
      13;

    for (
      const line of
        titleLines
    ) {
      ctx.page.drawText(
        line,
        {
          x:
            x + 7,
          y:
            titleY,
          size:
            7.5,
          font:
            ctx.bold,
          color:
            COLORS.forest,
        },
      );

      titleY -=
        9;
    }

    ctx.page.drawText(
      row.category,
      {
        x:
          x + 7,
        y:
          ctx.y -
          rowHeight +
          9,
        size:
          6,
        font:
          ctx.regular,
        color:
          COLORS.stoneLight,
      },
    );

    x +=
      columns[0].width;

    const values = [
      row.principal,
      row.basis,
      row.closing,
      row.income,
      row.returnValue,
    ];

    for (
      let i = 1;
      i <
      columns.length;
      i += 1
    ) {
      drawCellText(
        ctx,
        values[
          i - 1
        ],
        x,
        ctx.y -
          rowHeight /
            2 +
          2,
        columns[i].width,
        7,
        false,
        COLORS.forest,
        "right",
      );

      x +=
        columns[i].width;
    }

    ctx.y -=
      rowHeight;
  }

  ctx.y -=
    10;
}

/*
 * ==================================================
 * ACTIVITY
 * ==================================================
 */

function drawActivityRow(
  ctx: PdfContext,
  item: {
    date: string;
    type: string;
    title: string;
    description: string;
    amount: string;
    basisEffect: string;
  },
) {
  const descriptionLines =
    item.description
      ? wrapText(
          item.description,
          ctx.regular,
          7,
          300,
        )
      : [];

  const rowHeight =
    Math.max(
      56,
      42 +
        descriptionLines.length *
          8,
    );

  ensureSpace(
    ctx,
    rowHeight +
      8,
    {
      continuedHeader:
        "Statement Activity - continued",
    },
  );

  ctx.page.drawRectangle({
    x:
      ctx.margin,
    y:
      ctx.y -
      rowHeight,
    width:
      ctx.width -
      ctx.margin * 2,
    height:
      rowHeight,
    borderColor:
      COLORS.border,
    borderWidth:
      0.6,
    color:
      COLORS.white,
  });

  ctx.page.drawText(
    item.date,
    {
      x:
        ctx.margin +
        10,
      y:
        ctx.y -
        17,
      size:
        7,
      font:
        ctx.bold,
      color:
        COLORS.stone,
    },
  );

  ctx.page.drawText(
    item.type.toUpperCase(),
    {
      x:
        ctx.margin +
        95,
      y:
        ctx.y -
        17,
      size:
        6,
      font:
        ctx.bold,
      color:
        COLORS.gold,
    },
  );

  ctx.page.drawText(
    item.title,
    {
      x:
        ctx.margin +
        95,
      y:
        ctx.y -
        32,
      size:
        8.5,
      font:
        ctx.bold,
      color:
        COLORS.forest,
    },
  );

  let descriptionY =
    ctx.y -
    45;

  for (
    const line of
      descriptionLines
  ) {
    ctx.page.drawText(
      line,
      {
        x:
          ctx.margin +
          95,
        y:
          descriptionY,
        size:
          7,
        font:
          ctx.regular,
        color:
          COLORS.stone,
      },
    );

    descriptionY -=
      8;
  }

  if (
    item.amount
  ) {
    drawRightAlignedText(
      ctx,
      item.amount,
      ctx.width -
        ctx.margin -
        10,
      ctx.y -
        18,
      8,
      true,
      COLORS.forest,
    );
  }

  if (
    item.basisEffect
  ) {
    drawRightAlignedText(
      ctx,
      `Basis ${item.basisEffect}`,
      ctx.width -
        ctx.margin -
        10,
      ctx.y -
        34,
      6.5,
      false,
      COLORS.stone,
    );
  }

  ctx.y -=
    rowHeight + 8;
}

/*
 * ==================================================
 * BULLETS
 * ==================================================
 */

function drawBulletList(
  ctx: PdfContext,
  items: string[],
) {
  for (
    const item of
      items
  ) {
    const lines =
      wrapText(
        item,
        ctx.regular,
        8,
        ctx.width -
          ctx.margin * 2 -
          20,
      );

    ensureSpace(
      ctx,
      lines.length *
        11 +
        8,
    );

    ctx.page.drawCircle({
      x:
        ctx.margin + 3,
      y:
        ctx.y - 4,
      size:
        1.5,
      color:
        COLORS.gold,
    });

    let lineY =
      ctx.y;

    for (
      const line of
        lines
    ) {
      ctx.page.drawText(
        line,
        {
          x:
            ctx.margin +
            14,
          y:
            lineY,
          size:
            8,
          font:
            ctx.regular,
          color:
            COLORS.stone,
        },
      );

      lineY -=
        11;
    }

    ctx.y =
      lineY -
      4;
  }
}

/*
 * ==================================================
 * PAGE FOOTERS
 * ==================================================
 */

function addPageFooters(
  pdf: PDFDocument,
  regular: PDFFont,
) {
  const pages =
    pdf.getPages();

  pages.forEach(
    (
      page,
      index,
    ) => {
      const {
        width,
      } =
        page.getSize();

      page.drawLine({
        start: {
          x:
            MARGIN,
          y:
            34,
        },

        end: {
          x:
            width -
            MARGIN,
          y:
            34,
        },

        thickness:
          0.5,

        color:
          COLORS.border,
      });

      page.drawText(
        "Tevuah Reserve | Confidential Investor Statement",
        {
          x:
            MARGIN,
          y:
            20,
          size:
            6.5,
          font:
            regular,
          color:
            COLORS.stoneLight,
        },
      );

      const pageLabel =
        `Page ${
          index + 1
        } of ${
          pages.length
        }`;

      const labelWidth =
        regular.widthOfTextAtSize(
          pageLabel,
          6.5,
        );

      page.drawText(
        pageLabel,
        {
          x:
            width -
            MARGIN -
            labelWidth,
          y:
            20,
          size:
            6.5,
          font:
            regular,
          color:
            COLORS.stoneLight,
        },
      );
    },
  );
}

/*
 * ==================================================
 * DRAW HELPERS
 * ==================================================
 */

function drawCellText(
  ctx: PdfContext,
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  bold: boolean,
  color:
    ReturnType<
      typeof rgb
    >,
  align:
    | "left"
    | "right",
) {
  const font =
    bold
      ? ctx.bold
      : ctx.regular;

  const textWidth =
    font.widthOfTextAtSize(
      value,
      size,
    );

  const drawX =
    align === "right"
      ? x +
        width -
        textWidth -
        7
      : x + 7;

  ctx.page.drawText(
    value,
    {
      x:
        drawX,
      y,
      size,
      font,
      color,
    },
  );
}

function drawRightAlignedText(
  ctx: PdfContext,
  value: string,
  rightX: number,
  y: number,
  size: number,
  bold: boolean,
  color:
    ReturnType<
      typeof rgb
    >,
) {
  const font =
    bold
      ? ctx.bold
      : ctx.regular;

  const width =
    font.widthOfTextAtSize(
      value,
      size,
    );

  ctx.page.drawText(
    value,
    {
      x:
        rightX -
        width,
      y,
      size,
      font,
      color,
    },
  );
}

/*
 * ==================================================
 * FORMATTERS
 * ==================================================
 */

function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function formatMoney(
  cents: number,
  currency =
    "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency,
      maximumFractionDigits:
        2,
    },
  ).format(
    cents / 100,
  );
}

function formatSignedMoney(
  cents: number,
  currency =
    "USD",
) {
  const formatted =
    formatMoney(
      Math.abs(
        cents,
      ),
      currency,
    );

  if (
    cents > 0
  ) {
    return `+${formatted}`;
  }

  if (
    cents < 0
  ) {
    return `-${formatted}`;
  }

  return formatted;
}

function formatPercent(
  value: number,
) {
  return `${
    value > 0
      ? "+"
      : ""
  }${value.toFixed(
    2,
  )}%`;
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",
      month:
        "short",
      day:
        "numeric",
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  );
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",
      month:
        "short",
      day:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}
