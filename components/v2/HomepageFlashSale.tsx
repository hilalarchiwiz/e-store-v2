import prisma from "@/lib/prisma";
import { FLASH_SALE_KEY, parseFlashSale } from "@/lib/flash-sale";
import Countdown from "./Countdown";

export default async function HomepageFlashSale() {
  const record = await prisma.setting.findUnique({ where: { key: FLASH_SALE_KEY } });
  const sale = parseFlashSale(record?.value);
  // Use the request time to render the same initial countdown on server and client.
  // eslint-disable-next-line react-hooks/purity
  const remaining = Math.max(0, Date.parse(sale.endsAt) - Date.now());
  if (!sale.enabled || remaining <= 0) return null;
  return <Countdown key={sale.endsAt} sale={sale} initialRemaining={remaining} />;
}
