import { type NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) => {
  if (req.method !== "GET")
    return res.status(404).json({ message: "Method not implemented" });

  return res.json({ message: "Hello world" });
};

export default handler;
