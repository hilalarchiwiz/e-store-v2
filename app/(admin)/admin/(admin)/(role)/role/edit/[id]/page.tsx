import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import Card from '@/components/Admin/Common/Card';
import Title from '@/components/Admin/Typography/Title';
import { getRoleById, updateRole } from '../../../actions/role.action';
import PermissionSelector from '@/components/Admin/Form/PermissionSelector';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { role, success } = await getRoleById(id);
    return {
        title: `Role Management  - Update Role ${role && success ? role.name : "Not found"}`,
    };
}

export default async function EditRolePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { role, success } = await getRoleById(id);

    if (!success || !role) {
        redirect('/admin/role');
    }

    return (
        <RoleGuard permission='role_update'>
            <Title
                title={`Edit Role: ${role.name}`}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Roles', href: '/admin/role' },
                    { label: 'Edit Role' }
                ]}
            />

            <Card>
                <FormWrapper
                    action={updateRole.bind(null, role.id)} // Pass ID to the action
                    buttonTitle="Update Role"
                    successMessage="Role updated successfully!"
                    href="/admin/role"
                >
                    <div className="space-y-4">
                        <FormInput
                            label="Role Name"
                            name="name"
                            defaultValue={role.name}
                            required
                        />

                        <PermissionSelector initialPermissions={role.permissions} />
                    </div>
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}