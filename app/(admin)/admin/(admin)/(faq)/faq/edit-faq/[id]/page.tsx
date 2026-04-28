import AddButton from '@/components/Admin/Buttons/AddButton';
import Title from '@/components/Admin/Typography/Title';
import SubTitle from '@/components/Admin/Typography/SubTitle';
import FormInput from '@/components/Admin/Form/Input';
import AdditionalInfo from '@/components/Admin/AdditionalInfo';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import { createFaq, getFaqById, updateFaq } from '../../action/faq.action';
import Card from '@/components/Admin/Common/Card';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Update Faq Management - list',
    };
}

export default async function EditFaqPage({ params }: { params: Promise<{ id: string | number }> }) {
    const { id } = await params;
    const { faq } = await getFaqById(id)

    return (
        <RoleGuard permission='faq_update'>

            <Title
                title='Update Faq'
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: '/admin' },
                        { label: 'Faq', href: '/admin/faq' },
                        { label: 'Update Faq' },
                    ]
                }
            />
            <Card>
                <FormWrapper
                    href='/admin/faq'
                    action={updateFaq.bind(null, faq?.id)}
                    buttonTitle="Update FAQ"
                    successMessage="FAQ created successfully!"
                >
                    <FormInput
                        label="Question *"
                        defaultValue={faq?.question}
                        name="question"
                        placeholder="Enter Faq Question"
                    />
                    <AdditionalInfo
                        defaultValue={faq?.answer}
                        name='answer'
                        title='Answer'
                    />
                </FormWrapper>
            </Card>

        </RoleGuard>
    );
}