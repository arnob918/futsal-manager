import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
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
  guestCount: number;
  perHeadShare: number;
  updatedBalance: number;
}) {
  const {
    to,
    playerName,
    matchDate,
    location,
    shareCents,
    totalCents,
    perHeadShare,
    playerCount,
    guestCount,
    updatedBalance,
  } = opts;

  const subject = `Futsal settled – ${matchDate.toLocaleString()}`;
  const share = shareCents;
  const total = totalCents;
  const where = location ? ` at ${location}` : "";
  const formattedBalance = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(updatedBalance);

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
          <li style="margin-bottom:10px;">Per Head: <b style="color:#e53935;">${perHeadShare}</b></li>
          <li style="margin-bottom:10px;">Your share: <b style="color:#e53935;">${share}</b></li>
          ${
            guestCount > 0
              ? `<li style="margin-bottom:10px;">Guests: <b>${guestCount}</b></li>`
              : ""
          }
          <li style="margin-bottom:10px;">Players: <b>${
            playerCount ?? "Multiple"
          }</b></li>
          <li style="margin-bottom:10px;">Your new balance: <b style="color:${
            updatedBalance < 0 ? "#e53935" : "#4CAF50"
          };">${formattedBalance}</b></li>
        </ul>
      </div>
      <p style="font-size:16px;">You can view your balance and transactions in your dashboard.</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="https://penalty-merchants.vercel.app/" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">Visit Dashboard</a>
      </div>
      <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:20px; text-align:center; color:#757575; font-size:14px;">
        <p>— Penalty Merchants</p>
        <a href="https://penalty-merchants.vercel.app/" style="color:#4CAF50; text-decoration:none;">penalty-merchants.vercel.app</a>
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

export async function sendNotificationEmail(opts: {
  to: string;
  subject: string;
  message: string;
  playerName?: string | null;
}) {
  const { to, subject, message, playerName } = opts;

  const html = `
    <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px; background-color:#f9f9f9;">
      <div style="text-align:center; padding:15px; background-color:#2196F3; color:white; border-radius:5px; margin-bottom:20px;">
        <h2 style="margin:0;">Notification</h2>
      </div>
      <p style="font-size:16px;">Hi <b>${playerName ?? "there"}</b>,</p>
      <div style="background-color:white; padding:15px; border-radius:5px; margin:15px 0; border-left:4px solid #2196F3;">
        <p style="font-size:16px; white-space: pre-wrap;">${message}</p>
      </div>
      <p style="font-size:16px;">You can view your balance and transactions in your dashboard.</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="https://penalty-merchants.vercel.app/" style="background-color:#2196F3; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">Visit Dashboard</a>
      </div>
      <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:20px; text-align:center; color:#757575; font-size:14px;">
        <p>— Penalty Merchants</p>
        <a href="https://penalty-merchants.vercel.app/" style="color:#2196F3; text-decoration:none;">penalty-merchants.vercel.app</a>
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

export async function sendNegativeBalanceEmail(opts: {
  to: string;
  playerName?: string | null;
  balance: string;
}) {
  const { to, playerName, balance } = opts;
  const subject = "Quick heads up about your balance ⚽️";

  const html = `
    <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px; background-color:#f9f9f9;">
      <div style="text-align:center; padding:15px; background-color:#FF7043; color:white; border-radius:5px; margin-bottom:20px;">
        <h2 style="margin:0;">Negative Balance Reminder</h2>
      </div>
      <p style="font-size:16px;">Hi <b>${playerName ?? "there"}</b>,</p>
      <div style="background-color:white; padding:15px; border-radius:5px; margin:15px 0; border-left:4px solid #FF7043;">
        <p style="font-size:16px; margin:0;">Just a quick reminder to let you know your balance is currently negative.</p>
        <p style="font-size:16px; margin-top:10px;">Your current balance is <b style="color:#e53935;">${balance}</b>.</p>
      </div>
      <p style="font-size:16px;">Add money to your balance to avoid any inconvenience.</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="https://penalty-merchants.vercel.app/" style="background-color:#FF7043; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">Check Dashboard</a>
      </div>
      <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:20px; text-align:center; color:#757575; font-size:14px;">
        <p>— Penalty Merchants</p>
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

export async function sendFundRequestEmail(opts: {
  to: string;
  requesterName: string;
  amount: number;
  note?: string;
}) {
  const { to, requesterName, amount, note } = opts;
  const subject = `New Fund Request from ${requesterName}`;
  const formattedAmount = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

  const html = `
    <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px; background-color:#f9f9f9;">
      <div style="text-align:center; padding:15px; background-color:#9C27B0; color:white; border-radius:5px; margin-bottom:20px;">
        <h2 style="margin:0;">New Fund Request</h2>
      </div>
      <p style="font-size:16px;"><b>${requesterName}</b> has requested funds.</p>
      <div style="background-color:white; padding:15px; border-radius:5px; margin:15px 0; border-left:4px solid #9C27B0;">
        <p style="font-size:16px; margin-bottom:10px;">Amount: <b style="color:#4CAF50;">${formattedAmount}</b></p>
        ${
          note
            ? `<p style="font-size:16px; margin-top:0;">Note: <i>${note}</i></p>`
            : ""
        }
      </div>
      <div style="text-align:center; margin:25px 0;">
        <a href="https://penalty-merchants.vercel.app/admin/funds" style="background-color:#9C27B0; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">Review Request</a>
      </div>
      <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:20px; text-align:center; color:#757575; font-size:14px;">
        <p>— Penalty Merchants</p>
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

export async function sendFundApprovedEmail(opts: {
  to: string;
  playerName?: string | null;
  amount: number;
  newBalance: number;
}) {
  const { to, playerName, amount, newBalance } = opts;
  const subject = "Your Fund Request Has Been Approved! ✅";
  
  const formattedAmount = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);
  
  const formattedBalance = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(newBalance);

  const html = `
    <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px; background-color:#f9f9f9;">
      <div style="text-align:center; padding:15px; background-color:#4CAF50; color:white; border-radius:5px; margin-bottom:20px;">
        <h2 style="margin:0;">Fund Request Approved</h2>
      </div>
      <p style="font-size:16px;">Hi <b>${playerName ?? "there"}</b>,</p>
      <p style="font-size:16px;">Great news! Your fund request has been approved.</p>
      <div style="background-color:white; padding:15px; border-radius:5px; margin:15px 0; border-left:4px solid #4CAF50;">
        <p style="font-size:16px; margin-bottom:10px;">Amount Added: <b style="color:#4CAF50;">${formattedAmount}</b></p>
        <p style="font-size:16px; margin-top:0;">Your New Balance: <b style="color:${newBalance < 0 ? "#e53935" : "#4CAF50"};">${formattedBalance}</b></p>
      </div>
      <p style="font-size:16px;">You can view your updated balance and transactions in your dashboard.</p>
      <div style="text-align:center; margin:25px 0;">
        <a href="https://penalty-merchants.vercel.app/" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">View Dashboard</a>
      </div>
      <div style="border-top:1px solid #e0e0e0; padding-top:15px; margin-top:20px; text-align:center; color:#757575; font-size:14px;">
        <p>— Penalty Merchants</p>
        <a href="https://penalty-merchants.vercel.app/" style="color:#4CAF50; text-decoration:none;">penalty-merchants.vercel.app</a>
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
