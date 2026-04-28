import Title from '@/components/Admin/Typography/Title';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import Card from '@/components/Admin/Common/Card';
import { createRole } from '../../actions/role.action';
import PermissionSelector from '@/components/Admin/Form/PermissionSelector';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Role Management - Add Role',
    };
}

export default async function CreateRolePage() {
    return (
        <RoleGuard permission='role_create'>
            <Title title='Add Role' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Role', href: '/admin/role' },
                { label: 'Add Role' }
            ]} />
            {/* Content */}
            <Card>
                <FormWrapper
                    action={createRole}
                    buttonTitle="Create Role"
                    successMessage="Role created successfully!"
                    href="/admin/role"
                >
                    {/* Brand Title */}
                    <FormInput
                        label='Enter name'
                        required
                        placeholder="Enter name"
                        name="name"
                    />
                    <PermissionSelector />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}