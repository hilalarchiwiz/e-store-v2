'use client';
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import ordersData from "./ordersData";

const Orders = ({ orders }) => {
  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* <!-- order item --> */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[111px]">
                <p className="text-[14px] text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-[14px] text-dark">Date</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-[14px] text-dark">Status</p>
              </div>

              <div className="min-w-[213px]">
                <p className="text-[14px] text-dark">Title</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-[14px] text-dark">Total</p>
              </div>
            </div>
          )}
          {orders.length > 0 ? (
            orders.map((orderItem, key) => (
              <SingleOrder key={key} orderItem={orderItem} smallView={false} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              You don&apos;t have any orders!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((orderItem, key) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
