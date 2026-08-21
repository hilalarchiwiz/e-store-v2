import FileUpload from "@/components/Admin/FileUpload";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";
import FormColorPicker from "@/components/Admin/Form/ColorPicker";
import FormWrapper from "@/components/Admin/Form/FormWrapper";
import FormInput from "@/components/Admin/Form/Input";
import prisma from "@/lib/prisma";
import { getSetting, updateSettings } from "../actions/setting.action";

export const metadata = {
  title: "Shop Page Banner Settings",
};

export default async function ShopBannerSettingsPage() {
  const [{ setting }, currentBanner] = await Promise.all([
    getSetting("shop_banner"),
    prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const currentImage = setting?.image || currentBanner?.imageUrl;
  const currentTitle = setting?.title || currentBanner?.title || "Shop banner";
  const currentLink = setting?.link || currentBanner?.link || "/shop";
  const currentBgColor =
    setting?.bgColor || currentBanner?.bgColor || "#F2F3F2";

  return (
    <RoleGuard permission="settings_view">
      <div className="w-full">
        <div className="mt-1 md:-mt-4">
          <div className="mx-4 mb-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
            <h1 className="text-base font-bold text-emerald-900">
              Shop Page Banner
            </h1>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              This image appears above the categories on the shop page. Upload
              the complete banner design here; wide, square, and tall images are
              supported without cropping.
            </p>
          </div>

          <FormWrapper
            action={updateSettings.bind(
              null,
              "shop_banner",
              "/admin/setting/shop-banner",
            )}
            buttonTitle="Update Shop Banner"
            successMessage="Shop banner updated successfully"
            href="/admin/setting/shop-banner"
          >
            <FileUpload
              title="Shop banner image"
              name="image"
              defaultImageUrl={currentImage}
              aspectRatio={16 / 5}
              allowAspectSelection={false}
            />
            <FormInput
              label="Banner image description"
              name="title"
              required
              placeholder="The perfect laptop for work and play"
              defaultValue={currentTitle}
            />
            <FormInput
              label="Banner click link"
              name="link"
              required
              placeholder="/shop or /shop?category=2"
              defaultValue={currentLink}
            />
            <FormColorPicker
              label="Banner background color"
              name="bgColor"
              defaultValue={currentBgColor}
            />
          </FormWrapper>
        </div>
      </div>
    </RoleGuard>
  );
}
