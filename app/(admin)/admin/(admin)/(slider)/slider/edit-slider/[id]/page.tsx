import FileUpload from '@/components/Admin/FileUpload';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { getSingleSlider, updateSlider } from '../../../(action)/slider.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Slider Management - Add Slider',
    };
}
export default async function UpdateSliderPage({ params }: { params: { id: string } }) {

    const { id } = await params;
    const { slider } = await getSingleSlider(Number(id));
    return (
        <RoleGuard permission='slider_update'>
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
                            label: "Update Slider"
                        }
                    ]
                } />
            {/* Categories Table */}
            <Card>
                <FormWrapper
                    buttonTitle='Update Slider'
                    successMessage='Slider created successfully!'
                    href='/admin/slider'
                    action={updateSlider.bind(null, Number(id))}>
                    <FormInput
                        label='Slider Title'
                        name='title'
                        defaultValue={slider?.title}
                        placeholder='e.g., Summer Sale'
                        required />

                    <FormTextarea
                        label='Slider Description'
                        name='description'
                        defaultValue={slider?.description}
                        placeholder='e.g., Get 20% off on all products'
                        required
                    />

                    <FileUpload defaultImageUrl={slider?.img} />

                    <FormInput
                        label='Slider Link'
                        name='link'
                        placeholder='e.g., https://www.example.com/summer-sale'
                        required
                        defaultValue={slider?.link || ''}
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
                                    defaultChecked={slider?.status === 'active'}
                                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    defaultChecked={slider?.status === 'inactive'}
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