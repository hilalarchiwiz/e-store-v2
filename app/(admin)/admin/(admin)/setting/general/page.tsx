import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import { getSetting, updateSettings } from '../actions/setting.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export default async function SettingsPanelPage() {
    const { setting } = await getSetting('general_setting');
    return (
        <RoleGuard permission="settings_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'general_setting', '/admin/setting/general')}
                        buttonTitle='Update General Setting'
                        successMessage='General Setting Updated Successfully'
                        href='/admin/setting/general'
                    >
                        <FormInput
                            label='Enter 24/7 Support Number'
                            name='support_number'
                            placeholder='+93838484748'
                            defaultValue={setting?.support_number}
                        />
                        <FormInput
                            label='Home location address'
                            name='home_address_location'
                            placeholder='e.g, 685 Market Street,Las Vegas'
                            defaultValue={setting?.home_address_location}
                        />
                        <FormInput
                            label='Home location number'
                            name='home_number'
                            placeholder='+93838484748'
                            defaultValue={setting?.home_number}
                        />
                        <FormInput
                            label='Home support email'
                            name='support_email'
                            placeholder='support@gmail.com'
                            defaultValue={setting?.support_email}
                        />
                        <FormInput
                            label='Footer copyright text'
                            name='footer_text'
                            placeholder='All right reserved by qaam'
                            defaultValue={setting?.footer_text}
                        />
                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    );
}