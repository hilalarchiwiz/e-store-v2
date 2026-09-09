import { RoleGuard } from "@/components/Admin/Common/RoleGuard";
import FormWrapper from "@/components/Admin/Form/FormWrapper";
import prisma from "@/lib/prisma";
import { PRODUCT_VISIBILITY_KEY, parseShowOutOfStock } from "@/lib/product-visibility";
import { saveProductVisibility } from "./action";

export const metadata = { title: "Product Visibility Settings" };

export default async function ProductVisibilityPage() {
  const setting = await prisma.setting.findUnique({ where: { key: PRODUCT_VISIBILITY_KEY } });
  const show = parseShowOutOfStock(setting?.value);
  return (
    <RoleGuard permission="settings_view">
      <div className="w-full min-w-0">
        <div className="mx-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <h1 className="text-base font-bold text-emerald-900">Product Visibility</h1>
          <p className="mt-1 text-sm leading-6 text-emerald-800">Choose whether customers can see products with no stock available.</p>
        </div>
        <FormWrapper key={String(show)} action={saveProductVisibility} buttonTitle="Save Product Visibility" href="/admin/setting/product-visibility">
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-semibold text-gray-700">Out-of-stock products</legend>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
              <input type="radio" name="showOutOfStock" value="show" defaultChecked={show} className="mt-1 size-4 accent-emerald-600" />
              <span><span className="block text-sm font-semibold text-gray-800">Show out-of-stock products</span><span className="mt-1 block text-sm text-gray-500">Customers can browse these products, but cannot purchase them until stock is available.</span></span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
              <input type="radio" name="showOutOfStock" value="hide" defaultChecked={!show} className="mt-1 size-4 accent-emerald-600" />
              <span><span className="block text-sm font-semibold text-gray-800">Hide out-of-stock products</span><span className="mt-1 block text-sm text-gray-500">Hide them from the homepage, shop, search, related products, wishlists, recently viewed items, and product pages. Products return when restocked.</span></span>
            </label>
          </fieldset>
          <p className="text-sm leading-6 text-gray-500">Admin inventory, existing carts, and order history are preserved. This setting takes effect on subsequent page loads.</p>
        </FormWrapper>
      </div>
    </RoleGuard>
  );
}
