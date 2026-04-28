import FileUpload from '@/components/Admin/FileUpload';
import { SubmitButton } from '@/components/Admin/SubmitButton';
import { createSlider } from '../../(action)/slider.action';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Slider Management - Add Slider',
    };
}
export default async function AddSliderPage() {

    return (
        <RoleGuard permission='slider_create'>
            <Title title="Add Slider"
                breadcrumbs={
                    [
                        {
                            label: "Dashboard", href: "/admin"
                        },
                        {
                            label: "Slider", href: "/admin/slider"
                        },
                        {
                            label: "Add Slider"
                        }
                    ]
                } />
            {/* Categories Table */}
            <Card>
                <FormWrapper
                    buttonTitle='Create Slider'
                    successMessage='Slider created successfully!'
                    href='/admin/slider'
                    action={createSlider}>
                    <FormInput
                        label='Slider Title'
                        name='title'
                        placeholder='e.g., Summer Sale'
                        required />

                    <FormTextarea
                        label='Slider Description'
                        name='description'
                        placeholder='e.g., Get 20% off on all products'
                        required
                    />

                    <FileUpload />

                    <FormInput
                        label='Slider Link'
                        name='link'
                        placeholder='e.g., https://www.example.com/summer-sale'
                        required
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    defaultChecked
                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700">Inactive</span>
                            </label>
                        </div>
                    </div>
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}