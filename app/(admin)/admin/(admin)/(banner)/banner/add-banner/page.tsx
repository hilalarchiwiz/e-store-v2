
import FileUpload from '@/components/Admin/FileUpload';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { createBanner } from '../../actions/banner.action';
import { BannerType } from '@prisma/client';
import FormColorPicker from '@/components/Admin/Form/ColorPicker';
import { hasPermission } from '@/lib/auth-utils';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Category Management - Add Category',
    };
}
export default async function CategoryPage() {

    return (
        <RoleGuard permission='banner_create'>
            <Title
                title="Add New Banner"
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: "/admin" },
                        { label: 'Banner', href: "/admin/banner" },
                        { label: 'Add Banner' },
                    ]
                }
            />
            {/* Categories Table */}
            <Card>
                <FormWrapper
                    buttonTitle='Add Banner'
                    href='/admin/banner'
                    successMessage='Banner add successfully'
                    action={createBanner}
                >
                    <FormInput
                        label='Banner Title'
                        required
                        placeholder="Enter Banner Title"
                        name="title"
                    />
                    <FormTextarea
                        label='Enter Banner short description'
                        required
                    />
                    <FormInput
                        label='Banner Button Text'
                        required
                        placeholder="Enter Banner Button Text"
                        name="buttonText"
                    />
                    <FormInput
                        label='Banner Link'
                        required
                        placeholder="Enter Banner Link"
                        name="link"
                    />
                    <FormColorPicker
                        label="Banner Background Color"
                        name="bgColor"
                    />
                    <FileUpload />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Banner Type
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="bannerType"
                                    defaultValue={BannerType.HERO}
                                    defaultChecked
                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700">Hero</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="bannerType"
                                    defaultValue={BannerType.PROMO_HALF}
                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700">Promo Half</span>
                            </label>
                        </div>
                    </div>
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}