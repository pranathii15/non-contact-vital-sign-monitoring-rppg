import Twilio from "twilio";

export async function POST(req: Request) {
  const { message, phone } = await req.json();

  const client = Twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
  );

  await client.messages.create({
    body: message,
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
  });

  return Response.json({ success: true });
}

// import twilio from "twilio";

// export async function POST(req: Request) {
//   const { message, phone } = await req.json();

//   const client = twilio(
//     process.env.TWILIO_SID,
//     process.env.TWILIO_AUTH
//   );

//   await client.messages.create({
//     body: message,
//     from: "whatsapp:+14155238886", // Twilio sandbox
//     to: `whatsapp:${phone}`,
//   });

//   return Response.json({ success: true });
// }