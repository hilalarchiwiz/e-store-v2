import Card from '@/components/Admin/Common/Card';
import FileUpload from '@/components/Admin/FileUpload';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import Title from '@/components/Admin/Typography/Title';
import generateSession from '@/lib/generate-session';
import { changePassword } from '../actions/update-profile.action';

export async function generateMetadata() {
    return {
        title: 'Brand Management - Add Brand',
    };
}

export default async function ChangePasswordPage() {
    return (
        <div>
            <Title title='Change Password' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Change Password' }
            ]} />
            {/* Content */}
            <Card>
                <FormWrapper
                    action={changePassword}
                    buttonTitle="Change Password"
                    successMessage="Change password successfully!"
                    href="/admin/update-profile/change-password"
                >
                    {/* Brand Title */}
                    <FormInput
                        label='Current Password'
                        required
                        placeholder="Enter current Password"
                        name="currentPassword"
                        type='password'
                    />
                    <FormInput
                        label='New Password'
                        required
                        placeholder="Enter new Password"
                        name="newPassword"
                        type='password'
                    />
                    <FormInput
                        label='Confirm Password'
                        required
                        placeholder="Enter confirm Password"
                        name="confirmPassword"
                        type='password'
                    />
                </FormWrapper>
            </Card>
        </div>
    );
}