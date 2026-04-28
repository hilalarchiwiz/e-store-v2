import { createBrand } from '../../(actions)/brand.action';
import Title from '@/components/Admin/Typography/Title';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import Card from '@/components/Admin/Common/Card';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Brand Management - Add Brand',
    };
}

export default async function brandPage() {
    return (
        <RoleGuard permission='brand_create'>
            <Title title='Add Brand' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Brand', href: '/admin/brand' },
                { label: 'Add Brand' }
            ]} />
            {/* Content */}
            <Card>
                <FormWrapper
                    action={createBrand}
                    buttonTitle="Create Brand"
                    successMessage="Brand created successfully!"
                    href="/admin/brand"
                >
                    {/* Brand Title */}
                    <FormInput
                        label='Brand Title'
                        required
                        placeholder="Enter brand name (e.g., Nike, Adidas)"
                        name="title"
                    />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}