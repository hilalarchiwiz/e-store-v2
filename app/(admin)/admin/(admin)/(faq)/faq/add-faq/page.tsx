import AddButton from '@/components/Admin/Buttons/AddButton';
import Title from '@/components/Admin/Typography/Title';
import SubTitle from '@/components/Admin/Typography/SubTitle';
import FormInput from '@/components/Admin/Form/Input';
import AdditionalInfo from '@/components/Admin/AdditionalInfo';
import FormWrapper from '@/components/Admin/Form/FormWrapper';
import { createFaq } from '../action/faq.action';
import Card from '@/components/Admin/Common/Card';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Add Faq Management - list',
    };
}

export default async function AddFaqPage() {

    return (
        <RoleGuard permission='faq_create'>
            <Title
                title='Add Faq'
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: '/admin' },
                        { label: 'Faq', href: '/admin/faq' },
                        { label: 'Add Faq' },
                    ]
                }
            />
            <Card>
                <FormWrapper
                    action={createFaq}
                    buttonTitle="Create FAQ"
                    href='/admin/faq'
                    successMessage="FAQ created successfully!"
                >
                    <FormInput
                        label="Question *"
                        name="question"
                        placeholder="Enter Faq Question"
                    />
                    <AdditionalInfo
                        name='answer'
                        title='Answer'
                    />
                </FormWrapper>
            </Card>
        </RoleGuard>
    );
}