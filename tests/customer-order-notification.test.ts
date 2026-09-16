import assert from "node:assert/strict";
import test from "node:test";
import { OrderStatus } from "@prisma/client";
import { notifyCustomerOrderStatus, type CustomerOrderUpdate } from "../lib/customer-order-notification";

const order: CustomerOrderUpdate = {
  orderNumber: "ORD-123",
  status: "CONFIRMED",
  billingAddress: { email: "buyer@example.com", firstName: "Ali <script>" },
  user: { email: "account@example.com", name: "Ali" },
};

test("each changed status sends one customer email with the order number and escaped name", async () => {
  for (const status of Object.values(OrderStatus)) {
    const messages: any[] = [];
    const warning = await notifyCustomerOrderStatus(status === "PENDING" ? "PROCESSING" : "PENDING", { ...order, status }, async message => { messages.push(message); });
    assert.equal(warning, undefined);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].to, "buyer@example.com");
    assert.ok(messages[0].subject.includes("ORD-123"));
    assert.ok(messages[0].subject.includes(status.toLowerCase()));
    assert.ok(messages[0].html.includes("Ali &lt;script&gt;"));
    assert.ok(!messages[0].html.includes("Ali <script>"));
  }
});

test("saving an unchanged status does not send an email", async () => {
  await notifyCustomerOrderStatus("CONFIRMED", order, async () => { assert.fail("Unexpected email"); });
});

test("falls back to the account email when billing email is invalid", async () => {
  let recipient;
  await notifyCustomerOrderStatus("PENDING", { ...order, billingAddress: { ...order.billingAddress, email: "invalid" } }, async message => { recipient = message.to; });
  assert.equal(recipient, "account@example.com");
});

test("missing recipient and SMTP failure return warnings without throwing", async () => {
  const invalid = { ...order, billingAddress: { ...order.billingAddress, email: "" }, user: { ...order.user, email: "" } };
  assert.match((await notifyCustomerOrderStatus("PENDING", invalid, async () => { assert.fail("Unexpected email"); }))!, /no valid customer email/);
  assert.match((await notifyCustomerOrderStatus("PENDING", order, async () => { throw new Error("SMTP error"); }))!, /order was saved.*could not be sent/);
});
