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
  playerCount: number;
}) {
  const {
    to,
    playerName,
    matchDate,
    location,
    shareCents,
    totalCents,
    playerCount,
  } = opts;

  const subject = `Futsal settled – ${matchDate.toLocaleString()}`;
  const share = shareCents;
  const total = totalCents;
  const where = location ? ` at ${location}` : "";

  const html = `
    <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px; background-color:#f9f9f9;">
      <div style="text-align:center; padding:15px; background-color:#4CAF50; color:white; border-radius:5px; margin-bottom:20px;">
        <h2 style="margin:0;">Match Settled${where}</h2>
      </div>
      <p style="font-size:16px;">Hi <b>${playerName ?? "there"}</b>,</p>
      <p style="font-size:16px;">The match on <b>${matchDate.toLocaleString()}</b>${where} has been settled with <b>${
    playerCount ?? "multiple"
  }</b> players.</p>
      <div style="background-color:white; padding:15px; border-radius:5px; margin:15px 0; border-left:4px solid #4CAF50;">
        <h3 style="margin-top:0; color:#333;">Match Summary</h3>
        <ul style="padding-left:20px;">
          <li style="margin-bottom:10px;">Total cost: <b style="color:#e53935;">${total}</b></li>
          <li style="margin-bottom:10px;">Your share: <b style="color:#e53935;">${share}</b></li>
          <li style="margin-bottom:10px;">Players: <b>${
            playerCount ?? "Multiple"
          }</b></li>
        </ul>
      </div>
      <p style="font-size:16px;">You can view your balance and transactions in your dashboard.</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="https://penalty-marchants.vercel.app/" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">Visit Dashboard</a>
      </div>
      <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:20px; text-align:center; color:#757575; font-size:14px;">
        <p>— Penalty Merchants</p>
        <p style="margin:5px 0;">The field where football meets brotherhood.</p>
        <a href="https://penalty-marchants.vercel.app/" style="color:#4CAF50; text-decoration:none;">penalty-marchants.vercel.app</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}
