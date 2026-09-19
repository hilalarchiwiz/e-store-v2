import type { Metadata } from "next";
import { PRIVATE_PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PRIVATE_PAGE_METADATA;

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
