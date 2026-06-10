
import FileUpload from '@/components/Admin/FileUpload';
import Title from '@/components/Admin/Typography/Title';
import Card from '@/components/Admin/Common/Card';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormTextarea from '@/components/Admin/Form/Textarea';
import { createGrading } from '../../actions/grade.action';
import { BannerType } from '@prisma/client';
import FormColorPicker from '@/components/Admin/Form/ColorPicker';
import { hasPermission } from '@/lib/auth-utils';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Grade Management - Add Grade',
    };
}
export default async function AddedGradingPage() {

    return (
        // <RoleGuard permission='banner_create'>
        <>
            <Title
                title="Add New Grade"
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: "/admin" },
                        { label: 'Grade', href: "/admin/grading" },
                        { label: 'Add Grade' },
                    ]
                }
            />
            {/* Categories Table */}
            <Card>
                <FormWrapper
                    buttonTitle='Add Grade'
                    href='/admin/grading'
                    successMessage='Grade add successfully'
                    action={createGrading}
                >
                    <FormInput
                        label='Grade Title'
                        required
                        placeholder="Enter Grade Title"
                        name="title"
                    />
                    <FormTextarea
                        label='Enter Grade short description'
                        required
                    />
                </FormWrapper>
            </Card>
        </>
        // </RoleGuard>
    );
}