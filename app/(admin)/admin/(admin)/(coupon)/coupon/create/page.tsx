import { Ticket, Hash, Banknote } from "lucide-react";
import Title from "@/components/Admin/Typography/Title";
import CouponDiscountType from "@/components/Admin/Common/CouponDiscountType";
import { createCoupon } from "../../actions/coupon.actions";
import Card from "@/components/Admin/Common/Card";
import FormWrapper from "@/components/Admin/Form/FormWrapper";
import DatePickerCalender from "@/components/Admin/Form/DatePicker";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export default function CreateCoupon() {
    return (
        <RoleGuard permission="coupon_create">
            <Title
                title="Manage your coupon"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Coupon', href: '/admin/coupon' },
                    { label: 'Create Coupon' }
                ]}
            />

            <Card>
                <FormWrapper
                    buttonTitle="Create Coupon"
                    successMessage="Coupon created successfully!"
                    href="/admin/coupon"
                    action={createCoupon}
                >

                    {/* Row 1: Code and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code</label>
                            <div className="relative">
                                <Ticket className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="e.g. SAVE20"
                                    className="w-full pl-10 pr-4  py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                            <select name="isActive" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <CouponDiscountType />

                    {/* Row 3: Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Purchase (Rs)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                <input type="number" name="minPurchase" className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors" placeholder="None" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount (Rs)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                <input type="number" name="maxPurchase" className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors" placeholder="None" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Limit</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                <input type="number" name="usageLimit" className="w-full pl-9 pr-4  py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Infinite" />
                            </div>
                        </div>
                    </div>
                    <DatePickerCalender />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}