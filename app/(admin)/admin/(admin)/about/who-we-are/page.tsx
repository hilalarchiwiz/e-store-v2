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
                            label="Enter Who we are Title"
                            required
                            name="title"
                            placeholder="Enter Who we are Title"
                            defaultValue={setting?.title}

                        />
                        <FormTextarea
                            label="Enter Banner Short Description"
                            required
                            placeholder="Enter Banner Short Description"
                            defaultValue={setting?.description}
                        />

                        <FormInput
                            label="Enter Button title"
                            required
                            name="buttonText"
                            placeholder="Enter Button title"
                            defaultValue={setting?.buttonText}

                        />

                        <FormInput
                            label="Enter Button link"
                            required
                            name="link"
                            placeholder="Enter Button link"
                            defaultValue={setting?.link}

                        />
                        <FileUpload defaultImageUrl={setting?.image} />
                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    )
}

export default WhoWeArePage