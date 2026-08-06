"use client";

import { Toaster } from "react-hot-toast";
import SwipeableToast from "@/components/v2/SwipeableToast";

export default function ToasterProvider() {
  return (
    <Toaster position="top-center">
      {(t) => <SwipeableToast t={t} />}
    </Toaster>
  );
}
