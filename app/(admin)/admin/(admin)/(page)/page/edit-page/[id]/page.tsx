import AddButton from '@/components/Admin/Buttons/AddButton';
import Title from '@/components/Admin/Typography/Title';
import SubTitle from '@/components/Admin/Typography/SubTitle';
import FormInput from '@/components/Admin/Form/Input';
import AdditionalInfo from '@/components/Admin/AdditionalInfo';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import Card from '@/components/Admin/Common/Card';
import { getPageById, updatePage } from '../../action/page.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Update Faq Management - list',
    };
}

export default async function EditFaqPage({ params }: { params: Promise<{ id: string | number }> }) {
    const { id } = await params;
    const { page } = await getPageById(id)

    return (
        <RoleGuard permission='page_update'>

            <Title
                title='Update Page'
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: '/admin' },
                        { label: 'Page', href: '/admin/page' },
                        { label: 'Update Page' },
                    ]
                }
            />
            <Card>
                <FormWrapper
                    href='/admin/page'
                    action={updatePage.bind(null, page?.id)}
                    buttonTitle="Update Page"
                    successMessage="Page Update successfully!"
                >
                    <FormInput
                        label="Title"
                        defaultValue={page?.title}
                        name="title"
                        required
                        placeholder="Enter page content"
                    />
                    <AdditionalInfo
                        defaultValue={page?.content}
                        name='content'
                        title='Content'
                    />
                </FormWrapper>
            </Card>

        </RoleGuard>
    );
}