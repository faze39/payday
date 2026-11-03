import { getUsdNgn } from "@/lib/fx";

export async function GET() {
  return Response.json({ usdNgn: await getUsdNgn() });
}
