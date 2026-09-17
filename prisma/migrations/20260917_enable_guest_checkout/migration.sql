-- Allow checkout addresses and orders to belong to guests.
ALTER TABLE "Address" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- Bind guest orders to the same anonymous browser identity used by the cart.
ALTER TABLE "Order" ADD COLUMN "anonymousId" TEXT;
CREATE INDEX "Order_anonymousId_idx" ON "Order"("anonymousId");
