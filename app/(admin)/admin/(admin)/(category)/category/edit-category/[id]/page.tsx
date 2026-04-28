
import FileUpload from '@/components/Admin/FileUpload';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { getCategoryById, updateCategory } from '../../../(actions)/category.action';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import Specification from '@/components/Admin/Specification';

export async function generateMetadata() {
    return {
        title: 'Category Management - Update Category',
    };
}
export default async function UpdateCategoryPage({ params }: { params: { id: string } }) {

    const { id } = await params;
    const { category, success, message } = await getCategoryById(id);

    if (!category && !success) {
        return <RecordNotFound message={message} />
    }
    return (
        <RoleGuard permission='category_update'>
            <Title
                title="Update Category"
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: "/admin" },
                        { label: 'Category', href: "/admin/category" },
                        { label: 'Update Category' },
                    ]
                }
            />
            {/* Categories Table */}
            <Card>
                <FormWrapper
                    buttonTitle='Update Category'
                    href='/admin/category'
                    successMessage='Category add successfully'
                    action={updateCategory.bind(null, category?.id)}
                >
                    <FormInput
                        label='Category Title'
                        defaultValue={category?.title}
                        required
                        placeholder="Enter category name (e.g., Electronics, Clothing)"
                        name="title"
                    />

                    <FormTextarea
                        defaultValue={category?.description || ''}
                        label='Category Description'
                    />

                    <FileUpload defaultImageUrl={category?.img} />
                    <Specification defaultSpecs={category?.specifications} />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}