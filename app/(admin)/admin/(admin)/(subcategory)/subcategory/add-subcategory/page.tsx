import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import FileUpload from '@/components/Admin/FileUpload';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { createSubCategory, getAllCategoriesForSelect } from '../../(actions)/subcategory.action';

export async function generateMetadata() {
    return { title: 'Sub-Category Management - Add Sub-Category' };
}

export default async function AddSubCategoryPage() {
    const categories = await getAllCategoriesForSelect();

    return (
        <RoleGuard permission="category_create">
            <Title
                title="Add New Sub-Category"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Category', href: '/admin/category' },
                    { label: 'Sub-Category', href: '/admin/subcategory' },
                    { label: 'Add Sub-Category' },
                ]}
            />
            <Card>
                <FormWrapper
                    buttonTitle="Add Sub-Category"
                    href="/admin/subcategory"
                    successMessage="Sub-category added successfully"
                    action={createSubCategory}
                >
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Parent Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="categoryId"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors bg-white"
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <FormInput
                        label="Sub-Category Title"
                        required
                        placeholder="Enter sub-category name (e.g., Laptops, T-Shirts)"
                        name="title"
                    />

                    <FormTextarea label="Sub-Category Description" />

                    <FileUpload />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}
