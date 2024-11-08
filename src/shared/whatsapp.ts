import axios from "axios";
import { env } from "~/env";

const api = axios.create({
  baseURL: "https://graph.facebook.com/v21.0",
  headers: {
    Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
  },
});

export const whatsapp = {
  sendMessage: async (to: string, content: string) => {
    const { data } = await api.post<unknown>("/491199940739841/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        body: content,
      },
    });

    return data;
  },
};
