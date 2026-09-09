import { RoleGuard } from "@/components/Admin/Common/RoleGuard";
import FormWrapper from "@/components/Admin/Form/FormWrapper";
import FormInput from "@/components/Admin/Form/Input";
import prisma from "@/lib/prisma";
import { FLASH_SALE_KEY, parseFlashSale } from "@/lib/flash-sale";
import { saveFlashSale } from "./action";

export const metadata = { title: "Homepage Flash Sale Settings" };

export default async function FlashSalePage() {
  const record = await prisma.setting.findUnique({ where: { key: FLASH_SALE_KEY } });
  const sale = parseFlashSale(record?.value);
  const endLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi",
  }).format(new Date(sale.endsAt));
  return (
    <RoleGuard permission="settings_view">
      <div className="w-full min-w-0">
        <div className="mx-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
          <h1 className="text-base font-bold text-emerald-900">Homepage Flash Sale</h1>
          <p className="mt-1 text-sm leading-6 text-emerald-800">Manage the sale banner and countdown on your homepage. The banner hides automatically when the countdown ends.</p>
        </div>
        <FormWrapper key={record?.value ?? "default"} action={saveFlashSale} buttonTitle="Save Flash Sale" href="/admin/setting/flash-sale">
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm font-semibold text-gray-700">
            <input type="checkbox" name="enabled" defaultChecked={sale.enabled} className="size-5 accent-emerald-600" />
            Show flash sale on homepage
          </label>
          <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">Countdown duration</legend>
            <p className="text-sm text-gray-600">Current end: {endLabel} (Pakistan time).</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput label="Days" name="days" type="number" min={0} max={365} step={1} placeholder="e.g. 7" />
              <FormInput label="Hours" name="hours" type="number" min={0} max={23} step={1} placeholder="e.g. 12" />
            </div>
            <p className="text-sm text-gray-500">Enter a duration to restart the countdown when you save. Leave both fields blank to keep the current end time. Hiding the banner does not pause the countdown.</p>
          </fieldset>
          <FormInput label="Badge text" name="badge" defaultValue={sale.badge} maxLength={40} required />
          <FormInput label="Title" name="title" defaultValue={sale.title} maxLength={120} required />
          <FormInput label="Description" name="description" defaultValue={sale.description} maxLength={500} required />
          <FormInput label="Button text" name="buttonText" defaultValue={sale.buttonText} maxLength={60} required />
          <FormInput label="Button link" name="link" defaultValue={sale.link} placeholder="/shop" maxLength={500} required />
        </FormWrapper>
      </div>
    </RoleGuard>
  );
}
