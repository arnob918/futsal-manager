import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "arnob.develop@gmail.com",
    pass: process.env.APP_PASSWORD, // create in Google Account → Security → App passwords
  },
});

export async function sendMatchSettledEmail(opts: {
  to: string;
  playerName?: string | null;
  matchDate: Date;
  location?: string | null;
  shareCents: number;
  totalCents: number;
}) {
  const { to, playerName, matchDate, location, shareCents, totalCents } = opts;

  const subject = `Futsal settled – ${matchDate.toLocaleString()}`;
  const share = shareCents;
  const total = totalCents;
  const where = location ? ` at ${location}` : "";

  const html = `
    <div style="font-family:Arial, sans-serif; line-height:1.5;">
      <h2>Match settled${where}</h2>
      <p>Hi ${playerName ?? "there"},</p>
      <p>The match on <b>${matchDate.toLocaleString()}</b>${where} has been settled.</p>
      <ul>
        <li>Total cost: <b>${total}</b></li>
        <li>Your share: <b>${share}</b></li>
      </ul>
      <p>You can view your balance and transactions in your dashboard.</p>
      <p>— Futsal Manager</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}
