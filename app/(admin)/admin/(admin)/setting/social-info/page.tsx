import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import { getSetting, updateSettings } from '../actions/setting.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export default async function SettingsPanelPage() {
    const { setting } = await getSetting('social_info');
    return (
        <RoleGuard permission="settings_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'social_info', '/admin/setting/social-info')}
                        buttonTitle='Update Social Info'
                        successMessage='General Setting Updated Successfully'
                        href='/admin/setting/social-info'
                    >
                        <FormInput
                            label='Enter Facebook url'
                            type='url'
                            name='facebook_url'
                            placeholder='e.g https://www.facebook.com/'
                            defaultValue={setting?.facebook_url}
                        />
                        <FormInput
                            label='Enter Instagram url'
                            type='url'
                            name='instagram_url'
                            placeholder='e.g https://www.instagram.com/'
                            defaultValue={setting?.instagram_url}
                        />
                        <FormInput
                            label='Enter Twitter url'
                            type='url'
                            name='twitter_url'
                            placeholder='e.g https://www.twitter.com/'
                            defaultValue={setting?.twitter_url}
                        />
                        <FormInput
                            label='Enter Linkedin url'
                            type='url'
                            name='linkedin_url'
                            placeholder='e.g https://www.linkedin.com/'
                            defaultValue={setting?.linkedin_url}
                        />
                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    );
}