import AddButton from '@/components/Admin/Buttons/AddButton';
import Title from '@/components/Admin/Typography/Title';
import SubTitle from '@/components/Admin/Typography/SubTitle';
import FormInput from '@/components/Admin/Form/Input';
import AdditionalInfo from '@/components/Admin/AdditionalInfo';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import Card from '@/components/Admin/Common/Card';
import { createPage } from '../action/page.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Add Faq Management - list',
    };
}

export default async function AddFaqPage() {

    return (
        <RoleGuard permission='page_create'>
            <Title
                title='Add Page'
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: '/admin' },
                        { label: 'Page', href: '/admin/page' },
                        { label: 'Add Page' },
                    ]
                }
            />
            <Card>
                <FormWrapper
                    action={createPage}
                    buttonTitle="Create Page"
                    href='/admin/page'
                    successMessage="Page created successfully!"
                >
                    <FormInput
                        label="Title"
                        name="title"
                        required
                        placeholder="Enter Page title"
                    />
                    <AdditionalInfo
                        name='content'
                        title='Content'
                    />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}