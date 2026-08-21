import FormWrapper from "@/components/Admin/Form/FormWrapper"
import { getSetting, updateSettings } from "../../setting/actions/setting.action"
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import FileUpload from "@/components/Admin/FileUpload";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

const WhoWeArePage = async () => {
    const { setting } = await getSetting('about_who_we_are');
    return (
        <RoleGuard permission="about_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'about_who_we_are', '/admin/about/who-we-are')}
                        buttonTitle="Update Who We Are"
                        successMessage="About Who we are update successfully"
                        href="/admin/about/who-we-are"
                    >
                        <FormInput
                            label="Section label"
                            required
                            name="eyebrow"
                            placeholder="WHO WE ARE"
                            defaultValue={setting?.eyebrow}
                        />
                        <FormInput
                            label="Section title"
                            required
                            name="title"
                            placeholder="Trusted Refurbished Tech. Built for Pakistan."
                            defaultValue={setting?.title}

                        />
                        <FormTextarea
                            label="Main description"
                            required
                            name="description"
                            placeholder="Describe who QAAM is and how customers benefit"
                            defaultValue={setting?.description}
                        />
                        <FormTextarea
                            label="Additional description (optional)"
                            name="secondaryDescription"
                            placeholder="Add a second paragraph if needed"
                            defaultValue={setting?.secondaryDescription}
                        />
                        <FileUpload defaultImageUrl={setting?.image} title="Team or showroom image" />
                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    )
}

export default WhoWeArePage
