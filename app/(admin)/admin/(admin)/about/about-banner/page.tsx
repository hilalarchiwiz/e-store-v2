import FormWrapper from "@/components/Admin/Form/FormWrapper"
import { getSetting, updateSettings } from "../../setting/actions/setting.action"
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";
import FileUpload from "@/components/Admin/FileUpload";

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
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h2 className="text-lg font-bold text-gray-900">Hero content</h2>
                            <p className="mt-1 text-sm text-gray-500">Use a new line in the title to control the desktop line break.</p>
                        </div>
                        <FormTextarea
                            label="Hero title"
                            required
                            name="title"
                            placeholder={'Our Story.\nOur Promise.'}
                            defaultValue={setting?.title}
                        />
                        <FormInput
                            label="Hero subtitle"
                            required
                            name="subtitle"
                            placeholder="QAAM.PK is redefining the way Pakistan shops for technology."
                            defaultValue={setting?.subtitle}
                        />
                        <FormTextarea
                            label="Hero description"
                            required
                            name="description"
                            placeholder="Describe QAAM's promise to customers"
                            defaultValue={setting?.description}
                        />
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormInput label="Button text" required name="buttonText" placeholder="Shop Our Products" defaultValue={setting?.buttonText} />
                            <FormInput label="Button link" required name="link" placeholder="/shop" defaultValue={setting?.link} />
                        </div>
                        <FormInput label="Video URL (optional)" name="videoUrl" type="url" placeholder="https://youtube.com/..." defaultValue={setting?.videoUrl} />

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h2 className="text-lg font-bold text-gray-900">Hero media collage</h2>
                            <p className="mt-1 text-sm text-gray-500">Upload all five images for the best result. Landscape images work best.</p>
                        </div>
                        <div className="grid gap-6 xl:grid-cols-2">
                            <FileUpload name="image" title="Main laptop image" defaultImageUrl={setting?.image} />
                            <FileUpload name="image2" title="Mobile technology image" defaultImageUrl={setting?.image2} />
                            <FileUpload name="image3" title="Computer setup image" defaultImageUrl={setting?.image3} />
                            <FileUpload name="image4" title="Accessories image" defaultImageUrl={setting?.image4} />
                            <FileUpload name="image5" title="Story video cover" defaultImageUrl={setting?.image5} />
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h2 className="text-lg font-bold text-gray-900">Newsletter</h2>
                        </div>
                        <FormInput label="Newsletter title" name="newsletterTitle" placeholder="Stay Updated with QAAM" defaultValue={setting?.newsletterTitle} />
                        <FormTextarea
                            label="Newsletter description"
                            name="newsletterDescription"
                            placeholder="Subscribe for the latest deals, new arrivals and exclusive offers."
                            defaultValue={setting?.newsletterDescription}
                        />

                    </FormWrapper>
                </div>
            </div>
        </RoleGuard>
    )
}

export default AboutBannerPage
