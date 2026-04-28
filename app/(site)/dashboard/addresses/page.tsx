"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getAddresses, deleteAddress, setDefaultAddress } from "@/lib/action/address.action";
import Button from "@/components/v2/Button";
import AddressModal from "@/components/v2/dashboard/AddressModal";

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  country: string;
  streetAddress: string;
  apartment?: string | null;
  city: string;
  state?: string | null;
  phone: string;
  email: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    const res = await getAddresses();
    setAddresses((res.addresses as Address[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleAddNew = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteAddress(id);
    if (res.success) {
      toast.success("Address deleted");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } else {
      toast.error(res.error || "Failed to delete address");
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    const res = await setDefaultAddress(id);
    if (res.success) {
      toast.success("Default address updated");
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } else {
      toast.error(res.error || "Failed to update default");
    }
    setSettingDefaultId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-2">
            My Addresses
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your shipping and billing locations for faster checkout.
          </p>
        </div>
        <Button variant="primary" icon="add" className="px-6!" onClick={handleAddNew}>
          Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 h-56 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-12 text-center">
          <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl!">location_off</span>
          </div>
          <h3 className="font-black text-[#121714] dark:text-white text-lg mb-2">No addresses yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add a shipping address to speed up your checkout.</p>
          <div className="text-center flex items-center justify-center">
            <Button variant="primary" icon="add" onClick={handleAddNew}>
              Add First Address
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 relative flex flex-col group hover:border-primary/20 transition-all"
            >
              {address.isDefault && (
                <span className="absolute top-6 right-8 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Default
                </span>
              )}

              <div className="size-12 bg-[#f1f4f2] dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#648770] mb-6">
                <span className="material-symbols-outlined">
                  {address.company?.toLowerCase().includes("office") ? "apartment" : "home"}
                </span>
              </div>

              <h3 className="font-black text-[#121714] dark:text-white text-lg mb-2">
                {address.company || "Address"}
              </h3>
              <div className="space-y-1 text-sm text-gray-500 font-medium leading-relaxed">
                <p className="text-[#121714] dark:text-white font-bold">
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.streetAddress}{address.apartment ? `, ${address.apartment}` : ""}</p>
                <p>{address.city}{address.state ? `, ${address.state}` : ""}</p>
                <p>{address.country}</p>
                <p className="pt-1">{address.phone}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-4">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-sm font-bold text-[#121714] dark:text-white hover:text-primary transition-colors"
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={settingDefaultId === address.id}
                    className="text-sm font-bold text-primary hover:underline disabled:opacity-50 transition-colors"
                  >
                    {settingDefaultId === address.id ? "Updating…" : "Set as Default"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="text-sm font-bold text-red-500 hover:underline disabled:opacity-50 transition-colors ml-auto"
                >
                  {deletingId === address.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={selectedAddress}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}
