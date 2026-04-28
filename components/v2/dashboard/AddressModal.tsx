"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createAddress, updateAddress, type AddressData } from "@/lib/action/address.action";
import Button from "@/components/v2/Button";
import Input from "@/components/v2/Input";

interface Address extends Omit<AddressData, 'company' | 'apartment' | 'state'> {
  id: string;
  isDefault: boolean;
  company?: string | null;
  apartment?: string | null;
  state?: string | null;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  onSuccess: () => void;
}

const COUNTRIES = [
  "Pakistan", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "India", "UAE", "Saudi Arabia", "Other",
];

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, address, onSuccess }) => {
  const isEdit = !!address;
  const [isLoading, setIsLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    setIsDefault(address?.isDefault ?? false);
  }, [address]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const data: AddressData = {
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      company: (fd.get("company") as string) || undefined,
      country: fd.get("country") as string,
      streetAddress: fd.get("streetAddress") as string,
      apartment: (fd.get("apartment") as string) || undefined,
      city: fd.get("city") as string,
      state: (fd.get("state") as string) || undefined,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      isDefault,
    };

    try {
      const res = isEdit
        ? await updateAddress(address.id, data)
        : await createAddress(data);

      if (!res.success) {
        toast.error(res.error || "Failed to save address");
      } else {
        toast.success(isEdit ? "Address updated!" : "Address added!");
        onSuccess();
        onClose();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-[#1a251d] rounded-[2.5rem] shadow-2xl pointer-events-auto border border-primary/10 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl!">
                        {isEdit ? "edit_location" : "add_location"}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#121714] dark:text-white">
                        {isEdit ? "Edit Address" : "Add New Address"}
                      </h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        {isEdit ? "Update your shipping details" : "Save a new delivery spot"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="size-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        name="company"
                        label="Address Label (e.g. Home, Office)"
                        placeholder="Home"
                        defaultValue={address?.company ?? ""}
                        icon="label"
                        disabled={isLoading}
                      />
                    </div>

                    <Input
                      name="firstName"
                      label="First Name"
                      placeholder="John"
                      defaultValue={address?.firstName ?? ""}
                      icon="person"
                      required
                      disabled={isLoading}
                    />
                    <Input
                      name="lastName"
                      label="Last Name"
                      placeholder="Doe"
                      defaultValue={address?.lastName ?? ""}
                      icon="person"
                      required
                      disabled={isLoading}
                    />

                    <Input
                      name="phone"
                      label="Phone Number"
                      placeholder="+92 300 0000000"
                      defaultValue={address?.phone ?? ""}
                      icon="call"
                      required
                      disabled={isLoading}
                    />
                    <Input
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue={address?.email ?? ""}
                      icon="mail"
                      required
                      disabled={isLoading}
                    />

                    <div className="md:col-span-2">
                      <Input
                        name="streetAddress"
                        label="Street Address"
                        placeholder="123 Main Street"
                        defaultValue={address?.streetAddress ?? ""}
                        icon="location_on"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        name="apartment"
                        label="Apartment / Suite (optional)"
                        placeholder="Apt 4B"
                        defaultValue={address?.apartment ?? ""}
                        icon="door_front"
                        disabled={isLoading}
                      />
                    </div>

                    <Input
                      name="city"
                      label="City"
                      placeholder="Karachi"
                      defaultValue={address?.city ?? ""}
                      icon="apartment"
                      required
                      disabled={isLoading}
                    />
                    <Input
                      name="state"
                      label="State / Province"
                      placeholder="Sindh"
                      defaultValue={address?.state ?? ""}
                      icon="map"
                      disabled={isLoading}
                    />

                    <div className="md:col-span-2 w-full space-y-2">
                      <label className="block text-sm font-bold text-[#121714] dark:text-white">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">
                          public
                        </span>
                        <select
                          name="country"
                          required
                          defaultValue={address?.country ?? ""}
                          disabled={isLoading}
                          className="w-full bg-background-light dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#121714] dark:text-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 appearance-none"
                        >
                          <option value="" disabled>Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <input
                      type="checkbox"
                      id="default-address"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="size-5 rounded border-gray-300 accent-primary"
                    />
                    <label
                      htmlFor="default-address"
                      className="text-sm font-bold text-[#121714] dark:text-white cursor-pointer"
                    >
                      Set as default shipping address
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                    <Button type="button" variant="secondary" fullWidth onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" icon="save" fullWidth isLoading={isLoading}>
                      {isEdit ? "Save Changes" : "Add Address"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;
