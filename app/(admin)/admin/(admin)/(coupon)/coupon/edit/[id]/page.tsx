import { Ticket, Hash, Banknote } from "lucide-react";
import Title from "@/components/Admin/Typography/Title";
import CouponDiscountType from "@/components/Admin/Common/CouponDiscountType";
import Card from "@/components/Admin/Common/Card";
import FormWrapper from "@/components/Admin/Form/FormWrapper";
import DatePickerCalender from "@/components/Admin/Form/DatePicker";
import { getCouponById, updateCoupon } from "../../../actions/coupon.actions";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export default async function UpdateCoupon({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { coupon } = await getCouponById(id);
    return (
        <RoleGuard permission="banner_update">
            <Title
                title="Manage your coupon"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Coupon', href: '/admin/coupon' },
                    { label: 'Edit Coupon' }
                ]}
            />

            <Card>
                <FormWrapper
                    buttonTitle="Update Coupon"
                    successMessage="Coupon update successfully!"
                    href="/admin/coupon"
                    action={updateCoupon.bind(null, coupon.id)}
                >

                    {/* Row 1: Code and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code</label>
                            <div className="relative">
                                <Ticket className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    defaultValue={coupon.code}
                                    name="code"
                                    placeholder="e.g. SAVE20"
                                    className="w-full pl-10 pr-4  py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                            <select name="isActive" defaultValue={coupon.isActive} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <CouponDiscountType initialType={coupon.discountType}
                        initialValue={coupon.discount} />

                    {/* Row 3: Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Purchase (Rs)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                <input type="number" defaultValue={coupon.minPurchase} name="minPurchase" className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors" placeholder="None" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount (Rs)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                <input type="number" name="maxPurchase" defaultValue={coupon.maxDiscount} className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors" placeholder="None" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Limit</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                <input type="number" name="usageLimit" defaultValue={coupon.usageLimit} className="w-full pl-9 pr-4  py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Infinite" />
                            </div>
                        </div>
                    </div>
                    <DatePickerCalender defaultValue={coupon.expiresAt} />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}