import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import { getSetting, updateSettings } from '../actions/setting.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export default async function SettingsPanelPage() {
    const { setting } = await getSetting('contact_info');
    return (
        <RoleGuard permission="settings_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'contact_info', '/admin/setting/contact-info')}
                        buttonTitle='Update Contact Info'
                        successMessage='General Setting Updated Successfully'
                        href='/admin/setting/contact-info'
                    >
                        <FormInput
                            label='Enter Name'
                            name='name'
                            placeholder='e.g John Doe'
                            defaultValue={setting?.name}
                        />
                        <FormInput
                            label='Phone'
                            name='phone_number'
                            placeholder='+9839839484'
                            defaultValue={setting?.phone_number}
                        />
                        <FormInput
                            label='Address'
                            name='address'
                            placeholder='e.g 7398 Smoke Ranch RoadLas'
                            defaultValue={setting?.address}
                        />
                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    );
}