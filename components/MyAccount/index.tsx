"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/features/user-slice";
import toast from "react-hot-toast";
import LoadingModal from "./LoadingModal";
import { useAppSelector } from "@/redux/store";
import Link from "next/link";

const MyAccount = () => {
  const [addressModal, setAddressModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const user = useAppSelector(state => state.userReducer.info);

  const dispatch = useDispatch();

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true); // Open the modal

    try {
      const { error } = await signOut();

      if (error) {
        toast.error(error.message || 'Error logging out');
        setIsLoggingOut(false); // Close modal only if there is an error
      } else {
        dispatch(logoutUser());
        router.push("/signin");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsLoggingOut(false);
    }
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  return (
    <>
      <p className="text-dark">
        Hello {user && user.name} (
        <button onClick={handleSignOut}
          className="text-red ease-out duration-200 hover:underline cursor-pointer"
        >
          Log Out
        </button>
        )
      </p>

      <p className="text-[14px] mt-4">
        From your account dashboard you can view your recent orders,
        manage your shipping and billing addresses, and edit your
        password and account details.
      </p>

      {isLoggingOut && <LoadingModal />}
    </>
  );
};

export default MyAccount;
