import { type NextApiHandler } from "next";
import { z } from "zod";
import { env } from "~/env";
import { whatsapp } from "~/whatsapp";
import { catchRouteErrors } from "~/shared/catch-route-errors";

const whatsAppQuerySchema = z.object({
  "hub.mode": z.literal("subscribe", { message: "Invalid mode" }),
  "hub.verify_token": z.literal(env.WHATSAPP_VERIFY_TOKEN, {
    message: "Invalid verification token",
  }),
  "hub.challenge": z.string(),
});

const whatsAppMessageSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      "audio",
      "button",
      "document",
      "text",
      "image",
      "interactive",
      "order",
      "sticker",
      "system",
      "unknown",
      "video",
    ]),
    audio: z
      .object({
        id: z.string(),
        mime_type: z.string(),
      })
      .optional(),
    from: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.type === "audio" && !val.audio)
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An audio is required when the `type` is 'audio'",
        path: ["audio"],
      });
  });

const whatsAppWebhookPayload = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messages: z.array(whatsAppMessageSchema),
          }),
          field: z.literal("messages"),
        }),
      ),
    }),
  ),
});

const handleMessage = async (
  message: z.infer<typeof whatsAppMessageSchema>,
) => {
  if (message.type !== "audio") {
    await whatsapp.sendMessage(
      message.from,
      "Por favor, envie uma mensagem de áudio",
    );
    return;
  }

  await whatsapp.sendMessage(
    message.from,
    `Sua mensagem foi recebida com sucesso`,
  );
};

const handler: NextApiHandler = async (req, res) => {
  console.log("> Incoming message", {
    query: req.query,
    body: req.body as unknown,
  });

  if (req.method === "GET") {
    const values = whatsAppQuerySchema.parse(req.query);
    return res.send(values["hub.challenge"]);
  }

  if (req.method === "POST") {
    const values = whatsAppWebhookPayload.parse(req.body);

    for (const entry of values.entry) {
      for (const change of entry.changes) {
        const [message] = change.value.messages;

        if (!message) continue;

        await handleMessage(message);
      }
    }

    return res.json({ message: "Hello world" });
  }

  return res.status(404).json({ message: "Method not implemented" });
};

export default catchRouteErrors(handler);
