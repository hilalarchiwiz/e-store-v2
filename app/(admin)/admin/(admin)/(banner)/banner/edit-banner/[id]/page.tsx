
import FileUpload from '@/components/Admin/FileUpload';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { createBanner, getBannerById, updateBanner } from '../../../actions/banner.action';
import { BannerType } from '@prisma/client';
import FormColorPicker from '@/components/Admin/Form/ColorPicker';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Banner Management - Update Banner',
    };
}
export default async function UpdateBannerPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { banner, success, message } = await getBannerById(id);
    return (
        <RoleGuard permission='banner_update'>
            <div className="">
                <Title
                    title="Update Banner"
                    breadcrumbs={
                        [
                            { label: 'Dashboard', href: "/admin" },
                            { label: 'Banner', href: "/admin/banner" },
                            { label: 'Update Banner' },
                        ]
                    }
                />
                {/* Categories Table */}
                <Card>
                    <FormWrapper
                        buttonTitle='Update Banner'
                        href='/admin/banner'
                        successMessage='Banner update successfully'
                        action={updateBanner.bind(null, id)}
                    >
                        <FormInput
                            label='Banner Title'
                            required
                            placeholder="Enter Banner Title"
                            name="title"
                            defaultValue={banner?.title}
                        />
                        <FormTextarea
                            label='Enter Banner short description'
                            required
                            defaultValue={banner?.description || ''}
                        />
                        <FormInput
                            label='Banner Button Text'
                            required
                            placeholder="Enter Banner Button Text"
                            name="buttonText"
                            defaultValue={banner?.buttonText || ''}
                        />
                        <FormInput
                            label='Banner Link'
                            required
                            placeholder="Enter Banner Link"
                            name="link"
                            defaultValue={banner?.link}
                        />
                        <FormColorPicker
                            label="Banner Background Color"
                            name="bgColor"
                            defaultValue={banner?.bgColor}
                        />
                        <FileUpload defaultImageUrl={banner?.imageUrl} />

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Banner Type
                            </label>
                            <div className="flex items-center gap-6">
                                {/* HERO Option */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="bannerType"
                                        defaultValue="HERO"

                                        defaultChecked={banner?.type === "HERO"}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span>Hero</span>
                                </label>

                                {/* PROMO HALF Option */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="bannerType"
                                        defaultValue="PROMO_HALF"
                                        defaultChecked={banner?.type === "PROMO_HALF"}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span>Promo Half</span>
                                </label>
                            </div>
                        </div>
                    </FormWrapper>
                </Card>
            </div>
        </RoleGuard>
    );
}