
import FileUpload from '@/components/Admin/FileUpload';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { getGradingById, updateGrading } from '../../../actions/grade.action';
import FormColorPicker from '@/components/Admin/Form/ColorPicker';

export async function generateMetadata() {
    return {
        title: 'Grade Management - Update grade',
    };
}
export default async function UpdateGradingPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { grading, success } = await getGradingById(id);
    return (
        <>
            <div className="">
                <Title
                    title="Update Grade"
                    breadcrumbs={
                        [
                            { label: 'Dashboard', href: "/admin" },
                            { label: 'Grade', href: "/admin/grading" },
                            { label: 'Update Grade' },
                        ]
                    }
                />
                {/* Categories Table */}
                <Card>
                    <FormWrapper
                        buttonTitle='Update Grade'
                        href='/admin/grading'
                        successMessage='Grade update successfully'
                        action={updateGrading.bind(null, id)}
                    >
                        <FormInput
                            label='Grade Title'
                            required
                            placeholder="Enter Grade Title"
                            name="title"
                            defaultValue={grading?.title}
                        />
                        <FormTextarea
                            label='Enter Grade short description'
                            required
                            defaultValue={grading?.description || ''}
                        />
                    </FormWrapper>
                </Card>
            </div>
        </>
    );
}