import Card from '@/components/Admin/Common/Card';
import FileUpload from '@/components/Admin/FileUpload';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import Title from '@/components/Admin/Typography/Title';
import generateSession from '@/lib/generate-session';
import { updateProfile } from './actions/update-profile.action';

export async function generateMetadata() {
    return {
        title: 'Brand Management - Add Brand',
    };
}

export default async function UpdateProfilePage() {
    const session = await generateSession();
    const user = session?.user;
    return (
        <div>
            <Title title='Update profile' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Update Profile' }
            ]} />
            {/* Content */}
            <Card>
                <FormWrapper
                    action={updateProfile}
                    buttonTitle="Update Profile"
                    successMessage="Update Profile successfully!"
                    href="/admin/update-profile"
                >
                    {/* Brand Title */}
                    <FormInput
                        label='Enter name'
                        required
                        placeholder="Enter name"
                        name="name"
                        defaultValue={user?.name}
                    />
                    <FileUpload defaultImageUrl={user?.image} />
                </FormWrapper>
            </Card>
        </div>
    );
}