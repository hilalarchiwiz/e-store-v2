
import { Plus, Search, Package } from 'lucide-react';
import { createCategory, getCategories } from '../../(actions)/category.action';
import Form from '@/components/Admin/Form';
import FileUpload from '@/components/Admin/FileUpload';
import { SubmitButton } from '@/components/Admin/SubmitButton';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import Specification from '@/components/Admin/Specification';

export async function generateMetadata() {
    return {
        title: 'Category Management - Add Category',
    };
}
export default async function CategoryPage() {

    return (
        <RoleGuard permission='category_create'>
            <Title
                title="Add New Category"
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: "/admin" },
                        { label: 'Category', href: "/admin/category" },
                        { label: 'Add Category' },
                    ]
                }
            />
            {/* Categories Table */}
            <Card>
                <FormWrapper
                    buttonTitle='Add Category'
                    href='/admin/category'
                    successMessage='Category add successfully'
                    action={createCategory}
                >
                    <FormInput
                        label='Category Title'
                        required
                        placeholder="Enter category name (e.g., Electronics, Clothing)"
                        name="title"
                    />

                    <FormTextarea
                        label='Category Description'
                    />

                    <FileUpload />

                    <Specification />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}