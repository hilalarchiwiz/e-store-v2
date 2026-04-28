import FormWrapper from "@/components/Admin/Form/FormWrapper"
import { getSetting, updateSettings } from "../../setting/actions/setting.action"
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

const AboutBannerPage = async () => {
    const { setting } = await getSetting('about_banner');
    return (
        <RoleGuard permission="about_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'about_banner', '/admin/about/about-banner')}
                        buttonTitle="Update Banner"
                        successMessage="About Banner update successfully"
                        href="/admin/about/about-banner"
                    >
                        <FormInput
                            label="Enter Banner Title"
                            required
                            name="title"
                            placeholder="Enter Banner Title"
                            defaultValue={setting?.title}

                        />
                        <FormTextarea
                            label="Enter Banner Short Description"
                            required
                            placeholder="Enter Banner Short Description"
                            defaultValue={setting?.description}
                        />

                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    )
}

export default AboutBannerPage