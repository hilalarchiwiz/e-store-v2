import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import { getProductById, updateProduct } from '../../(actions)/product.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import EditProduct from '../../_components/EditProduct';

export async function generateMetadata() {
    return { title: 'Update Product' };
}

export default async function UpdateProductPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { product } = await getProductById(Number(id));

    return (
        <RoleGuard permission='product_update'>
            <Title title='Update Product' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Products', href: '/admin/products' },
                { label: 'Update Product' }
            ]} />

            <Card>
                <FormWrapper
                    buttonTitle="Update Product"
                    successMessage="Product updated successfully!"
                    href="/admin/products"
                    action={updateProduct.bind(null, product?.id)}
                >
                    <EditProduct product={product} />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}
