"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useSession, updateUser } from "@/lib/auth-client";
import { uploadImage } from "@/lib/action/FileUpload";
import Button from "@/components/v2/Button";
import Input from "@/components/v2/Input";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.image) setImageUrl(user.image);
  }, [user?.name, user?.image]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    setImageUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const result = await uploadImage(formData);

      if (!result.url) {
        toast.error("Image upload failed");
        setImageUrl(user?.image ?? null);
        return;
      }

      // Save to profile right away
      const res = await updateUser({ image: result.url });
      if (res.error) {
        toast.error(res.error.message || "Failed to save image");
        setImageUrl(user?.image ?? null);
      } else {
        setImageUrl(result.url);
        toast.success("Profile photo updated!");
      }
    } catch {
      toast.error("An unexpected error occurred");
      setImageUrl(user?.image ?? null);
    } finally {
      setIsUploading(false);
      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = profileSchema.safeParse({ name });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      Object.entries(result.error.flatten().fieldErrors).forEach(([key, val]) => {
        if (val && val.length > 0) fieldErrors[key] = val[0];
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await updateUser({ name });
      if (res.error) {
        toast.error(res.error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const avatarSrc =
    imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? "User")}&background=2d6a4f&color=fff&size=128`;

  if (isPending) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-2">
          Account Details
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Keep your personal information up to date.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="relative size-32 rounded-[2.5rem] overflow-hidden border-4 border-primary/10 shadow-xl group disabled:opacity-70"
            >
              <img
                src={avatarSrc}
                alt={user?.name ?? "Avatar"}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                {isUploading ? (
                  <span className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-3xl!">photo_camera</span>
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              {isUploading ? "Uploading..." : "Change Photo"}
            </p>
          </div>

          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  id="name"
                  name="name"
                  label="Full Name"
                  icon="person"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  icon="mail"
                  value={user?.email ?? ""}
                  readOnly
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                  Email address cannot be changed here.
                </p>
              </div>

              <div className="md:col-span-2 pt-2">
                <Button
                  variant="primary"
                  icon="save"
                  className="px-12!"
                  type="submit"
                  isLoading={isLoading}
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
