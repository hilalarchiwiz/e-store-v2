ALTER TABLE "Order"
ADD COLUMN "discountInput" TEXT,
ADD COLUMN "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Order"
SET "amountPaid" = "total"
WHERE "paymentStatus" = 'PAID';
