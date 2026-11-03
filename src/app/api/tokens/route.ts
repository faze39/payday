import { errorResponse } from "@/lib/http";
import { getCachedTokens } from "@/lib/payments";

export async function GET() {
  try {
    const tokens = await getCachedTokens();
    return Response.json({ tokens: tokens.map(({ assetId, symbol, blockchain, decimals, price }) => ({ assetId, symbol, blockchain, decimals, price })) });
  } catch (err) {
    return errorResponse(err);
  }
}
