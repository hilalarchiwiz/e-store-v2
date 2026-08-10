import React, { useState } from "react";
import Image from "next/image";
import { CardSim, IdCard } from "lucide-react";

const PaymentMethod = ({ paymentMethod, setPaymentMethod }) => {

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          <label htmlFor="card" className="flex cursor-pointer select-none items-center gap-4">
            <div className="relative">
              <input
                type="checkbox"
                name="card"
                id="card"
                className="sr-only"
                onChange={() => setPaymentMethod("CREDIT_CARD")}
              />
              <div className={`flex h-4 w-4 items-center justify-center rounded-full ${paymentMethod === "CREDIT_CARD" ? "border-4 border-blue" : "border border-gray-4"
                }`}></div>
            </div>

            <div className={`rounded-md border-[0.5px] py-3.5 px-5 min-w-[240px] ${paymentMethod === "CREDIT_CARD" ? "border-transparent bg-gray-2" : "border-gray-4 shadow-1"
              }`}>
              <div className="flex items-center">
                <div className="pr-2.5">
                  <CardSim />
                </div>
                <div className="border-l border-gray-4 pl-2.5">
                  <p>Credit / Debit Card</p>
                </div>
              </div>
            </div>
          </label>
          <label
            htmlFor="bank"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="bank"
                id="bank"
                className="sr-only"
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${paymentMethod === "BANK_TRANSFER"
                  ? "border-4 border-blue"
                  : "border border-gray-4"
                  }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none ${paymentMethod === "BANK_TRANSFER"
                ? "border-transparent bg-gray-2"
                : " border-gray-4 shadow-1"
                }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image unoptimized src="/images/checkout/bank.svg" alt="bank" width={29} height={12} />
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Direct bank transfer</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="cash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="cash"
                id="cash"
                className="sr-only"
                onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${paymentMethod === "CASH_ON_DELIVERY"
                  ? "border-4 border-blue"
                  : "border border-gray-4"
                  }`}
              ></div>
            </div>

            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${paymentMethod === "CASH_ON_DELIVERY"
                ? "border-transparent bg-gray-2"
                : " border-gray-4 shadow-1"
                }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image unoptimized src="/images/checkout/cash.svg" alt="cash" width={21} height={21} />
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Cash on delivery</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="paypal"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="paypal"
                id="paypal"
                className="sr-only"
                onChange={() => setPaymentMethod("PAYPAL")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${paymentMethod === "PAYPAL"
                  ? "border-4 border-blue"
                  : "border border-gray-4"
                  }`}
              ></div>
            </div>
            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${paymentMethod === "PAYPAL"
                ? "border-transparent bg-gray-2"
                : " border-gray-4 shadow-1"
                }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/paypal.svg" alt="paypal" width={75} height={20} />
                </div>

                <div className="border-l border-gray-4 pl-2.5">
                  <p>Paypal</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
