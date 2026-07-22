export type ErpSoldReviewDecision =
  | "APPROVED"
  | "REJECTED"
  | "ALREADY_ADJUSTED";

export interface PendingErpSoldItem {
  eventKey: string;
  erpProductId: string;
  erpUniqueId: string | null;
  erpTitle: string;
  erpUpdatedAt: string | null;
  units: number;
  productId: number;
  productTitle: string;
  currentQuantity: number;
}

export interface ErpSoldReviewInput {
  eventKey: string;
  productId: number;
  decision: ErpSoldReviewDecision;
}
