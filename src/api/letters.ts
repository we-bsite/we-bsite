import type { NextApiRequest, NextApiResponse } from "next";
import { ApiLetter } from "../types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiLetter[]>
) {
  res.status(200).json([]);
}
