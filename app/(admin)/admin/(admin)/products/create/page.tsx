import OptimizedGetAllBrands from '@/components/Admin/Brand';
import OptimizedGetAllCategory from '@/components/Admin/Category';
import { createProduct } from '../(actions)/product.action';
import UploadMultipleFiles from '@/components/Admin/UploadMultipleFiles';
import Specification from '@/components/Admin/Specification';
import AdditionalInfo from '@/components/Admin/AdditionalInfo';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import FormTextarea from '@/components/Admin/Form/Textarea';
import FontPicker from '@/components/Common/FontPicker';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import CreateProduct from '../_components/CreateProduct';

export async function generateMetadata() {
    return {
        title: 'Create Product',
    };
}


export default function CreateProductPage() {
    return (
        <RoleGuard permission='product_create'>
            <Title title='Add Product' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Products', href: '/admin/products' },
                { label: 'Add Product' }
            ]} />

            <Card>
                <FormWrapper
                    buttonTitle="Create Product"
                    successMessage="Product created successfully!"
                    href="/admin/products"
                    action={createProduct} >

                    <CreateProduct />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}