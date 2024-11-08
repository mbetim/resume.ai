import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { HttpException } from "./http-exception";
import { AxiosError } from "axios";

export const catchRouteErrors =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorResponse = {
          message: err.issues[0] ? err.issues[0].message : "Campo inválido!",
          issues: err.issues.map(({ message, path }) => {
            return {
              field: path[0],
              message,
            };
          }),
        };

        res.status(400).json(errorResponse);
        return;
      } else if (err instanceof HttpException) {
        res.status(err.status).json({ message: err.message });
        return;
      } else if (err instanceof AxiosError) {
        res.status(err.response?.status ?? 500).json({
          message:
            (err.response?.data as { message?: string }).message ??
            "No `message` attribute",
          response: err.response?.data as unknown,
        });
      }

      console.error(err);

      res.status(500).json({
        message: "Um erro inesperado aconteceu. Tente novamente mais tarde",
      });
    }
  };
