import Title from '@/components/Admin/Typography/Title';
import FormInput from '@/components/Admin/Form/Input';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import Card from '@/components/Admin/Common/Card';
import { getRoles, getUserById, updateUser } from '../../../actions/user.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Brand Management - Add Brand',
    };
}

export default async function UpdateUserPage({ params }: { params: { id: string } }) {
    const { roles } = await getRoles();
    const { id } = await params;
    const { user } = await getUserById(id);
    return (
        <RoleGuard permission='user_update'>
            <Title title='Add User' breadcrumbs={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'User', href: '/admin/users' },
                { label: 'Add User' }
            ]} />
            {/* Content */}
            <Card>
                <FormWrapper
                    action={updateUser.bind(null, user?.id)}
                    buttonTitle="Update User"
                    successMessage="User update successfully!"
                    href="/admin/users"
                >

                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Role  <span className="text-red-500">*</span>
                        </label>
                        <select name='roleName' defaultValue={user?.roleName || ''} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors">
                            <option value="">Select Role</option>
                            {
                                roles && roles.map(role => {
                                    return (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                    <FormInput
                        label='Enter name'
                        required
                        placeholder="Enter name"
                        name="name"
                        defaultValue={user?.name}
                    />
                    <FormInput
                        label='Enter Email'
                        required
                        placeholder="Enter email"
                        name="email"
                        type='email'
                        defaultValue={user?.email}
                    />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}