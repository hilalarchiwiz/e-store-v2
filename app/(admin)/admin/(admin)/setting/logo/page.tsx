import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import { getSetting, updateSettings } from '../actions/setting.action';
import FileUpload from '@/components/Admin/FileUpload';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export default async function SettingsPanelPage() {
    const { setting } = await getSetting('logo');
    return (
        <RoleGuard permission="settings_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'logo', '/admin/setting/logo')}
                        buttonTitle='Update Logo'
                        successMessage='General Setting Updated Successfully'
                        href='/admin/setting/logo'
                    >
                        <FileUpload title="Upload logo" defaultImageUrl={setting?.logo} name="logo" />
                        <FileUpload title="Upload Favicon" defaultImageUrl={setting?.favicon} name="favicon" />
                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    );
}