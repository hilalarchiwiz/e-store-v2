import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import FileUpload from '@/components/Admin/FileUpload';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { getAllCategoriesForSelect, getSubCategoryById, updateSubCategory } from '../../../(actions)/subcategory.action';

export async function generateMetadata() {
    return { title: 'Sub-Category Management - Update Sub-Category' };
}

export default async function EditSubCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { subCategory, success, message } = await getSubCategoryById(id);

    if (!success || !subCategory) {
        return <RecordNotFound message={message} />;
    }

    const categories = await getAllCategoriesForSelect();

    return (
        <RoleGuard permission="category_update">
            <Title
                title="Update Sub-Category"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Category', href: '/admin/category' },
                    { label: 'Sub-Category', href: '/admin/subcategory' },
                    { label: 'Update Sub-Category' },
                ]}
            />
            <Card>
                <FormWrapper
                    buttonTitle="Update Sub-Category"
                    href="/admin/subcategory"
                    successMessage="Sub-category updated successfully"
                    action={updateSubCategory.bind(null, subCategory.id)}
                >
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Parent Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="categoryId"
                            required
                            defaultValue={subCategory.categoryId}
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
                        defaultValue={subCategory.title}
                        required
                        placeholder="Enter sub-category name"
                        name="title"
                    />

                    <FormTextarea
                        label="Sub-Category Description"
                        defaultValue={subCategory.description || ''}
                    />

                    <FileUpload defaultImageUrl={subCategory.img || ''} />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}
