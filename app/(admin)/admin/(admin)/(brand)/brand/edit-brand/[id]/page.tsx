import Title from '@/components/Admin/Typography/Title';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import { getBrandById, updateBrand } from '../../../(actions)/brand.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';

export async function generateMetadata() {
    return {
        title: 'Brand Management - Add Brand',
    };
}

export default async function brandPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { brand } = await getBrandById(id);

    if (!brand) {
        return <RecordNotFound />;
    }

    return (
        <RoleGuard permission='banner_update'>
            <Title title='Add Brand' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Brand', href: '/admin/brand' },
                { label: 'Add Brand' }
            ]} />
            {/* Content */}
            <div className="px-4 py-8">
                {/* Form Container */}
                <div className="w-full bg-white rounded-xl overflow-hidden">
                    <div className="py-2">
                        <FormWrapper
                            action={updateBrand.bind(null, brand.id)}
                            buttonTitle="Update Brand"
                            successMessage="Brand created successfully!"
                            href="/admin/brand"
                        >
                            {/* Brand Title */}
                            <FormInput
                                label='Brand Title'
                                defaultValue={brand.title}
                                required
                                placeholder="Enter brand name (e.g., Nike, Adidas)"
                                name="title"
                            />
                        </FormWrapper>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}