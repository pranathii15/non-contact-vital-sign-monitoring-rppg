import nodemailer from "nodemailer";


export async function POST(req: Request) {
  const { message, emails } = await req.json(); // 👈 CHANGED

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
},
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: emails.join(","), // 👈 MULTIPLE EMAILS
    subject: "🚨 Vital Alert",
    text: message,
  });

  return Response.json({ success: true });
}