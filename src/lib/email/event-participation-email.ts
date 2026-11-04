import "server-only";

export type ParticipationEmailDetails = {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  refundableCommitment: string;
  amountBtc: string;
  paymentDeadline: string;
  bitcoinAddress: string;
  bitcoinPaymentLink: string;
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c] ?? c);

export function buildParticipationCommitmentEmail(d: ParticipationEmailDetails) {
  const instructions = `Bitcoin receiving address: ${d.bitcoinAddress}\nBitcoin payment URL: ${d.bitcoinPaymentLink}`;
  const subject = "Participation & Commitment Details";
  const text = `Dear ${d.firstName}
Thank you for your interest in Tevuah Reserve and your intention to participate in ${d.eventName}.
We are pleased to outline the next steps for securing your participation, including the refundable
commitment, the investment process following the event, and the travel arrangements
coordinated by our team.
1. Refundable participation commitment
To confirm your participation, a refundable commitment of ${d.refundableCommitment} is required
before the event.
This commitment serves as the initial amount toward the investment opportunity associated with
your event. It allows you to participate in the experience, engage with the relevant specialists, and
assess the opportunity before making your final investment decision.
The commitment is refundable in full if you attend the event and subsequently decide not to
proceed with the investment. No profit, interest or investment return will be paid on the
committed amount.
Attendance is the only condition of the refund. You must attend the event to qualify for a refund if
you decide not to invest. If you fail to attend, your commitment will not be refunded in full.
1. Your investment decision after the event
Following the event, you will have the opportunity to decide whether you wish to proceed with the
investment.
If you choose to invest, your refundable commitment will be credited toward your investment. You
may then increase your investment to your desired amount by contributing the additional capital
required.
If you attend but choose not to invest, your commitment will be refunded in full after the event.
You will not be required to proceed with the investment simply because you attended the event or
made the commitment.
If you do not attend, you will not qualify for a full refund of your commitment.
This arrangement allows you to evaluate the opportunity in person before deciding whether to
establish or increase your investment position.
1. Travel and accommodation arrangements
Tevuah Reserve coordinates travel and accommodation arrangements for participating attendees,
including those travelling internationally. Our team will work with you to organize the practical
details of your visit.
Depending on your departure location and travel requirements, these arrangements include:
● Flights: Coordination of your return flight itinerary to and from the event destination.
● Visa arrangements: Guidance on visa requirements and coordination of the necessary
application information and supporting travel documentation.
● Hotel accommodation: Hotel reservations for three days, coordinated around the event
schedule.
● Arrival and event logistics: Coordination of your arrival schedule, accommodation details
and attendance arrangements to ensure a smooth visit.
Once your participation commitment has been received and verified, our team will contact you to
obtain your travel preferences, departure location, passport details where necessary, and any
other information required to coordinate your arrangements.
1. Commitment and payment details
Event: ${d.eventName}
Date: ${d.eventDate}
Location: ${d.eventLocation}
Refundable commitment: ${d.refundableCommitment}
Amount in BTC: ${d.amountBtc} BTC
Payment deadline: ${d.paymentDeadline}
Payment instructions: ${instructions}
Please complete the commitment payment using the instructions provided. Once payment has
been received and verified, our team will confirm receipt and begin coordinating your participation
and travel arrangements.
1. Refund process and attendance requirements
If you attend the event and decide not to proceed with the investment, please notify our team
after the event. Your commitment will then be refunded in full.
The following conditions apply:
● Attendance at the event is mandatory to qualify for a full refund.
● No profit, interest or investment return will accrue on the commitment.
If you proceed with the investment, the commitment will instead be credited toward your
investment amount, and you may contribute the additional capital required to reach your intended
investment level.
Our team will provide confirmation of the refund process and expected processing timeframe
where a refund is due.
We encourage you to contact us if you have any questions regarding the commitment, the
investment opportunity or your travel arrangements. Our team will be available to assist you
throughout the process.
We look forward to welcoming you to ${d.eventName} and providing you with the opportunity to
engage directly with the assets, expertise and investment perspectives central to Tevuah Reserve.

Kind regards,
Tevuah Reserve
Event Team`;
  // Presentation only: preserve every word of the original plain-text email.
  const headings = new Set([
    "1. Refundable participation commitment",
    "1. Your investment decision after the event",
    "1. Travel and accommodation arrangements",
    "1. Commitment and payment details",
    "1. Refund process and attendance requirements",
  ]);

  const lines = text.split("\n");
  const sections: { heading: string | null; lines: string[] }[] = [
    { heading: null, lines: [] },
  ];

  for (const line of lines) {
    if (headings.has(line)) {
      sections.push({ heading: line, lines: [] });
    } else {
      sections[sections.length - 1].lines.push(line);
    }
  }

  const cell = (label: string, value: string, emphasized = false) => `
    <tr>
      <td style="padding:13px 16px;border-bottom:1px solid #e6e9e4;color:#65766c;font-size:12px;vertical-align:top;width:38%;">${escapeHtml(label)}</td>
      <td style="padding:13px 16px;border-bottom:1px solid #e6e9e4;color:#102d24;font-size:13px;font-weight:${emphasized ? "700" : "500"};overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(value)}</td>
    </tr>`;

  const paymentRows = [
    cell("Event", d.eventName),
    cell("Date", d.eventDate),
    cell("Location", d.eventLocation),
    cell("Refundable commitment", d.refundableCommitment, true),
    cell("Amount in BTC", `${d.amountBtc} BTC`, true),
    cell("Payment deadline", d.paymentDeadline),
    `<tr><td colspan="2" style="padding:14px 16px 6px;color:#102d24;font-size:13px;font-weight:700;">Payment instructions:</td></tr>`,
    cell("Bitcoin receiving address", d.bitcoinAddress),
    `<tr><td colspan="2" align="center" style="padding:0 16px 17px;">${paymentButton(d.bitcoinPaymentLink)}</td></tr>`,
  ].join("");

  // A table-based CTA is more reliable across HTML email clients.
  // The payment destination remains the admin-provided HTTPS URL.
  function paymentButton(url: string) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error("Bitcoin payment URL must use HTTPS.");
    }
    return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto 10px;border-collapse:separate;">
      <tr><td align="center" bgcolor="#d8b56d" style="border-radius:6px;background:#d8b56d;">
      <a href="${escapeHtml(parsed.toString())}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 26px;border-radius:6px;background:#d8b56d;color:#102d24;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;">Complete Commitment Payment</a>
      </td></tr></table>`;
  }

  function renderLines(sectionLines: string[], isPayment = false) {
    const output: string[] = [];
    let paragraph: string[] = [];
    let bullets: string[] = [];
    let afterPaymentDetails = false;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      output.push(`<p style="margin:0 0 18px;color:#354a40;font-size:14px;line-height:1.85;">${escapeHtml(paragraph.join(" "))}</p>`);
      paragraph = [];
    };

    const flushBullets = () => {
      if (!bullets.length) return;
      output.push(`<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:3px 0 21px;border-collapse:collapse;">${bullets.map((item) => `<tr><td style="width:19px;vertical-align:top;padding:5px 0;color:#b18b4c;font-size:16px;">●</td><td style="padding:5px 0;color:#354a40;font-size:14px;line-height:1.8;">${escapeHtml(item)}</td></tr>`).join("")}</table>`);
      bullets = [];
    };

    for (let i = 0; i < sectionLines.length; i++) {
      const line = sectionLines[i];
      if (isPayment && line.startsWith("Event: ") && !afterPaymentDetails) {
        flushParagraph();
        flushBullets();
        output.push(`<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#f7f8f4;border:1px solid #e3e8e1;margin:8px 0 24px;">${paymentRows}</table>`);
        afterPaymentDetails = true;
        while (i + 1 < sectionLines.length && !sectionLines[i + 1].startsWith("Please complete")) i++;
        continue;
      }
      if (line.startsWith("●")) {
        flushParagraph();
        bullets.push(line.slice(1).trim());
        continue;
      }
      if (bullets.length) flushBullets();
      if (line === "") {
        flushParagraph();
        continue;
      }
      if (line.startsWith("Dear ")) {
        flushParagraph();
        output.push(`<p style="margin:0 0 23px;font-family:Georgia,serif;font-size:20px;color:#102d24;">${escapeHtml(line)}</p>`);
        continue;
      }
      if (line === "Kind regards," || line === "Tevuah Reserve" || line === "Event Team") {
        flushParagraph();
        output.push(`<p style="margin:${line === "Kind regards," ? "18px" : "0"} 0 0;color:#102d24;font-size:14px;line-height:1.6;${line === "Tevuah Reserve" ? "font-weight:700;" : ""}">${escapeHtml(line)}</p>`);
        continue;
      }
      paragraph.push(line.trim());
    }
    flushParagraph();
    flushBullets();
    return output.join("");
  }

  const content = sections.map((section, index) => {
    const heading = section.heading;
    const isPayment = heading === "1. Commitment and payment details";
    const body = renderLines(section.lines, isPayment);
    if (!heading) return `<div style="padding-bottom:12px;">${body}</div>`;
    return `<div style="padding-top:27px;border-top:1px solid #e8ebe6;margin-top:${index === 1 ? "6" : "20"}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:19px;"><tr>
      <td style="width:4px;background:#c4a165;"></td>
      <td style="padding:3px 0 3px 16px;"><h2 style="margin:0;font-family:Georgia,serif;font-size:21px;line-height:1.4;font-weight:normal;color:#102d24;">${escapeHtml(heading)}</h2></td>
      </tr></table>${body}</div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f3ee;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f2f3ee;border-collapse:collapse;">
    <tr><td align="center" style="padding:32px 12px 44px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;border-collapse:collapse;background:#ffffff;border:1px solid #e4e7e0;">
        <tr><td style="height:5px;background:#c4a165;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:42px 42px 39px;background:#102d24;">
          <p style="margin:0;font-family:Georgia,serif;font-size:30px;letter-spacing:.3px;color:#ffffff;">Tevuah Reserve</p>
          <p style="margin:12px 0 0;color:#d8b56d;font-size:10px;letter-spacing:2px;line-height:1.7;">CULTIVATED ASSETS · INFORMED PERSPECTIVES</p>
          <div style="height:1px;background:#3a574a;margin:29px 0 25px;"></div>
          <h1 style="margin:0;font-family:Georgia,serif;font-weight:normal;font-size:28px;line-height:1.3;color:#ffffff;">${escapeHtml(subject)}</h1>
        </td></tr>
        <tr><td style="padding:40px 42px 43px;">${content}</td></tr>
        <tr><td style="padding:30px 38px;background:#102d24;text-align:center;">
          <p style="margin:0 0 9px;font-family:Georgia,serif;font-size:18px;color:#d8b56d;">TEVUAH RESERVE</p>
          <p style="margin:0;color:#c8d2ca;font-size:11px;line-height:1.9;">20 Castle Terrace, Edinburgh EH1 2EE, United Kingdom</p>
          <p style="margin:0;color:#c8d2ca;font-size:11px;line-height:1.9;">team@tevuahreserve.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
